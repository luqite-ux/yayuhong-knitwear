'use client';

import { useState, useEffect } from 'react';

interface Feature {
  id: string;
  category: string;
  title: Record<string, string>;
  title_text?: string;
  description: Record<string, string>;
  icon_key: string | null;
  sort: number;
  sites: string[];
  is_active: boolean;
}

const LOCALES = ['zh', 'en', 'ru'] as const;
const CATEGORIES = [
  { value: 'home', label: '首页' },
  { value: 'factory', label: '工厂' },
  { value: 'services', label: '服务' },
];

export default function FeaturesManager() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Feature | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  useEffect(() => {
    loadFeatures();
  }, [categoryFilter]);

  async function loadFeatures() {
    setLoading(true);
    try {
      const url = categoryFilter
        ? `/api/admin/features?category=${encodeURIComponent(categoryFilter)}`
        : '/api/admin/features';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.features) {
        setFeatures(data.features.map((f: Feature) => ({
          ...f,
          title_text: f.title?.zh || f.title?.en || '',
        })));
      }
    } catch {
      alert('加载失败');
    }
    setLoading(false);
  }

  function startEdit(feature: Feature) {
    setEditing(feature);
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
      const res = await fetch('/api/admin/features', {
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
      loadFeatures();
    } catch {
      alert('网络错误');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除此特点？')) return;
    const res = await fetch(`/api/admin/features?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setFeatures(features.filter((f) => f.id !== id));
    } else {
      alert('删除失败');
    }
  }

  function getCategoryLabel(cat: string) {
    const found = CATEGORIES.find((c) => c.value === cat);
    return found ? found.label : cat;
  }

  if (showForm) {
    return (
      <FeatureForm
        feature={editing}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditing(null); }}
        saving={saving}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">共 {features.length} 个特点</p>
          <select
            className="admin-input w-32 text-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">全部分类</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <button onClick={startCreate} className="admin-btn admin-btn-primary">+ 新增特点</button>
      </div>

      {loading ? (
        <div className="admin-card text-center py-8 text-gray-400">加载中...</div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 px-3">分类</th>
                <th className="py-2 px-3">图标</th>
                <th className="py-2 px-3">标题</th>
                <th className="py-2 px-3">排序</th>
                <th className="py-2 px-3">状态</th>
                <th className="py-2 px-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {features.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">暂无数据</td>
                </tr>
              ) : (
                features.map((f) => (
                  <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <span className="admin-badge admin-badge-blue">{getCategoryLabel(f.category)}</span>
                    </td>
                    <td className="py-2 px-3">
                      {f.icon_key ? (
                        <span className="text-xl">{f.icon_key}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-medium text-gray-900">{f.title_text || '未命名'}</td>
                    <td className="py-2 px-3 text-gray-600">{f.sort}</td>
                    <td className="py-2 px-3">
                      <span className={`admin-badge ${f.is_active ? 'admin-badge-green' : 'admin-badge-gray'}`}>
                        {f.is_active ? '启用' : '停用'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(f)} className="text-blue-600 hover:underline text-xs">编辑</button>
                        <button onClick={() => handleDelete(f.id)} className="text-red-500 hover:underline text-xs">删除</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FeatureForm({
  feature,
  onSave,
  onCancel,
  saving,
}: {
  feature: Feature | null;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [tab, setTab] = useState<'zh' | 'en' | 'ru'>('zh');
  const [formData, setFormData] = useState({
    category: feature?.category || 'home',
    title: feature?.title || { zh: '', en: '', ru: '' },
    description: feature?.description || { zh: '', en: '', ru: '' },
    icon_key: feature?.icon_key || '',
    is_active: feature?.is_active !== false,
    sort: feature?.sort || 0,
    sites: feature?.sites || ['global'],
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

  return (
    <div className="admin-card max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{feature ? '编辑特点' : '新增特点'}</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
        <select className="admin-input" value={formData.category}
          onChange={(e) => updateField('category', e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {LOCALES.map((l) => (
          <button key={l} onClick={() => setTab(l)}
            className={`px-3 py-1.5 text-sm border-b-2 ${tab === l ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
            {l === 'zh' ? '中文' : l === 'en' ? '英文' : '俄文'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">标题 ({tab})</label>
          <input className="admin-input" value={formData.title[tab] || ''}
            onChange={(e) => updateLocalized('title', tab, e.target.value)} placeholder="请输入特点标题" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">描述 ({tab})</label>
          <textarea className="admin-input" rows={4} value={formData.description[tab] || ''}
            onChange={(e) => updateLocalized('description', tab, e.target.value)} placeholder="请输入特点描述" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">图标 Key</label>
            <input className="admin-input" value={formData.icon_key || ''}
              onChange={(e) => updateField('icon_key', e.target.value)} placeholder="如: feature-icon-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
            <input className="admin-input" type="number" value={formData.sort}
              onChange={(e) => updateField('sort', Number(e.target.value))} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <select className="admin-input" value={String(formData.is_active)}
            onChange={(e) => updateField('is_active', e.target.value === 'true')}>
            <option value="true">启用</option>
            <option value="false">停用</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">可见站点</label>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'global', label: '全部站点' },
              { value: 'overseas', label: '海外站' },
              { value: 'china', label: '国内站' },
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
