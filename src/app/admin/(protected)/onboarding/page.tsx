'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const STEPS = [
  { id: 'site_identity', label: '站点身份', required: true },
  { id: 'content_source', label: '内容来源', required: true },
  { id: 'llm', label: '大模型', required: true },
  { id: 'google', label: 'Google 服务账号', required: true },
  { id: 'ga4', label: 'GA4 统计', required: false },
  { id: 'cloudflare', label: 'Cloudflare', required: false, optional: true },
  { id: 'geo_engine', label: 'GEO 引擎', required: false, optional: true },
  { id: 'notification', label: '通知', required: false, optional: true },
  { id: 'automation', label: '自动化设置', required: true },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [testResult, setTestResult] = useState<{ ok: boolean; info?: string; error?: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({
    site_identity: { site_name_zh: '', site_name_en: '', domain: 'xiuyuknit.com' },
    content_source: { source_url: 'https://xiuyuknit.com', source_type: 'scrape' },
    llm: { base_url: '', api_key: '', model: 'gpt-4o' },
    google: { service_account_json: '' },
    ga4: { measurement_id: '', property_id: '' },
    cloudflare: { api_token: '', zone_id: '' },
    geo_engine: { engine: 'perplexity', api_key: '' },
    notification: { webhook_url: '', webhook_type: 'feishu', email_host: 'smtp.qq.com', email_port: '465', email_user: '', email_pass: '', email_to: '' },
    automation: {
      monthly_articles: '4',
      publish_mode: 'auto',
      style_technical: '1',
      style_buying_guide: '1',
      style_application: '1',
      style_trend: '1',
      geo_budget: '10',
      indexing_enabled: 'true',
    },
  });

  const loadState = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/onboarding');
      const data = await res.json();
      if (data.profile) {
        let name: Record<string, string> = {};
        if (typeof data.profile.site_name === 'object' && data.profile.site_name) {
          name = data.profile.site_name as Record<string, string>;
        } else if (typeof data.profile.site_name === 'string') {
          try { name = JSON.parse(data.profile.site_name); } catch {}
        }
        setFormData((prev) => ({
          ...prev,
          site_identity: {
            ...prev.site_identity,
            site_name_zh: name.zh || '',
            site_name_en: name.en || '',
            domain: data.profile.domain || 'xiuyuknit.com',
          },
        }));
      }
      if (data.config?.onboarding_steps) {
        let steps: Record<string, boolean> = {};
        if (typeof data.config.onboarding_steps === 'object') {
          steps = data.config.onboarding_steps as Record<string, boolean>;
        } else if (typeof data.config.onboarding_steps === 'string') {
          try { steps = JSON.parse(data.config.onboarding_steps); } catch {}
        }
        setCompleted(steps);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const step = STEPS[currentStep];

  async function saveStep(skip: boolean) {
    setSaving(true);
    setTestResult(null);
    try {
      const isLast = currentStep === STEPS.length - 1;
      const res = await fetch('/api/admin/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: step.id,
          action: isLast && !skip ? 'complete' : 'save',
          data: skip ? null : formData[step.id],
          skip,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTestResult({ ok: false, error: data.error });
        setSaving(false);
        return;
      }
      setCompleted((prev) => ({ ...prev, [step.id]: !skip }));
      if (data.completed) {
        router.push('/admin');
        return;
      }
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } catch {
      setTestResult({ ok: false, error: '网络错误' });
    }
    setSaving(false);
  }

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: step.id }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ ok: false, error: '网络错误' });
    }
    setTesting(false);
  }

  function updateField(field: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [step.id]: { ...prev[step.id], [field]: value },
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">接入向导</h1>
      <p className="text-sm text-gray-500 mb-6">共 9 步，标记「可选」的步骤可跳过。完成后可一键启动自动化。</p>

      {/* Stepper */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(i)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
              i === currentStep
                ? 'bg-blue-600 text-white'
                : completed[s.id]
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <span>{i + 1}</span>
            <span>{s.label}</span>
            {s.optional && <span className="text-[10px] opacity-70">(可选)</span>}
            {completed[s.id] && <span>✓</span>}
          </button>
        ))}
      </div>

      <div className="admin-card max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{step.label}</h2>
        {step.optional && (
          <p className="text-xs text-blue-600 mb-4">此步骤可选，可跳过。</p>
        )}

        {/* Step forms */}
        {step.id === 'site_identity' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">站点名称（中文）</label>
              <input className="admin-input" value={formData.site_identity.site_name_zh}
                onChange={(e) => updateField('site_name_zh', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">站点名称（英文）</label>
              <input className="admin-input" value={formData.site_identity.site_name_en}
                onChange={(e) => updateField('site_name_en', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">域名</label>
              <input className="admin-input" value={formData.site_identity.domain}
                onChange={(e) => updateField('domain', e.target.value)} />
            </div>
          </div>
        )}

        {step.id === 'content_source' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">指定官网地址，系统将抓取现有页面内容导入数据库。也可跳过，之后手动添加。</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">内容来源 URL</label>
              <input className="admin-input" value={formData.content_source.source_url}
                onChange={(e) => updateField('source_url', e.target.value)} />
            </div>
          </div>
        )}

        {step.id === 'llm' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">OpenAI 兼容 API。用于生成 SEO 文章、关键词、竞品分析等。</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Base URL</label>
              <input className="admin-input" placeholder="https://api.openai.com/v1"
                value={formData.llm.base_url}
                onChange={(e) => updateField('base_url', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input className="admin-input" type="password" placeholder="sk-..."
                value={formData.llm.api_key}
                onChange={(e) => updateField('api_key', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">模型</label>
              <input className="admin-input" placeholder="gpt-4o"
                value={formData.llm.model}
                onChange={(e) => updateField('model', e.target.value)} />
            </div>
          </div>
        )}

        {step.id === 'google' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">粘贴 Google Cloud 服务账号 JSON 密钥。用于 GSC、URL Inspection、Indexing API、GA4 Data API。</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">服务账号 JSON</label>
              <textarea className="admin-input" rows={10} placeholder='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
                value={formData.google.service_account_json}
                onChange={(e) => updateField('service_account_json', e.target.value)} />
            </div>
          </div>
        )}

        {step.id === 'ga4' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">GA4 统计配置。Measurement ID 用于前台脚本注入，Property ID 用于数据 API。</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Measurement ID</label>
              <input className="admin-input" placeholder="G-XXXXXXXXXX"
                value={formData.ga4.measurement_id}
                onChange={(e) => updateField('measurement_id', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property ID</label>
              <input className="admin-input" placeholder="123456789"
                value={formData.ga4.property_id}
                onChange={(e) => updateField('property_id', e.target.value)} />
            </div>
          </div>
        )}

        {step.id === 'cloudflare' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">可选。配置后可自动写入 GSC 验证 TXT 记录、提交 sitemap。</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Token</label>
              <input className="admin-input" type="password"
                value={formData.cloudflare.api_token}
                onChange={(e) => updateField('api_token', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zone ID</label>
              <input className="admin-input"
                value={formData.cloudflare.zone_id}
                onChange={(e) => updateField('zone_id', e.target.value)} />
            </div>
          </div>
        )}

        {step.id === 'geo_engine' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">可选。用于 GEO（AI 搜索引擎）可见性监测。</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">引擎</label>
              <select className="admin-input"
                value={formData.geo_engine.engine}
                onChange={(e) => updateField('engine', e.target.value)}>
                <option value="perplexity">Perplexity API</option>
                <option value="openai">复用 LLM (OpenAI 兼容)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input className="admin-input" type="password"
                value={formData.geo_engine.api_key}
                onChange={(e) => updateField('api_key', e.target.value)} />
            </div>
          </div>
        )}

        {step.id === 'notification' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">可选。新询盘、任务完成、错误等通知推送。可同时配置飞书和邮件。</p>

            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-gray-800">💬 飞书通知</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">飞书群机器人 Webhook URL</label>
                <input className="admin-input" placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..."
                  value={formData.notification.webhook_url}
                  onChange={(e) => updateField('webhook_url', e.target.value)} />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-gray-800">📧 邮件通知</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP 服务器</label>
                  <input className="admin-input" placeholder="smtp.qq.com"
                    value={formData.notification.email_host}
                    onChange={(e) => updateField('email_host', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">端口</label>
                  <input className="admin-input" placeholder="465"
                    value={formData.notification.email_port}
                    onChange={(e) => updateField('email_port', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">发件邮箱</label>
                <input className="admin-input" placeholder="your@email.com"
                  value={formData.notification.email_user}
                  onChange={(e) => updateField('email_user', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱授权码/密码</label>
                <input className="admin-input" type="password" placeholder="授权码或密码"
                  value={formData.notification.email_pass}
                  onChange={(e) => updateField('email_pass', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">收件邮箱（留空则发给发件人）</label>
                <input className="admin-input" placeholder="receive@email.com"
                  value={formData.notification.email_to}
                  onChange={(e) => updateField('email_to', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step.id === 'automation' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">配置自动化参数。完成后点击「完成并启动」。</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">月度文章配额 (0-20)</label>
                <input className="admin-input" type="number" min={0} max={20}
                  value={formData.automation.monthly_articles}
                  onChange={(e) => updateField('monthly_articles', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">发布模式</label>
                <select className="admin-input"
                  value={formData.automation.publish_mode}
                  onChange={(e) => updateField('publish_mode', e.target.value)}>
                  <option value="auto">自动发布</option>
                  <option value="review">先审后发</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { key: 'style_technical', label: '技术深度' },
                { key: 'style_buying_guide', label: '采购指南' },
                { key: 'style_application', label: '应用方案' },
                { key: 'style_trend', label: '行业趋势' },
              ].map((s) => (
                <div key={s.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{s.label}</label>
                  <input className="admin-input" type="number" min={0}
                    value={formData.automation[s.key]}
                    onChange={(e) => updateField(s.key, e.target.value)} />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">四种风格配额之和应等于月度配额。</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GEO 月预算 (USD)</label>
                <input className="admin-input" type="number" min={0} step="0.01"
                  value={formData.automation.geo_budget}
                  onChange={(e) => updateField('geo_budget', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">收录提交</label>
                <select className="admin-input"
                  value={formData.automation.indexing_enabled}
                  onChange={(e) => updateField('indexing_enabled', e.target.value)}>
                  <option value="true">开启</option>
                  <option value="false">关闭</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Test result */}
        {testResult && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            testResult.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
            {testResult.ok ? '✓ ' + (testResult.info || '连接成功') : '✗ ' + (testResult.error || '连接失败')}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex gap-2">
            {['llm', 'google', 'ga4', 'cloudflare', 'geo_engine'].includes(step.id) && (
              <button
                onClick={testConnection}
                disabled={testing || saving}
                className="admin-btn admin-btn-secondary"
              >
                {testing ? '检测中...' : '检测连接'}
              </button>
            )}
            {step.optional && (
              <button
                onClick={() => saveStep(true)}
                disabled={saving}
                className="admin-btn admin-btn-secondary"
              >
                跳过
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="admin-btn admin-btn-secondary"
              >
                上一步
              </button>
            )}
            <button
              onClick={() => saveStep(false)}
              disabled={saving}
              className="admin-btn admin-btn-primary"
            >
              {saving ? '保存中...' :
                currentStep === STEPS.length - 1 ? '完成并启动' : '保存并继续'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
