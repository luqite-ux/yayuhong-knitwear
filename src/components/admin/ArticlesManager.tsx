'use client';

import { useState } from 'react';

interface Article {
  id: string;
  slug: string;
  title: Record<string, string>;
  title_text: string;
  status: string;
  locale: string;
  source: string;
  created_at: Date;
  published_at: Date | null;
  excerpt?: Record<string, string>;
  cover_url?: string | null;
  content_html?: Record<string, string>;
  meta_description?: Record<string, string>;
  supporting_keywords?: string[];
  sites?: string[];
}

export default function ArticlesManager({ articles: initial }: { articles: Article[] }) {
  const [articles] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { ...data, id: editing.id } : data;
      const res = await fetch('/api/admin/articles', {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) { alert(result.error || '保存失败'); setSaving(false); return; }
      setShowForm(false); setEditing(null);
      window.location.reload();
    } catch { alert('网络错误'); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除？')) return;
    await fetch(`/api/admin/articles?id=${id}`, { method: 'DELETE' });
    window.location.reload();
  }

  if (showForm) {
    return (
      <ArticleForm
        article={editing}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditing(null); }}
        saving={saving}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">共 {articles.length} 篇</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="admin-btn admin-btn-primary">+ 新增文章</button>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2 px-3">标题</th>
              <th className="py-2 px-3">状态</th>
              <th className="py-2 px-3">来源</th>
              <th className="py-2 px-3">语言</th>
              <th className="py-2 px-3">发布时间</th>
              <th className="py-2 px-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-3 font-medium text-gray-900">{a.title_text || a.slug}</td>
                <td className="py-2 px-3">
                  <span className={`admin-badge ${a.status === 'published' ? 'admin-badge-green' : 'admin-badge-gray'}`}>
                    {a.status === 'published' ? '已发布' : '草稿'}
                  </span>
                </td>
                <td className="py-2 px-3 text-gray-600">{a.source === 'seo_pipeline' ? 'SEO流水线' : '手动'}</td>
                <td className="py-2 px-3 text-gray-600">{a.locale}</td>
                <td className="py-2 px-3 text-gray-600">
                  {a.published_at ? new Date(a.published_at).toLocaleDateString('zh-CN') : '—'}
                </td>
                <td className="py-2 px-3">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(a); setShowForm(true); }} className="text-blue-600 hover:underline text-xs">编辑</button>
                    <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:underline text-xs">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ArticleForm({ article, onSave, onCancel, saving }: {
  article: Article | null;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [tab, setTab] = useState<'zh' | 'en'>('zh');
  const [data, setData] = useState({
    title: article?.title || { zh: '', en: '' },
    excerpt: article?.excerpt || { zh: '', en: '' },
    content_html: article?.content_html || { zh: '', en: '' },
    meta_description: article?.meta_description || { zh: '', en: '' },
    slug: article?.slug || '',
    cover_url: article?.cover_url || '',
    status: article?.status || 'draft',
    locale: article?.locale || 'zh',
    sites: article?.sites || ['global'],
  });

  function set(field: string, value: unknown) {
    setData((p) => ({ ...p, [field]: value }));
  }
  function setLoc(field: string, locale: string, value: string) {
    setData((p) => ({ ...p, [field]: { ...(p[field as keyof typeof p] as Record<string, string>), [locale]: value } }));
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const result = await res.json();
    if (result.url) set('cover_url', result.url);
  }

  return (
    <div className="admin-card max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{article ? '编辑文章' : '新增文章'}</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {['zh', 'en'].map((l) => (
          <button key={l} onClick={() => setTab(l as 'zh' | 'en')}
            className={`px-3 py-1.5 text-sm border-b-2 ${tab === l ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
            {l === 'zh' ? '中文' : '英文'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标题 ({tab})</label>
            <input className="admin-input" value={data.title[tab] || ''} onChange={(e) => setLoc('title', tab, e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input className="admin-input" value={data.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto-generate" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">摘要 ({tab})</label>
          <textarea className="admin-input" rows={2} value={data.excerpt[tab] || ''} onChange={(e) => setLoc('excerpt', tab, e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">正文 HTML ({tab})</label>
          <textarea className="admin-input" rows={12} value={data.content_html[tab] || ''} onChange={(e) => setLoc('content_html', tab, e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description ({tab})</label>
          <input className="admin-input" value={data.meta_description[tab] || ''} onChange={(e) => setLoc('meta_description', tab, e.target.value)} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">封面图</label>
            <div className="flex gap-2">
              <input className="admin-input flex-1" value={data.cover_url} onChange={(e) => set('cover_url', e.target.value)} />
              <input type="file" accept="image/*" onChange={upload} className="hidden" id="art-cover" />
              <label htmlFor="art-cover" className="admin-btn admin-btn-secondary cursor-pointer">上传</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select className="admin-input" value={data.status} onChange={(e) => set('status', e.target.value)}>
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">主语言</label>
            <select className="admin-input" value={data.locale} onChange={(e) => set('locale', e.target.value)}>
              <option value="zh">中文</option>
              <option value="en">英文</option>
              <option value="ru">俄文</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">可见站点</label>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'global', label: '全部站点' },
              { value: 'overseas', label: '海外站 (xiuyuknit.com)' },
              { value: 'china', label: '国内站 (xiuyumaoshan.cn)' },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(data.sites as string[]).includes(opt.value)}
                  onChange={(e) => {
                    const current = data.sites as string[];
                    const next = e.target.checked
                      ? [...current, opt.value]
                      : current.filter((s) => s !== opt.value);
                    set('sites', next.length > 0 ? next : ['global']);
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <button onClick={() => onSave(data)} disabled={saving} className="admin-btn admin-btn-primary flex-1">
            {saving ? '保存中...' : '保存'}
          </button>
          <button onClick={onCancel} className="admin-btn admin-btn-secondary">取消</button>
        </div>
      </div>
    </div>
  );
}
