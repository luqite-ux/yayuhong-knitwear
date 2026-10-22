'use client';

import { useState } from 'react';
import { LOCALES, LOCALE_LABELS, type Locale, emptyMultilingual } from '@/lib/i18n';

interface Category {
  id: string;
  name: Record<string, string>;
  name_text: string;
  slug: string;
  parent_id: string | null;
  parent_name_text: string;
  sort: number;
}

export default function CategoriesManager({ categories: initial }: { categories: Category[] }) {
  const [categories] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave(data: Record<string, unknown>) {
    setSaving(true);
    const method = editing ? 'PUT' : 'POST';
    const body = editing ? { ...data, id: editing.id } : data;
    const res = await fetch('/api/admin/categories', {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const result = await res.json();
    if (!res.ok) { alert(result.error || '保存失败'); setSaving(false); return; }
    setShowForm(false); setEditing(null);
    window.location.reload();
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除？')) return;
    await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
    window.location.reload();
  }

  if (showForm) {
    return (
      <div className="admin-card max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{editing ? '编辑分类' : '新增分类'}</h2>
          <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-gray-400">✕</button>
        </div>
        <CategoryForm
          category={editing}
          categories={categories}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          saving={saving}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">共 {categories.length} 个分类</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="admin-btn admin-btn-primary">+ 新增分类</button>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2 px-3">名称</th>
              <th className="py-2 px-3">Slug</th>
              <th className="py-2 px-3">父分类</th>
              <th className="py-2 px-3">排序</th>
              <th className="py-2 px-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-3 font-medium text-gray-900">{c.name_text}</td>
                <td className="py-2 px-3 text-gray-600">{c.slug}</td>
                <td className="py-2 px-3 text-gray-600">{c.parent_name_text || '—'}</td>
                <td className="py-2 px-3 text-gray-600">{c.sort}</td>
                <td className="py-2 px-3">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(c); setShowForm(true); }} className="text-blue-600 hover:underline text-xs">编辑</button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline text-xs">删除</button>
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

function CategoryForm({ category, categories, onSave, onCancel, saving }: {
  category: Category | null;
  categories: Category[];
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [tab, setTab] = useState<Locale>('zh');
  const [data, setData] = useState({
    name: { ...emptyMultilingual(), ...(category?.name || {}) } as Record<Locale, string>,
    slug: category?.slug || '',
    parent_id: category?.parent_id || '',
    sort: category?.sort || 0,
  });

  function set(field: string, value: unknown) {
    setData((p) => ({ ...p, [field]: value }));
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 mb-2 border-b border-gray-200 flex-wrap">
        {LOCALES.map((l) => (
          <button key={l} type="button" onClick={() => setTab(l)}
            className={`px-3 py-1.5 text-sm border-b-2 ${tab === l ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
            {LOCALE_LABELS[l]}
          </button>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">名称 ({LOCALE_LABELS[tab]})</label>
        <input className="admin-input" value={data.name[tab] || ''}
          onChange={(e) => setData(prev => ({ ...prev, name: { ...prev.name, [tab]: e.target.value } }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input className="admin-input" value={data.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto-generate" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">父分类</label>
          <select className="admin-input" value={data.parent_id} onChange={(e) => set('parent_id', e.target.value)}>
            <option value="">— 无 —</option>
            {categories.filter((c) => c.id !== category?.id).map((c) => (
              <option key={c.id} value={c.id}>{c.name_text}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
        <input className="admin-input" type="number" value={data.sort} onChange={(e) => set('sort', Number(e.target.value))} />
      </div>
      <div className="flex gap-2 pt-4">
        <button onClick={() => onSave({
          // 合并已有语言，避免覆盖丢失未在表单中展示的语言
          name: { ...(category?.name || {}), ...data.name },
          slug: data.slug, parent_id: data.parent_id || null, sort: data.sort,
        })} disabled={saving} className="admin-btn admin-btn-primary flex-1">
          {saving ? '保存中...' : '保存'}
        </button>
        <button onClick={onCancel} className="admin-btn admin-btn-secondary">取消</button>
      </div>
    </div>
  );
}
