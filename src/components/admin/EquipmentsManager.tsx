'use client';

import { useState, useEffect } from 'react';

interface Equipment {
  id: string;
  name: Record<string, string>;
  name_text?: string;
  quantity: number;
  icon_key: string | null;
  sort: number;
  sites: string[];
  is_active: boolean;
}

const LOCALES = ['zh', 'en', 'ru'] as const;

export default function EquipmentsManager() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEquipments();
  }, []);

  async function loadEquipments() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/factory/equipments');
      const data = await res.json();
      if (res.ok && data.equipments) {
        setEquipments(data.equipments.map((e: Equipment) => ({
          ...e,
          name_text: e.name?.zh || e.name?.en || '',
        })));
      }
    } catch {
      alert('加载失败');
    }
    setLoading(false);
  }

  function startEdit(eq: Equipment) {
    setEditing(eq);
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
      const res = await fetch('/api/admin/factory/equipments', {
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
      loadEquipments();
    } catch {
      alert('网络错误');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除此设备？')) return;
    const res = await fetch(`/api/admin/factory/equipments?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setEquipments(equipments.filter((e) => e.id !== id));
    } else {
      alert('删除失败');
    }
  }

  if (showForm) {
    return (
      <EquipmentForm
        equipment={editing}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditing(null); }}
        saving={saving}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">共 {equipments.length} 台设备</p>
        <button onClick={startCreate} className="admin-btn admin-btn-primary">+ 新增设备</button>
      </div>

      {loading ? (
        <div className="admin-card text-center py-8 text-gray-400">加载中...</div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 px-3">图标</th>
                <th className="py-2 px-3">名称</th>
                <th className="py-2 px-3">数量</th>
                <th className="py-2 px-3">排序</th>
                <th className="py-2 px-3">状态</th>
                <th className="py-2 px-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {equipments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">暂无数据</td>
                </tr>
              ) : (
                equipments.map((eq) => (
                  <tr key={eq.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">
                      {eq.icon_key ? (
                        <span className="text-xl">{eq.icon_key}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-medium text-gray-900">{eq.name_text || '未命名'}</td>
                    <td className="py-2 px-3 text-gray-600">{eq.quantity}</td>
                    <td className="py-2 px-3 text-gray-600">{eq.sort}</td>
                    <td className="py-2 px-3">
                      <span className={`admin-badge ${eq.is_active ? 'admin-badge-green' : 'admin-badge-gray'}`}>
                        {eq.is_active ? '启用' : '停用'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(eq)} className="text-blue-600 hover:underline text-xs">编辑</button>
                        <button onClick={() => handleDelete(eq.id)} className="text-red-500 hover:underline text-xs">删除</button>
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

function EquipmentForm({
  equipment,
  onSave,
  onCancel,
  saving,
}: {
  equipment: Equipment | null;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [tab, setTab] = useState<'zh' | 'en' | 'ru'>('zh');
  const [formData, setFormData] = useState({
    name: equipment?.name || { zh: '', en: '', ru: '' },
    quantity: equipment?.quantity || 1,
    icon_key: equipment?.icon_key || '',
    is_active: equipment?.is_active !== false,
    sort: equipment?.sort || 0,
    sites: equipment?.sites || ['global'],
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
        <h2 className="text-lg font-semibold">{equipment ? '编辑设备' : '新增设备'}</h2>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">设备名称 ({tab})</label>
          <input className="admin-input" value={formData.name[tab] || ''}
            onChange={(e) => updateLocalized('name', tab, e.target.value)} placeholder="请输入设备名称" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
            <input className="admin-input" type="number" min={0} value={formData.quantity}
              onChange={(e) => updateField('quantity', Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">图标 Key</label>
            <input className="admin-input" value={formData.icon_key || ''}
              onChange={(e) => updateField('icon_key', e.target.value)} placeholder="如: equipment-icon-1" />
          </div>
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
