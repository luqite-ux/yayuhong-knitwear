'use client';

import { useState, useEffect } from 'react';

interface ReadyStock {
  id: string;
  name: Record<string, string>;
  name_text?: string;
  model: string | null;
  cover_url: string | null;
  price_range: string | null;
  sort: number;
  sites: string[];
  is_active: boolean;
}

const LOCALES = ['zh', 'en', 'ru'] as const;

export default function ReadyStockManager() {
  const [readyStock, setReadyStock] = useState<ReadyStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ReadyStock | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadReadyStock();
  }, []);

  async function loadReadyStock() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ready-stock');
      const data = await res.json();
      if (res.ok && data.readyStock) {
        setReadyStock(data.readyStock.map((item: ReadyStock) => ({
          ...item,
          name_text: item.name?.zh || item.name?.en || '',
        })));
      }
    } catch {
      alert('加载失败');
    }
    setLoading(false);
  }

  function startEdit(item: ReadyStock) {
    setEditing(item);
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
      const res = await fetch('/api/admin/ready-stock', {
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
      loadReadyStock();
    } catch {
      alert('网络错误');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除此现货产品？')) return;
    const res = await fetch(`/api/admin/ready-stock?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setReadyStock(readyStock.filter((r) => r.id !== id));
    } else {
      alert('删除失败');
    }
  }

  if (showForm) {
    return (
      <ReadyStockForm
        item={editing}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditing(null); }}
        saving={saving}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">共 {readyStock.length} 个现货产品</p>
        <button onClick={startCreate} className="admin-btn admin-btn-primary">+ 新增现货</button>
      </div>

      {loading ? (
        <div className="admin-card text-center py-8 text-gray-400">加载中...</div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 px-3">图片</th>
                <th className="py-2 px-3">款号</th>
                <th className="py-2 px-3">名称</th>
                <th className="py-2 px-3">价格区间</th>
                <th className="py-2 px-3">排序</th>
                <th className="py-2 px-3">状态</th>
                <th className="py-2 px-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {readyStock.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">暂无数据</td>
                </tr>
              ) : (
                readyStock.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">
                      {item.cover_url ? (
                        <img src={item.cover_url} alt="" className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-300 text-xs">无图</div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-gray-600 font-mono text-xs">{item.model || '—'}</td>
                    <td className="py-2 px-3 font-medium text-gray-900">{item.name_text || '未命名'}</td>
                    <td className="py-2 px-3 text-gray-600">{item.price_range || '—'}</td>
                    <td className="py-2 px-3 text-gray-600">{item.sort}</td>
                    <td className="py-2 px-3">
                      <span className={`admin-badge ${item.is_active ? 'admin-badge-green' : 'admin-badge-gray'}`}>
                        {item.is_active ? '启用' : '停用'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(item)} className="text-blue-600 hover:underline text-xs">编辑</button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline text-xs">删除</button>
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

function ReadyStockForm({
  item,
  onSave,
  onCancel,
  saving,
}: {
  item: ReadyStock | null;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [tab, setTab] = useState<'zh' | 'en' | 'ru'>('zh');
  const [formData, setFormData] = useState({
    name: item?.name || { zh: '', en: '', ru: '' },
    model: item?.model || '',
    cover_url: item?.cover_url || '',
    price_range: item?.price_range || '',
    is_active: item?.is_active !== false,
    sort: item?.sort || 0,
    sites: item?.sites || ['global'],
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
        <h2 className="text-lg font-semibold">{item ? '编辑现货' : '新增现货'}</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">产品名称 ({tab})</label>
          <input className="admin-input" value={formData.name[tab] || ''}
            onChange={(e) => updateLocalized('name', tab, e.target.value)} placeholder="请输入产品名称" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">款号 / 型号</label>
            <input className="admin-input" value={formData.model || ''}
              onChange={(e) => updateField('model', e.target.value)} placeholder="如: YYH-001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">价格区间</label>
            <input className="admin-input" value={formData.price_range || ''}
              onChange={(e) => updateField('price_range', e.target.value)} placeholder="如: $10 - $50" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">封面图片 URL</label>
          <input className="admin-input" value={formData.cover_url || ''}
            onChange={(e) => updateField('cover_url', e.target.value)} placeholder="https://..." />
          {formData.cover_url && (
            <img src={formData.cover_url} alt="" className="mt-2 w-24 h-24 object-cover rounded border" />
          )}
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
              <option value="true">启用</option>
              <option value="false">停用</option>
            </select>
          </div>
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
