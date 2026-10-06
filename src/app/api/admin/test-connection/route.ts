import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guard';
import { getSecret, getSecretMeta } from '@/lib/secrets';
import { testLLMConnection } from '@/lib/llm';

export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { service } = await req.json();
  if (!service) return NextResponse.json({ error: '缺少 service 参数' }, { status: 400 });

  try {
    if (service === 'llm') {
      const result = await testLLMConnection();
      return NextResponse.json(result);
    }

    if (service === 'google') {
      const json = await getSecret('google');
      if (!json) return NextResponse.json({ ok: false, error: '未配置 Google 服务账号' });
      const creds = JSON.parse(json);
      const required = ['client_email', 'private_key'];
      const missing = required.filter((k) => !creds[k]);
      if (missing.length > 0) {
        return NextResponse.json({ ok: false, error: `缺少字段: ${missing.join(', ')}` });
      }
      return NextResponse.json({
        ok: true,
        info: `服务账号 ${creds.client_email} 格式正确，将在一键启动时验证 GSC 权限`,
      });
    }

    if (service === 'ga4') {
      const raw = await getSecret('ga4');
      if (!raw) return NextResponse.json({ ok: false, error: '未配置 GA4' });
      const cfg = JSON.parse(raw);
      if (!cfg.measurementId || !cfg.propertyId) {
        return NextResponse.json({ ok: false, error: '缺少 Measurement ID 或 Property ID' });
      }
      return NextResponse.json({ ok: true, info: `GA4 Property ${cfg.propertyId} 已保存` });
    }

    if (service === 'cloudflare') {
      const raw = await getSecret('cloudflare');
      if (!raw) return NextResponse.json({ ok: false, error: '未配置 Cloudflare' });
      const cfg = JSON.parse(raw);
      const accountId = process.env.R2_ACCOUNT_ID;
      if (!accountId) return NextResponse.json({ ok: false, error: '缺少 R2_ACCOUNT_ID 环境变量' });
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${cfg.zoneId}`,
        { headers: { Authorization: `Bearer ${cfg.apiToken}` }, signal: AbortSignal.timeout(10000) },
      );
      if (!res.ok) {
        const body = await res.text();
        return NextResponse.json({ ok: false, error: `Cloudflare API ${res.status}: ${body.slice(0, 200)}` });
      }
      const data = await res.json();
      return NextResponse.json({
        ok: true,
        info: `Zone: ${data.result?.name || cfg.zoneId}`,
      });
    }

    if (service === 'geo_engine') {
      const raw = await getSecret('geo_engine');
      if (!raw) return NextResponse.json({ ok: false, error: '未配置 GEO 引擎' });
      const cfg = JSON.parse(raw);
      const meta = await getSecretMeta('geo_engine');
      const engine = (meta?.engine as string) || cfg.engine;

      if (engine === 'perplexity') {
        const res = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
          body: JSON.stringify({ model: 'sonar', messages: [{ role: 'user', content: 'ok' }], max_tokens: 5 }),
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return NextResponse.json({ ok: false, error: `HTTP ${res.status}` });
        return NextResponse.json({ ok: true, info: 'Perplexity API 连通' });
      }

      if (engine === 'openai') {
        const llm = await getSecret('llm');
        if (!llm) return NextResponse.json({ ok: false, error: '需先配置 LLM（OpenAI 兼容）' });
        return NextResponse.json({ ok: true, info: '将复用 LLM 配置' });
      }

      return NextResponse.json({ ok: false, error: `未支持的引擎: ${engine}` });
    }

    return NextResponse.json({ error: `未知服务: ${service}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
