'use client';

import { useState, useEffect } from 'react';

interface Block {
  id: string;
  block_key: string;
  title: Record<string, string>;
  title_text?: string;
  subtitle: Record<string, string>;
  content: Record<string, string>;
  image_url: string | null;
  items: unknown[];
  config: Record<string, unknown>;
  sort: number;
  sites: string[];
  is_active: boolean;
}

const LOCALES = ['zh', 'en', 'ru'] as const;

export default function BlocksManager() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Block | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBlocks();
  }, []);

  async function loadBlocks() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/blocks');
      const data = await res.json();
      if (res.ok && data.blocks) {
        setBlocks(data.blocks.map((b: Block) => ({
          ...b,
          title_text: b.title?.zh || b.title?.en || '',
        })));
      }
    } catch {
      alert('加载失败');
    }
    setLoading(false);
  }

  function startEdit(block: Block) {
    setEditing(block);
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
      const res = await fetch('/api/admin/blocks', {
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
      loadBlocks();
    } catch {
      alert('网络错误');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除此区块？')) return;
    const res = await fetch(`/api/admin/blocks?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setBlocks(blocks.filter((b) => b.id !== id));
    } else {
      alert('删除失败');
    }
  }

  if (showForm) {
    return (
      <BlockForm
        block={editing}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditing(null); }}
        saving={saving}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">共 {blocks.length} 个区块</p>
        <button onClick={startCreate} className="admin-btn admin-btn-primary">+ 新增区块</button>
      </div>

      {loading ? (
        <div className="admin-card text-center py-8 text-gray-400">加载中...</div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 px-3">Block Key</th>
                <th className="py-2 px-3">标题</th>
                <th className="py-2 px-3">排序</th>
                <th className="py-2 px-3">状态</th>
                <th className="py-2 px-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {blocks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">暂无数据</td>
                </tr>
              ) : (
                blocks.map((b) => (
                  <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 font-mono text-xs text-gray-600">{b.block_key}</td>
                    <td className="py-2 px-3 font-medium text-gray-900">{b.title_text || '未命名'}</td>
                    <td className="py-2 px-3 text-gray-600">{b.sort}</td>
                    <td className="py-2 px-3">
                      <span className={`admin-badge ${b.is_active ? 'admin-badge-green' : 'admin-badge-gray'}`}>
                        {b.is_active ? '启用' : '停用'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(b)} className="text-blue-600 hover:underline text-xs">编辑</button>
                        <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:underline text-xs">删除</button>
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

function BlockForm({
  block,
  onSave,
  onCancel,
  saving,
}: {
  block: Block | null;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [tab, setTab] = useState<'zh' | 'en' | 'ru'>('zh');
  const [formData, setFormData] = useState({
    block_key: block?.block_key || '',
    title: block?.title || { zh: '', en: '', ru: '' },
    subtitle: block?.subtitle || { zh: '', en: '', ru: '' },
    content: block?.content || { zh: '', en: '', ru: '' },
    image_url: block?.image_url || '',
    items: block?.items ? JSON.stringify(block.items, null, 2) : '[]',
    config: block?.config ? JSON.stringify(block.config, null, 2) : '{}',
    is_active: block?.is_active !== false,
    sort: block?.sort || 0,
    sites: block?.sites || ['global'],
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

  function handleSubmit() {
    let parsedItems: unknown[] = [];
    let parsedConfig: Record<string, unknown> = {};

    try {
      parsedItems = JSON.parse(formData.items);
    } catch {
      alert('items 格式错误，请输入有效的 JSON 数组');
      return;
    }

    try {
      parsedConfig = JSON.parse(formData.config);
    } catch {
      alert('config 格式错误，请输入有效的 JSON 对象');
      return;
    }

    const data = {
      block_key: formData.block_key,
      title: formData.title,
      subtitle: formData.subtitle,
      content: formData.content,
      image_url: formData.image_url,
      items: parsedItems,
      config: parsedConfig,
      sort: formData.sort,
      sites: formData.sites,
      is_active: formData.is_active,
    };

    onSave(data);
  }

  return (
    <div className="admin-card max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{block ? '编辑区块' : '新增区块'}</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Block Key</label>
          <input
            className="admin-input"
            value={formData.block_key}
            onChange={(e) => updateField('block_key', e.target.value)}
            disabled={!!block}
            placeholder="如: hero_section"
          />
          {block && <p className="text-xs text-gray-400 mt-1">已有记录的 block_key 不可修改</p>}
        </div>

        <div className="flex gap-1 mb-2 border-b border-gray-200">
          {LOCALES.map((l) => (
            <button key={l} onClick={() => setTab(l)}
              className={`px-3 py-1.5 text-sm border-b-2 ${tab === l ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
              {l === 'zh' ? '中文' : l === 'en' ? '英文' : '俄文'}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">标题 ({tab})</label>
          <input className="admin-input" value={formData.title[tab] || ''}
            onChange={(e) => updateLocalized('title', tab, e.target.value)} placeholder="请输入区块标题" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">副标题 ({tab})</label>
          <input className="admin-input" value={formData.subtitle[tab] || ''}
            onChange={(e) => updateLocalized('subtitle', tab, e.target.value)} placeholder="请输入副标题" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">内容 ({tab})</label>
          <textarea className="admin-input" rows={5} value={formData.content[tab] || ''}
            onChange={(e) => updateLocalized('content', tab, e.target.value)} placeholder="请输入区块内容" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">图片 URL</label>
          <input className="admin-input" value={formData.image_url || ''}
            onChange={(e) => updateField('image_url', e.target.value)} placeholder="https://..." />
          {formData.image_url && (
            <img src={formData.image_url} alt="" className="mt-2 w-24 h-24 object-cover rounded border" />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Items (JSON 数组)</label>
          <p className="text-xs text-gray-400 mb-1">请输入 JSON 数组格式，例如 [{'{'} "title": "xxx" {'}'}]</p>
          <textarea
            className="admin-input font-mono text-xs"
            rows={6}
            value={formData.items}
            onChange={(e) => updateField('items', e.target.value)}
            placeholder='[]'
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Config (JSON 对象)</label>
          <p className="text-xs text-gray-400 mb-1">请输入 JSON 对象格式，例如 {'{'}{'{'} "layout": "grid" {'}'}{'}'}</p>
          <textarea
            className="admin-input font-mono text-xs"
            rows={5}
            value={formData.config}
            onChange={(e) => updateField('config', e.target.value)}
            placeholder='{}'
          />
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
          <button onClick={handleSubmit} disabled={saving}
            className="admin-btn admin-btn-primary flex-1">
            {saving ? '保存中...' : '保存'}
          </button>
          <button onClick={onCancel} className="admin-btn admin-btn-secondary">取消</button>
        </div>
      </div>
    </div>
  );
}
