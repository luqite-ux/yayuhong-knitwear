'use client';

import { useState } from 'react';

interface Product {
  id: string;
  name: Record<string, string>;
  name_text: string;
  slug: string;
  model: string | null;
  cover_url: string | null;
  is_active: boolean;
  sort: number;
  category_id: string | null;
  category_name_text: string;
  summary?: Record<string, string>;
  detail_html?: Record<string, string>;
  features?: Record<string, string>;
  applications?: Record<string, string>;
  advantages?: Record<string, string>;
  specs?: Record<string, string>;
  gallery_urls?: string[];
  sites?: string[];
}

interface Category {
  id: string;
  name: Record<string, string>;
  name_text: string;
  slug: string;
}

const LOCALES = ['zh', 'en', 'ru', 'es', 'de', 'fr', 'pt', 'ja', 'ar'];

export default function ProductsManager({
  products: initialProducts,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  function startEdit(p: Product) {
    setEditing(p);
    setShowForm(true);
  }

  function startCreate() {
    setEditing(null);
    setShowForm(true);
  }

  async function handleSave(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { ...data, id: editing.id } : data;
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.error || '保存失败');
        setSaving(false);
        return;
      }
      setShowForm(false);
      setEditing(null);
      window.location.reload();
    } catch {
      alert('网络错误');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除此产品？')) return;
    const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts(products.filter((p) => p.id !== id));
    }
  }

  if (showForm) {
    return (
      <ProductForm
        product={editing}
        categories={categories}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditing(null); }}
        saving={saving}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">共 {products.length} 个产品</p>
        <button onClick={startCreate} className="admin-btn admin-btn-primary">+ 新增产品</button>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2 px-3">封面</th>
              <th className="py-2 px-3">名称</th>
              <th className="py-2 px-3">型号</th>
              <th className="py-2 px-3">分类</th>
              <th className="py-2 px-3">状态</th>
              <th className="py-2 px-3">排序</th>
              <th className="py-2 px-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-3">
                  {p.cover_url ? (
                    <img src={p.cover_url} alt="" className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-300">—</div>
                  )}
                </td>
                <td className="py-2 px-3 font-medium text-gray-900">{p.name_text || p.slug}</td>
                <td className="py-2 px-3 text-gray-600">{p.model || '—'}</td>
                <td className="py-2 px-3 text-gray-600">{p.category_name_text || '—'}</td>
                <td className="py-2 px-3">
                  <span className={`admin-badge ${p.is_active ? 'admin-badge-green' : 'admin-badge-gray'}`}>
                    {p.is_active ? '上架' : '下架'}
                  </span>
                </td>
                <td className="py-2 px-3 text-gray-600">{p.sort}</td>
                <td className="py-2 px-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p)} className="text-blue-600 hover:underline text-xs">编辑</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-xs">删除</button>
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

function ProductForm({
  product,
  categories,
  onSave,
  onCancel,
  saving,
}: {
  product: Product | null;
  categories: Category[];
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [tab, setTab] = useState<'zh' | 'en' | 'ru'>('zh');
  const [formData, setFormData] = useState({
    name: product?.name || { zh: '', en: '' },
    summary: product?.summary || { zh: '', en: '' },
    detail_html: product?.detail_html || { zh: '', en: '' },
    model: product?.model || '',
    slug: product?.slug || '',
    category_id: product?.category_id || '',
    cover_url: product?.cover_url || '',
    gallery_urls: (product?.gallery_urls || []).join('\n'),
    is_active: product?.is_active !== false,
    sort: product?.sort || 0,
    sites: product?.sites || ['global'],
  });

  function updateField(field: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function updateLocalized(field: string, locale: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...(prev[field as keyof typeof prev] as Record<string, string>), [locale]: value },
    }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) updateField('cover_url', data.url);
  }

  return (
    <div className="admin-card max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{product ? '编辑产品' : '新增产品'}</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {['zh', 'en', 'ru'].map((l) => (
          <button key={l} onClick={() => setTab(l as 'zh' | 'en' | 'ru')}
            className={`px-3 py-1.5 text-sm border-b-2 ${tab === l ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
            {l === 'zh' ? '中文' : l === 'en' ? '英文' : '俄文'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名称 ({tab})</label>
            <input className="admin-input" value={formData.name[tab] || ''}
              onChange={(e) => updateLocalized('name', tab, e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">型号</label>
            <input className="admin-input" value={formData.model}
              onChange={(e) => updateField('model', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">摘要 ({tab})</label>
          <textarea className="admin-input" rows={2} value={formData.summary[tab] || ''}
            onChange={(e) => updateLocalized('summary', tab, e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">详情 HTML ({tab})</label>
          <textarea className="admin-input" rows={8} value={formData.detail_html[tab] || ''}
            onChange={(e) => updateLocalized('detail_html', tab, e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input className="admin-input" value={formData.slug}
              onChange={(e) => updateField('slug', e.target.value)} placeholder="auto-generate" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select className="admin-input" value={formData.category_id}
              onChange={(e) => updateField('category_id', e.target.value)}>
              <option value="">— 无 —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name_text}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">封面图</label>
          <div className="flex gap-2">
            <input className="admin-input flex-1" value={formData.cover_url}
              onChange={(e) => updateField('cover_url', e.target.value)} placeholder="URL or upload" />
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id="cover-upload" />
            <label htmlFor="cover-upload" className="admin-btn admin-btn-secondary cursor-pointer">上传</label>
          </div>
          {formData.cover_url && <img src={formData.cover_url} alt="" className="mt-2 w-24 h-24 object-cover rounded" />}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">图库 (每行一个 URL)</label>
          <textarea className="admin-input" rows={3} value={formData.gallery_urls}
            onChange={(e) => updateField('gallery_urls', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
            <input className="admin-input" type="number" value={formData.sort}
              onChange={(e) => updateField('sort', Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select className="admin-input" value={String(formData.is_active)}
              onChange={(e) => updateField('is_active', e.target.value === 'true')}>
              <option value="true">上架</option>
              <option value="false">下架</option>
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
                  checked={(formData.sites as string[]).includes(opt.value)}
                  onChange={(e) => {
                    const current = formData.sites as string[];
                    const next = e.target.checked
                      ? [...current, opt.value]
                      : current.filter((s) => s !== opt.value);
                    updateField('sites', next.length > 0 ? next : ['global']);
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <button onClick={() => onSave(formData)} disabled={saving}
            className="admin-btn admin-btn-primary flex-1">
            {saving ? '保存中...' : '保存'}
          </button>
          <button onClick={onCancel} className="admin-btn admin-btn-secondary">取消</button>
        </div>
      </div>
    </div>
  );
}
