import { NextRequest, NextResponse } from 'next/server';
import { setSecret, updateSecretStatus } from '@/lib/secrets';
import { testLLMConnection, getLLMConfig } from '@/lib/llm';
import { runBootstrap, runGeneration, getSeoConfig, pickTopic } from '@/lib/seo-pipeline';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * 临时维护路由：将 SEO LLM 切换为 DeepSeek 并验证生成链路
 * 认证：Authorization: Bearer <SETUP_TOKEN>
 * 用完即删（连同 SETUP_TOKEN 环境变量）
 */
async function checkAuth(req: NextRequest): Promise<boolean> {
  const token = process.env.SETUP_TOKEN;
  const authHeader = req.headers.get('authorization');
  return !!token && authHeader === `Bearer ${token}`;
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const action = body.action as string;

  try {
    if (action === 'set-llm') {
      const baseUrl = (body.baseUrl as string) || 'https://api.deepseek.com/v1';
      const apiKey = body.apiKey as string;
      const model = (body.model as string) || 'deepseek-chat';
      if (!apiKey) {
        return NextResponse.json({ error: '缺少 apiKey' }, { status: 400 });
      }

      const cfg = JSON.stringify({ baseUrl, apiKey, model });
      await setSecret(
        'llm',
        cfg,
        JSON.stringify({ baseUrl, model }),
        { baseUrl, model },
      );

      const test = await testLLMConnection();
      await updateSecretStatus('llm', test.ok ? 'connected' : 'failed', test.ok ? null : test.error ?? null);

      return NextResponse.json({ ok: true, action, baseUrl, model, test });
    }

    if (action === 'status') {
      const llm = await getLLMConfig();
      return NextResponse.json({
        llm: llm
          ? { configured: true, baseUrl: llm.baseUrl, model: llm.model, apiKeyTail: llm.apiKey?.slice(-4) }
          : { configured: false },
      });
    }

    if (action === 'diag') {
      const { sql } = await import('@/lib/db');
      const cfg = await getSeoConfig();
      const topic = cfg ? await pickTopic(cfg) : null;
      const drafts = await sql`select count(*)::int as n from seo_article_drafts`;
      const articles = await sql`select count(*)::int as n from content_articles`;
      return NextResponse.json({
        keywordSeedsType: Array.isArray(cfg?.keyword_seeds) ? 'array' : typeof cfg?.keyword_seeds,
        keywordSeedsLen: (cfg?.keyword_seeds as unknown[] | undefined)?.length,
        keywordSeedsSample: (cfg?.keyword_seeds as unknown[] | undefined)?.slice(0, 3),
        styleQuota: cfg?.style_quota,
        styleQuotaType: typeof cfg?.style_quota,
        pickedTopic: topic,
        drafts: drafts[0].n,
        articles: articles[0].n,
      });
    }

    if (action === 'bootstrap') {
      const result = await runBootstrap('deepseek-setup');
      return NextResponse.json({ ok: result.ok, result });
    }

    if (action === 'generate') {
      const count = Math.min(Number(body.count) || 1, 5);
      const result = await runGeneration('manual', 'deepseek-setup', count);
      return NextResponse.json({ ok: true, result });
    }

    return NextResponse.json({ error: '未知 action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
