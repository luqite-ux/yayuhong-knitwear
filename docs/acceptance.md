# 验收清单

## 1. 数据库与迁移
- [ ] `npm run migrate` 执行成功，26 张表全部创建
- [ ] `site_profile` 和 `seo_config` 单例种子行存在
- [ ] `schema_migrations` 表有 `0001_init.sql` 记录

## 2. 后台登录
- [ ] `npm run admin:hash -- "<密码>"` 输出 `ADMIN_PASSWORD_HASH=...`
- [ ] 环境变量 `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` / `ADMIN_SESSION_SECRET` / `CONFIG_ENCRYPTION_KEY` 已配置
- [ ] `/admin/login` 用正确凭据登录成功，跳转到 `/admin`
- [ ] 未登录访问 `/admin` 自动跳转到 `/admin/login`
- [ ] 退出登录后 Cookie 清除，重定向到登录页

## 3. 接入向导
- [ ] 9 步向导可逐步填写并保存
- [ ] LLM「检测连接」按钮返回成功
- [ ] Google 服务账号 JSON 格式验证通过
- [ ] Cloudflare API Token + Zone ID 检测成功
- [ ] 可选步骤（Cloudflare/GEO/通知）可跳过，状态显示「已跳过」
- [ ] 完成最后一步后 `seo_config.enabled = true`

## 4. 内容管理
- [ ] 产品 CRUD 正常：新增/编辑/删除/上下架
- [ ] 多语言字段（中文/英文/俄文）可填写并正确回退
- [ ] R2 上传图片成功，返回公开 URL
- [ ] 分类 CRUD 正常，支持父子级
- [ ] 询盘列表展示，未读标记正确
- [ ] 站点设置保存成功

## 5. 公开接口与前台
- [ ] `GET /api/public/products` 返回产品列表（按语言过滤）
- [ ] `GET /api/public/articles` 返回已发布文章列表
- [ ] `GET /api/public/articles/[slug]` 返回文章详情
- [ ] `POST /api/public/inquiry` 提交询盘成功
- [ ] `GET /llms.txt` 返回纯文本内容
- [ ] `/[locale]/articles` 列表页正常渲染
- [ ] `/[locale]/articles/[slug]` 详情页含 JSON-LD（Article/BreadcrumbList/FAQPage）
- [ ] 9 种语言切换正常，阿拉伯语 `dir="rtl"`
- [ ] sitemap.xml 含 9 语种 hreflang alternates
- [ ] robots.txt 禁止 `/admin`、`/api`

## 6. SEO 文章流水线
- [ ] 一键启动（bootstrap）：生成关键词种子、目标国家、竞品域名写入 `seo_config`
- [ ] 手动生成文章：LLM 返回 JSON 格式草稿，写入 `seo_article_drafts`
- [ ] 有 `human_review_flags` 的草稿状态为 `pending_review`（即使自动模式）
- [ ] 无 `cover_missing` 且无待审标记的草稿自动 `scheduled`
- [ ] Cron `/api/cron/publish-due` 发布到期草稿，写入 `content_articles`
- [ ] `seo_generation_runs` 记录 token 数和费用

## 7. GSC
- [ ] 一键启动后自动添加 `sc-domain:xiuyuknit.com` 资源
- [ ] 有 Cloudflare Token 时自动写入 TXT 验证记录
- [ ] 验证成功后提交 sitemap
- [ ] Cron 同步过去 3 天搜索分析数据到 `seo_daily_metrics` 和 `seo_keyword_rankings`
- [ ] 新查询自动入 `seo_keywords`（source=gsc）
- [ ] 后台显示验证状态/上次同步/错误

## 8. 收录管理
- [ ] Cron 抓取 sitemap 更新 `seo_indexed_urls`
- [ ] URL Inspection API 抽样检测（每次 10 条）
- [ ] Indexing API 提交 URL（单站 ≤50/天）
- [ ] 后台显示 URL 收录状态

## 9. GEO / GA4 / 月报
- [ ] GEO 监测：按配置引擎查询，记录提及/位置/费用
- [ ] 未配置引擎时显示空态
- [ ] GA4 同步昨天的访客/浏览量（按国家/页面）
- [ ] 未配置 GA4 时显示「未接通」
- [ ] 月报每月 1 日生成 HTML，上传 R2，记录到 `seo_monthly_reports`

## 10. Cron 与外部调度
- [ ] `vercel.json` 配置 3 个 Cron：daily(6:00)、monthly-generate(1日3:00)、monthly-report(1日9:00)
- [ ] 所有 Cron 路由验证 `CRON_SECRET`，未授权返回 401
- [ ] `/api/cron/daily` 顺序执行 GSC/GA4/收录/站点扫描/GEO
- [ ] `/api/cron/publish-due`（每 15 分钟）需通过 cron-job.org 外部调度器触发
- [ ] `job_runs` 表记录每个任务的执行状态/成功数/失败数/费用
- [ ] `audit_logs` 记录所有手动操作

## 部署步骤

```bash
# 1. 安装依赖
npm install

# 2. 生成管理员密码哈希
npm run admin:hash -- "你的密码"

# 3. 配置环境变量（Vercel Dashboard 或 .env）
#    DATABASE_URL=postgresql://...@neon.tech/dbname?sslmode=require
#    NEXT_PUBLIC_SITE_URL=https://xiuyuknit.com
#    ADMIN_EMAIL=admin@xiuyuknit.com
#    ADMIN_PASSWORD_HASH=<上一步输出>
#    ADMIN_SESSION_SECRET=<openssl rand -base64 48>
#    CONFIG_ENCRYPTION_KEY=<openssl rand -base64 32>
#    CRON_SECRET=<openssl rand -hex 32>
#    R2_ACCOUNT_ID=...
#    R2_ACCESS_KEY_ID=...
#    R2_SECRET_ACCESS_KEY=...
#    R2_BUCKET=...
#    R2_PUBLIC_BASE_URL=https://media.xiuyuknit.com

# 4. 执行数据库迁移
npm run migrate

# 5. 部署
vercel deploy --prod --yes

# 6. 登录后台，完成接入向导

# 7. 配置外部调度器（cron-job.org）
#    每 15 分钟: GET https://xiuyuknit.com/api/cron/publish-due
#    Headers: Authorization: Bearer <CRON_SECRET>
```
