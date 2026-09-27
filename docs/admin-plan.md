# 雅育鸿针织厂 管理后台 实施规划

> 状态：已确认（Neon Postgres、Cloudflare R2、单管理员、多语种含俄语）。按本文件实现，不做多租户、不做代理商系统。

## 0. 站点事实（来自已部署前台，原样使用）

| 项 | 值 |
|---|---|
| 网站名称 | 雅育鸿针织厂 / Yayuhong Knitwear |
| 正式域名 | `https://xiuyuknit.com`（`www` 为 CNAME 别名，统一 301 到无 www） |
| 公司正式名称 | 澄海雅育鸿针织厂 |
| 行业与主营 | 针织服装 OEM/ODM：毛衣、家居服、童装、宠物服、针织配饰 |
| 目标市场 | 海外 B2B，俄罗斯为主要市场，兼顾欧美、日韩、东南亚 |
| 前台语言 | 主流多语种 `zh`（默认）、`en`、`ru`、`es`、`de`、`fr`、`pt`、`ja`、`ar`；`ru` 为 SEO 优先语种。UI 文案翻译，事实数据不增改 |
| 已知事实 | 20 年经验、日产 30,000 件、MOQ 50 件、7 天打样 |
| 现有内容来源 | 无数据库/CMS，前台为静态文案 → 采用「后台自建内容库」，预留 `content_sync_sources` 同步接口 |
| 禁用词 | 质保、保修、warranty、guarantee 及同义承诺。生成与导入时正则过滤并改写为中性事实 |

## 1. 关键假设（需确认）

1. 数据库：Neon Postgres（Vercel Marketplace 集成，免费档足够；本地无 psql/docker，不做本地库）。驱动 `postgres`（postgres.js）+ 手写 SQL 迁移，不引入 ORM。
2. 对象存储：Cloudflare R2（S3 兼容，`@aws-sdk/client-s3`），Bucket 开公开访问或绑定自定义域，库内只存绝对 HTTPS URL（`R2_PUBLIC_BASE_URL/<key>`）。
3. 密钥加密：`integration_secrets` 用 AES-256-GCM，密钥来自环境变量 `CONFIG_ENCRYPTION_KEY`。
4. 后台会话：单管理员，`ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH`（argon2id，用脚本生成），会话为 HttpOnly Cookie（HMAC 签名，`ADMIN_SESSION_SECRET`）。
5. middleware matcher 排除 `/admin`、`/api`、`/llms.txt`、`/sitemap.xml`、`/robots.txt`，前台其余不变。
6. 前台视觉不变，仅将产品/文章列表数据源改为同库读取已发布内容；样式、布局、文案组件不动。
7. `NEXT_PUBLIC_SITE_URL` 设为 `https://xiuyuknit.com`，并修正 sitemap/robots 现有回退值 `yayuhong.com`。

## 2. 路由清单

### 2.1 后台页面（`/admin`，全部 `noindex`，登录保护）

| 路由 | 说明 |
|---|---|
| `/admin/login` | 登录（唯一无需会话页） |
| `/admin` | 概览：待审文章、追踪关键词、30 天点击、平均排名、GA4 近 7 天、GEO 7 天可见性、各接入状态（未接通不显示 0） |
| `/admin/content/products` `/new` `/[id]` | 产品列表/新建/编辑 |
| `/admin/content/categories` | 分类（父子级） |
| `/admin/content/articles` `/new` `/[id]` | 文章 |
| `/admin/content/inquiries` | 询盘只读列表 |
| `/admin/content/site` | 站点设置 |
| `/admin/seo/drafts` `/[id]` | 文章草稿（pending_review / scheduled / published / rejected） |
| `/admin/seo/keywords` | 关键词库 + 7 天位置变化 |
| `/admin/seo/gsc` | GSC 状态、TXT 记录、立即同步、重新提交 sitemap |
| `/admin/seo/indexing` | 收录管理 |
| `/admin/seo/optimizations` | 优化日志 + 优化建议（待确认项） |
| `/admin/geo/llms` | llms.txt 预览、重新生成、可访问性检测 |
| `/admin/geo/visibility` | AI 可见性（未配引擎显示空态） |
| `/admin/data/ga4` | GA4 趋势/国家/热门页面/外链 |
| `/admin/data/reports` | 月报列表（空态说明原因） |
| `/admin/settings/onboarding` | 接入向导 9 步 |
| `/admin/settings/onboarding/bootstrap` | 一键启动：建议确认 + 初始化报告 |
| `/admin/settings/automation` | 配额、发布模式、风格配额、GEO 预算、收录开关 |
| `/admin/settings/notifications` | 飞书 / 邮件 Webhook |
| `/admin/settings/jobs` | 运行日志 job_runs + 每个任务「立即运行」 |

### 2.2 后台 API（`/api/admin/*`，会话校验）

| 路由 | 方法 | 说明 |
|---|---|---|
| `/api/admin/auth/login` `/logout` | POST | 登录/登出 |
| `/api/admin/products` `/[id]` | GET/POST/PUT/DELETE | 产品 CRUD |
| `/api/admin/categories` `/[id]` | 同上 | 分类 |
| `/api/admin/articles` `/[id]` | 同上 | 文章 |
| `/api/admin/articles/[id]/publish` | POST | 发布 → 写 canonical/OG/JSON-LD → 提交 sitemap → 请求收录 |
| `/api/admin/inquiries` `/[id]/read` | GET / POST | 询盘、标记已读 |
| `/api/admin/site` | GET/PUT | 站点设置 |
| `/api/admin/upload` | POST | 上传到 R2，返回 URL；`?replace=oldUrl` 时先写库成功后删旧文件 |
| `/api/admin/integrations/[key]` | GET/PUT/DELETE | 保存密钥（只回显掩码与状态） |
| `/api/admin/integrations/[key]/test` | POST | 检测连接：llm / google / ga4 / cloudflare / perplexity / openai / serpapi / notify / content_source |
| `/api/admin/onboarding` | GET/PUT | 向导步骤状态（含跳过 = 待接入） |
| `/api/admin/bootstrap/suggest` | POST | 一键启动第一段：LLM 生成关键词种子/国家/竞品/口吻 |
| `/api/admin/bootstrap/apply` | POST | 用户确认后：写 seo_config、GSC 流程、llms.txt、首批文章、返回初始化报告 |
| `/api/admin/seo/drafts` `/[id]` `/[id]/approve|reject|schedule` | GET/PUT/POST | 草稿操作 |
| `/api/admin/seo/generate` | POST | 手动触发文章流水线（与 Cron 同函数） |
| `/api/admin/seo/keywords` `/[id]` | GET/POST/DELETE | 关键词 |
| `/api/admin/seo/gsc/sync` `/resubmit-sitemap` `/verify` | POST | 立即同步 / 重新提交 / 重试验证 |
| `/api/admin/seo/indexing` `/[id]/request` | GET / POST | 收录列表筛选、单条请求 |
| `/api/admin/seo/optimizations/[id]/apply` | POST | 人工确认后执行「优化建议」 |
| `/api/admin/geo/queries` `/[id]` | GET/POST/DELETE | 监测问题 |
| `/api/admin/geo/run` | POST | 手动运行，≤10 问题 |
| `/api/admin/geo/llms/regenerate` `/check` | POST | 再生成 / 检测 200 且内容匹配 |
| `/api/admin/ga4/summary` | GET | 7/30 天、国家、热门页 |
| `/api/admin/reports/[id]` | GET | 月报详情（R2 URL） |
| `/api/admin/jobs/run` | POST | `{ job }` 手动触发同一套 Cron 代码，写 job_runs |

### 2.3 定时任务（`/api/cron/*`，校验 `Authorization: Bearer CRON_SECRET`，返回 JSON 摘要，单步失败不阻断）

| 路由 | Vercel Cron | 任务 |
|---|---|---|
| `/api/cron/gsc-sync` | `0 6 * * *` | 同步过去 3 天 Search Analytics，新查询入库 source=gsc |
| `/api/cron/ga4-sync` | `30 6 * * *` | 同步昨天访客/浏览量（按域名过滤） |
| `/api/cron/indexing` | `0 7 * * *` | sitemap 同步、URL Inspection 抽样、按限额 Indexing API |
| `/api/cron/site-scan` | `30 7 * * *` | 技术扫描 + 安全项自动修复 + llms.txt |
| `/api/cron/geo-monitor` | `0 8 * * *` | GEO 监测（受月预算） |
| `/api/cron/publish-due` | `*/15 * * * *` | 发布到期草稿 → sitemap 提交 → 收录请求 |
| `/api/cron/monthly-generate` | `0 3 1 * *` | 按配额生成文章 |
| `/api/cron/monthly-report` | `0 9 1 * *` | 生成上月 HTML 月报 → R2 → 通知 |

> Vercel Hobby 计划 Cron 仅支持每天一次；`*/15` 需 Pro 计划或外部调度器（cron-job.org 带同一 CRON_SECRET）。实现时 `vercel.json` 全量写入，README 注明。

### 2.4 公开路由

| 路由 | 说明 |
|---|---|
| `/llms.txt` | 动态生成，公司、产品、关键页面、文章绝对 URL |
| `/sitemap.xml` | 改为动态：静态页 + 已发布产品 + 已发布文章 × 全部 9 语种，每条带 `xhtml:link hreflang` 互链与 `x-default` |
| `/robots.txt` | disallow `/admin/` `/api/` `/_next/` `/*/draft/`；sitemap 指向正式域名 |
| `/api/public/products` `/articles` `/articles/[slug]` | 只读公开接口，仅返回已发布内容，`Cache-Control: s-maxage` |
| `/api/public/inquiry` | POST，前台联系表单写入 inquiries（速率限制） |
| `/[locale]/articles` `/[locale]/articles/[slug]` | 新增前台文章页，复用现有 Header/Footer 样式，不改动现有页面 |

## 3. 表结构（Postgres，`migrations/*.sql`）

通用字段：`id uuid pk default gen_random_uuid()`、`created_at`、`updated_at timestamptz default now()`。多语言字段类型为 `jsonb`，键为语种码 `zh|en|ru|es|de|fr|pt|ja|ar`，形如 `{"zh":"...","en":"...","ru":"..."}`，至少含默认语言 `zh`；缺失语种前台回退到 `en` 再回退 `zh`。

```sql
-- 站点与配置
site_profile(id, site_name jsonb, company_name text, domain text, default_locale text, logo_url text,
             contact jsonb, intro jsonb, brand_voice text, google_verification text)
seo_config(id, enabled bool, keyword_seeds text[], target_countries text[], competitor_domains text[],
           brand_voice text, writing_locale text default 'en', -- 文章主写作语种
           target_locales text[] default '{en,ru,zh}', -- 每篇文章需产出的语种（ru 优先）
           monthly_articles int check 0..20 default 4,
           publish_mode text check in ('auto','review') default 'auto',
           style_quota jsonb -- {"technical":1,"buying_guide":1,"application":1,"trend":1}
           , geo_monthly_budget_usd numeric, indexing_enabled bool, onboarding_steps jsonb)
integration_secrets(id, key text unique, -- llm|google_sa|ga4|cloudflare|perplexity|openai|serpapi|notify|content_source
           ciphertext bytea, iv bytea, tag bytea, masked text, meta jsonb, status text, last_tested_at, last_error text)
content_sync_sources(id, type text, config_encrypted bytea, last_sync_at, status text)  -- 预留同步接口

-- 内容
content_categories(id, parent_id uuid fk, name jsonb, slug text unique, sort int)
content_products(id, category_id fk, name jsonb, model text, slug text unique, summary jsonb, detail_html jsonb,
           features jsonb, applications jsonb, advantages jsonb, specs jsonb, cover_url text, gallery_urls text[],
           is_active bool, sort int)
content_articles(id, title jsonb, slug text unique, excerpt jsonb, content_html jsonb, cover_url text,
           meta_description jsonb, supporting_keywords text[], faq_schema jsonb, article_schema jsonb,
           locale text, status text check in ('draft','published'), published_at, source text -- manual|seo_pipeline
           , draft_id uuid)
inquiries(id, name, email, phone, company, subject, message, locale, ip, is_read bool, created_at)

-- SEO 流水线
seo_generation_runs(id, trigger text, -- manual|cron|bootstrap
           triggered_by text, model text, prompt_hash text, requested int, succeeded int, failed int,
           prompt_tokens int, completion_tokens int, cost_usd numeric, error text, started_at, finished_at)
seo_article_drafts(id, run_id fk, style text, title, slug, excerpt, content_html, meta_description,
           supporting_keywords text[], faq_schema jsonb, article_schema jsonb, human_review_flags jsonb,
           cover_url text, cover_product_id fk, cover_missing bool,
           status text check in ('pending_review','scheduled','published','rejected'),
           scheduled_at, published_at, article_id fk, locale text)
seo_keywords(id, keyword text, locale text, country text, source text -- seed|llm|gsc|manual
           , is_tracked bool, unique(keyword, country))
seo_keyword_rankings(id, keyword_id fk, date date, position numeric, impressions int, clicks int, ctr numeric,
           best_url text, unique(keyword_id, date))
seo_gsc_properties(id, property text, -- sc-domain:xiuyuknit.com
           status text check in ('pending_dns','pending_verification','verified','failed'),
           txt_name text, txt_value text, cloudflare_record_id text, verified_at, sitemap_submitted_at,
           last_sync_at, last_error text)
seo_daily_metrics(id, date date unique, impressions int, clicks int, ctr numeric, avg_position numeric)
seo_indexed_urls(id, url text unique, url_type text, -- home|product|article|other
           in_sitemap bool, missing_since, inspection_status text, coverage_state text, last_inspected_at,
           last_index_request_at, request_count int, last_error text)
seo_optimization_logs(id, url text, kind text, -- title|meta|jsonld|canonical|internal_link|llms|suggestion
           auto bool, status text, -- applied|pending_confirm|failed|todo
           before jsonb, after jsonb, error text, applied_at)
seo_sitemap_submissions(id, sitemap_url, status, response text, created_at)  -- 验收第 5 条需要记录

-- GEO
geo_projects(id, brand_name, domain, engines text[], monthly_budget_usd numeric, enabled bool)
geo_queries(id, project_id fk, question text, enabled bool)
geo_monitor_runs(id, project_id fk, trigger text, engine_count int, query_count int, cost_usd numeric,
           status text, error text, started_at, finished_at)
geo_monitor_results(id, run_id fk, query_id fk, engine text, mentioned bool, position int,
           cited_urls text[], answer_excerpt text, cost_usd numeric, raw jsonb)

-- 数据
ga4_daily_metrics(id, date date, country text, page_path text, users int, pageviews int,
           unique(date, country, page_path))
seo_monthly_reports(id, month date unique, html_url text, summary jsonb, notified_at, status text, error text)

-- 运行
job_runs(id, job text, trigger text, -- cron|manual
         triggered_by text, status text, -- running|success|partial|failed
         success_count int, failure_count int, cost_usd numeric, summary jsonb, error text, started_at, finished_at)
admin_sessions(id, token_hash text unique, expires_at)
audit_logs(id, actor text, action text, target text, detail jsonb, created_at)
```

索引：`content_articles(status, published_at)`、`seo_article_drafts(status, scheduled_at)`、`seo_indexed_urls(inspection_status)`、`seo_keyword_rankings(date)`、`ga4_daily_metrics(date)`、`geo_monitor_results(run_id)`、`job_runs(job, started_at desc)`。

## 4. 环境变量清单

| 变量 | 必填 | 说明 |
|---|---|---|
| `DATABASE_URL` | 是 | Neon Postgres 连接串（含 `sslmode=require`） |
| `NEXT_PUBLIC_SITE_URL` | 是 | `https://xiuyuknit.com` |
| `CRON_SECRET` | 是 | Cron 请求头校验；Vercel 会自动注入到 Cron 请求 |
| `ADMIN_EMAIL` | 是 | 管理员登录邮箱 |
| `ADMIN_PASSWORD_HASH` | 是 | argon2id 哈希，用 `npm run admin:hash -- <密码>` 生成 |
| `ADMIN_SESSION_SECRET` | 是 | 会话签名密钥，≥32 字节随机 |
| `CONFIG_ENCRYPTION_KEY` | 是 | 32 字节 base64，加密 integration_secrets |
| `R2_ACCOUNT_ID` | 是 | Cloudflare 账号 ID，endpoint `https://<id>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | 是 | R2 API Token 的 Access Key |
| `R2_SECRET_ACCESS_KEY` | 是 | R2 API Token 的 Secret Key |
| `R2_BUCKET` | 是 | Bucket 名称 |
| `R2_PUBLIC_BASE_URL` | 是 | Bucket 公开访问域名，如 `https://cdn.xiuyuknit.com` 或 `https://pub-xxx.r2.dev` |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | 否 | 前台仅注入 `G-` ID；也可留空由后台配置表提供 |

以下均**不**放环境变量，只存 `integration_secrets`（加密）由向导写入：LLM Base URL/Key/模型、Google 服务账号 JSON、GA4 Property ID、Cloudflare Token/Zone、Perplexity/OpenAI/SerpAPI Key、飞书/邮件 Webhook、内容源连接串。

## 5. 新增依赖

`postgres`、`@aws-sdk/client-s3`、`argon2`（或 `@node-rs/argon2`）、`googleapis`（GSC/Indexing/GA4 Data）、`zod`、`cheerio`（站点扫描解析）、`slugify`。LLM 与 GEO 引擎用原生 `fetch`，不引 SDK。

## 6. 对现有前台的最小改动

- `middleware.ts`：matcher 排除 `admin|api|llms.txt|sitemap.xml|robots.txt`
- `src/app/sitemap.ts` `robots.ts`：动态化 + 域名回退改 `xiuyuknit.com`
- `next.config.ts`：`images.remotePatterns` 加 R2 公开域名（从 `R2_PUBLIC_BASE_URL` 读取）
- `src/i18n/routing.ts`：locales 扩展为 `zh,en,ru,es,de,fr,pt,ja,ar`，新增对应 `messages/*.json`（UI 文案翻译，事实数据不变）；`ar` 页面 `dir="rtl"`
- `ProductShowcase.tsx`：数据源改为同库已发布产品，视觉不变，无数据时回退现有 6 张静态图
- `ContactForm.tsx`：提交到 `/api/public/inquiry`
- `[locale]/layout.tsx`：`verification.google` 从 site_profile 读取
- 新增 `[locale]/articles` 页面

## 7. 验收对照

规格 10 条验收全部映射到上表路由；实现完成后在 `docs/acceptance.md` 逐条记录验证方式与结果。
