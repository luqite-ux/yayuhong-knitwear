import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guard';
import { getSecret, getSecretMeta, updateSecretStatus, setSecret, maskSecret } from '@/lib/secrets';
import { testLLMConnection } from '@/lib/llm';

type TestResult = { ok: boolean; info?: string; error?: string };

const TESTABLE = ['llm', 'google', 'ga4', 'cloudflare', 'geo_engine', 'notification'];

async function runTest(service: string): Promise<TestResult> {
  if (service === 'llm') {
    return await testLLMConnection();
  }

  if (service === 'google') {
    const json = await getSecret('google');
    if (!json) return { ok: false, error: '未配置 Google 服务账号' };
    const creds = JSON.parse(json);
    const required = ['client_email', 'private_key'];
    const missing = required.filter((k) => !creds[k]);
    if (missing.length > 0) {
      return { ok: false, error: `缺少字段: ${missing.join(', ')}` };
    }
    return {
      ok: true,
      info: `服务账号 ${creds.client_email} 格式正确，将在一键启动时验证 GSC 权限`,
    };
  }

  if (service === 'ga4') {
    const raw = await getSecret('ga4');
    if (!raw) return { ok: false, error: '未配置 GA4' };
    const cfg = JSON.parse(raw);
    if (!cfg.measurementId || !cfg.propertyId) {
      return { ok: false, error: '缺少 Measurement ID 或 Property ID' };
    }
    return { ok: true, info: `GA4 Property ${cfg.propertyId} 已保存` };
  }

  if (service === 'cloudflare') {
    const raw = await getSecret('cloudflare');
    if (!raw) return { ok: false, error: '未配置 Cloudflare' };
    const cfg = JSON.parse(raw);
    const headers = { Authorization: `Bearer ${cfg.apiToken}` };

    // 只验证 Zone 访问权限（R2_ACCOUNT_ID 仅在月报上传时需要，不阻塞连通性检测）
    // 1) 优先用已保存的 zoneId 直取
    if (cfg.zoneId) {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(cfg.zoneId)}`,
        { headers, signal: AbortSignal.timeout(10000) },
      );
      if (res.ok) {
        const data = await res.json();
        return { ok: true, info: `Zone: ${data.result?.name || cfg.zoneId}` };
      }
    }

    // 2) zoneId 无效时按域名反查（真实 DNS 写入流程同样有此回退，见 gsc-dns.ts findZone）
    const host = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com').hostname;
    const labels = host.split('.');
    const tried: string[] = [];
    for (let i = 0; i <= labels.length - 2; i++) {
      const candidate = labels.slice(i).join('.');
      tried.push(candidate);
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(candidate)}`,
        { headers, signal: AbortSignal.timeout(10000) },
      );
      if (!res.ok) {
        const body = await res.text();
        return { ok: false, error: `Cloudflare API ${res.status}: ${body.slice(0, 200)}` };
      }
      const data = await res.json();
      const zone = (data.result || []).find(
        (z: { name?: string }) => z.name?.toLowerCase() === candidate,
      );
      if (zone) {
        const stale = Boolean(cfg.zoneId) && cfg.zoneId !== zone.id;
        if (stale) {
          // 已保存的 zoneId 失效：按域名反查结果自动纠正，避免后续流程依赖名称回退
          cfg.zoneId = zone.id;
          await setSecret('cloudflare', JSON.stringify(cfg), maskSecret(cfg.apiToken), { zoneId: zone.id });
        }
        return {
          ok: true,
          info: `Zone: ${zone.name}${stale ? `（已自动纠正失效的 zoneId → ${zone.id}）` : ''}`,
        };
      }
    }
    return { ok: false, error: `Token 无法访问 ${host} 的 Zone（已尝试: ${tried.join(', ')}）` };
  }

  if (service === 'geo_engine') {
    const raw = await getSecret('geo_engine');
    if (!raw) return { ok: false, error: '未配置 GEO 引擎' };
    const cfg = JSON.parse(raw);
    const meta = await getSecretMeta('geo_engine');
    const engine = (meta?.engine as string) || cfg.engine;

    if (engine === 'perplexity') {
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
        body: JSON.stringify({ model: 'sonar', messages: [{ role: 'user', content: 'ok' }], max_tokens: 16 }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        const body = await res.text();
        return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
      }
      return { ok: true, info: 'Perplexity API 连通' };
    }

    if (engine === 'openai') {
      const llm = await getSecret('llm');
      if (!llm) return { ok: false, error: '需先配置 LLM（OpenAI 兼容）' };
      return { ok: true, info: '将复用 LLM 配置' };
    }

    return { ok: false, error: `未支持的引擎: ${engine}` };
  }

  if (service === 'notification') {
    const raw = await getSecret('notification');
    if (!raw) return { ok: false, error: '未配置通知' };
    const cfg = JSON.parse(raw);
    if (!cfg.url || !/^https?:\/\//.test(cfg.url)) {
      return { ok: false, error: 'Webhook 地址无效' };
    }
    return { ok: true, info: `Webhook 已配置（${cfg.type || 'generic'}）` };
  }

  throw new Error(`未知服务: ${service}`);
}

export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { service } = await req.json();
  if (!service) return NextResponse.json({ error: '缺少 service 参数' }, { status: 400 });
  if (!TESTABLE.includes(service)) {
    return NextResponse.json({ error: `未知服务: ${service}` }, { status: 400 });
  }

  try {
    const result = await runTest(service);
    // 持久化检测结果，让仪表盘如实展示「已连接 / 失败」
    await updateSecretStatus(
      service,
      result.ok ? 'connected' : 'failed',
      result.ok ? null : result.error || '连接失败',
    );
    return NextResponse.json(result);
  } catch (err: any) {
    await updateSecretStatus(service, 'failed', err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
