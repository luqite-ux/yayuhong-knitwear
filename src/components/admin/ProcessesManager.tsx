'use client';

import { useState, useEffect } from 'react';

interface Process {
  id: string;
  title: Record<string, string>;
  title_text?: string;
  description: Record<string, string>;
  step_number: number;
  icon_key: string | null;
  sort: number;
  sites: string[];
  is_active: boolean;
}

const LOCALES = ['zh', 'en', 'ru'] as const;

export default function ProcessesManager() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Process | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProcesses();
  }, []);

  async function loadProcesses() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/factory/processes');
      const data = await res.json();
      if (res.ok && data.processes) {
        setProcesses(data.processes.map((p: Process) => ({
          ...p,
          title_text: p.title?.zh || p.title?.en || '',
        })));
      }
    } catch {
      alert('加载失败');
    }
    setLoading(false);
  }

  function startEdit(p: Process) {
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
      const res = await fetch('/api/admin/factory/processes', {
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
      loadProcesses();
    } catch {
      alert('网络错误');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除此流程？')) return;
    const res = await fetch(`/api/admin/factory/processes?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProcesses(processes.filter((p) => p.id !== id));
    } else {
      alert('删除失败');
    }
  }

  if (showForm) {
    return (
      <ProcessForm
        process={editing}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditing(null); }}
        saving={saving}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">共 {processes.length} 个流程步骤</p>
        <button onClick={startCreate} className="admin-btn admin-btn-primary">+ 新增流程</button>
      </div>

      {loading ? (
        <div className="admin-card text-center py-8 text-gray-400">加载中...</div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 px-3">步骤</th>
                <th className="py-2 px-3">标题</th>
                <th className="py-2 px-3">描述</th>
                <th className="py-2 px-3">排序</th>
                <th className="py-2 px-3">状态</th>
                <th className="py-2 px-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {processes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">暂无数据</td>
                </tr>
              ) : (
                processes.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 font-medium text-xs">
                        {p.step_number}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium text-gray-900">{p.title_text || '未命名'}</td>
                    <td className="py-2 px-3 text-gray-600 max-w-xs truncate">
                      {p.description?.zh || p.description?.en || '—'}
                    </td>
                    <td className="py-2 px-3 text-gray-600">{p.sort}</td>
                    <td className="py-2 px-3">
                      <span className={`admin-badge ${p.is_active ? 'admin-badge-green' : 'admin-badge-gray'}`}>
                        {p.is_active ? '启用' : '停用'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(p)} className="text-blue-600 hover:underline text-xs">编辑</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-xs">删除</button>
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

function ProcessForm({
  process,
  onSave,
  onCancel,
  saving,
}: {
  process: Process | null;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [tab, setTab] = useState<'zh' | 'en' | 'ru'>('zh');
  const [formData, setFormData] = useState({
    title: process?.title || { zh: '', en: '', ru: '' },
    description: process?.description || { zh: '', en: '', ru: '' },
    step_number: process?.step_number || 1,
    icon_key: process?.icon_key || '',
    is_active: process?.is_active !== false,
    sort: process?.sort || 0,
    sites: process?.sites || ['global'],
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
        <h2 className="text-lg font-semibold">{process ? '编辑流程' : '新增流程'}</h2>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">步骤序号</label>
            <input className="admin-input" type="number" min={1} value={formData.step_number}
              onChange={(e) => updateField('step_number', Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">图标 Key</label>
            <input className="admin-input" value={formData.icon_key || ''}
              onChange={(e) => updateField('icon_key', e.target.value)} placeholder="如: process-icon-1" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">标题 ({tab})</label>
          <input className="admin-input" value={formData.title[tab] || ''}
            onChange={(e) => updateLocalized('title', tab, e.target.value)} placeholder="请输入流程标题" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">描述 ({tab})</label>
          <textarea className="admin-input" rows={4} value={formData.description[tab] || ''}
            onChange={(e) => updateLocalized('description', tab, e.target.value)} placeholder="请输入流程描述" />
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
