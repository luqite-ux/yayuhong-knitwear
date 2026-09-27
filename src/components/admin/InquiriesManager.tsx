'use client';

import { useState, useEffect } from 'react';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  locale: string | null;
  status: string;
  source: string;
  admin_note: string | null;
  country: string | null;
  created_at: string;
}

interface StatItem {
  status: string;
  count: number;
}

const STATUS_MAP: Record<string, { label: string; cls: string; color: string }> = {
  new:        { label: '新线索',   cls: 'admin-badge-blue',   color: '#3b82f6' },
  contacting: { label: '跟进中',   cls: 'admin-badge-yellow', color: '#eab308' },
  quoted:     { label: '已报价',   cls: 'admin-badge-purple', color: '#a855f7' },
  won:        { label: '已成交',   cls: 'admin-badge-green',  color: '#22c55e' },
  lost:       { label: '已流失',   cls: 'admin-badge-gray',   color: '#9ca3af' },
  spam:       { label: '垃圾',     cls: 'admin-badge-red',    color: '#ef4444' },
};

const STATUS_FLOW: Record<string, string[]> = {
  new:        ['contacting', 'spam'],
  contacting: ['quoted', 'lost', 'spam'],
  quoted:     ['won', 'lost', 'contacting'],
  won:        [],
  lost:       ['contacting'],
  spam:       ['new'],
};

export default function InquiriesManager({
  initialInquiries, initialStats,
}: { initialInquiries: Inquiry[]; initialStats: StatItem[] }) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [stats, setStats] = useState(initialStats);
  const [filter, setFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteAction, setNoteAction] = useState('note');
  const [savingNote, setSavingNote] = useState(false);

  const filtered = filter === 'all'
    ? inquiries
    : inquiries.filter(i => i.status === filter);

  const statsMap: Record<string, number> = {};
  stats.forEach(s => { statsMap[s.status] = s.count; });
  const totalCount = stats.reduce((sum, s) => sum + s.count, 0);

  async function loadFollowUps(id: string) {
    const res = await fetch(`/api/admin/inquiries/follow-ups?id=${id}`);
    if (res.ok) {
      const data = await res.json();
      setFollowUps(data.followUps || []);
    }
  }

  function openDetail(inq: Inquiry) {
    setSelected(inq);
    setFollowUps([]);
    loadFollowUps(inq.id);
  }

  async function changeStatus(newStatus: string) {
    if (!selected) return;
    const note = prompt('状态变更备注（可选）：') || '';
    const res = await fetch('/api/admin/inquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, status: newStatus, note }),
    });
    if (res.ok) {
      // 更新本地数据
      const updated = { ...selected, status: newStatus };
      setSelected(updated);
      setInquiries(inquiries.map(i => i.id === selected.id ? updated : i));
      loadFollowUps(selected.id);
      // 刷新统计
      const listRes = await fetch('/api/admin/inquiries');
      const listData = await listRes.json();
      if (listData.stats) setStats(listData.stats);
    } else {
      const data = await res.json();
      alert(data.error || '操作失败');
    }
  }

  async function addNote() {
    if (!selected || !newNote.trim()) return;
    setSavingNote(true);
    const res = await fetch('/api/admin/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, action: noteAction, content: newNote }),
    });
    if (res.ok) {
      setNewNote('');
      loadFollowUps(selected.id);
    } else {
      const data = await res.json();
      alert(data.error || '保存失败');
    }
    setSavingNote(false);
  }

  function getWhatsappUrl(inq: Inquiry) {
    const phone = inq.whatsapp || inq.phone;
    if (!phone) return '';
    // 清理号码，去掉非数字
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Hi ${inq.name || ''}, 

Thank you for your inquiry about ${inq.subject || 'our knitwear products'}.

${inq.message ? `Your message: "${inq.message.substring(0, 100)}..."` : ''}

We are Yayuhong Knitwear Factory with 20 years of experience in sweater manufacturing. MOQ 50 pcs, 7-day sample delivery, 30,000 pcs daily capacity.

How can we help you?

Best regards,
Yayuhong Knitwear`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  const nextStatuses = selected ? STATUS_FLOW[selected.status] || [] : [];

  return (
    <div>
      {/* 筛选标签 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          全部 <span className="ml-1 opacity-70">{totalCount}</span>
        </button>
        {Object.entries(STATUS_MAP).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {val.label} <span className="ml-1 opacity-70">{statsMap[key] || 0}</span>
          </button>
        ))}
      </div>

      {/* 列表 */}
      <div className="admin-card overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 py-12 text-center">暂无询盘</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 px-3">姓名</th>
                <th className="py-2 px-3">邮箱</th>
                <th className="py-2 px-3">电话/WhatsApp</th>
                <th className="py-2 px-3">公司</th>
                <th className="py-2 px-3">主题</th>
                <th className="py-2 px-3">时间</th>
                <th className="py-2 px-3">状态</th>
                <th className="py-2 px-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr
                  key={i.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    i.status === 'new' ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => openDetail(i)}
                >
                  <td className="py-2 px-3 font-medium text-gray-900">{i.name}</td>
                  <td className="py-2 px-3 text-gray-600">{i.email}</td>
                  <td className="py-2 px-3 text-gray-600">
                    {i.phone || i.whatsapp ? (
                      <span className="flex items-center gap-1">
                        {i.whatsapp && <span className="text-green-500">📱</span>}
                        {i.phone || i.whatsapp}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-2 px-3 text-gray-600">{i.company || '—'}</td>
                  <td className="py-2 px-3 text-gray-600 max-w-xs truncate">{i.subject || '—'}</td>
                  <td className="py-2 px-3 text-gray-400 text-xs">
                    {new Date(i.created_at).toLocaleString('zh-CN')}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`admin-badge ${STATUS_MAP[i.status]?.cls || ''}`}>
                      {STATUS_MAP[i.status]?.label || i.status}
                    </span>
                  </td>
                  <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                    {getWhatsappUrl(i) && (
                      <a
                        href={getWhatsappUrl(i)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                      >
                        <span>💬</span> WhatsApp
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 详情抽屉 */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-gray-900">询盘详情</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <div className="p-4 space-y-6">
              {/* 状态与基本信息 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`admin-badge ${STATUS_MAP[selected.status]?.cls || ''} text-base px-3 py-1`}>
                    {STATUS_MAP[selected.status]?.label || selected.status}
                  </span>
                  {getWhatsappUrl(selected) && (
                    <a
                      href={getWhatsappUrl(selected)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors font-medium"
                    >
                      💬 WhatsApp 回访
                    </a>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{selected.name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {new Date(selected.created_at).toLocaleString('zh-CN')} · 来源：{selected.source}
                  {selected.country && ` · ${selected.country}`}
                </p>
              </div>

              {/* 联系信息 */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex gap-2">
                  <span className="text-gray-500 w-16 flex-shrink-0">邮箱</span>
                  <a href={`mailto:${selected.email}`} className="text-blue-600 hover:underline">{selected.email}</a>
                </div>
                {selected.phone && (
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-16 flex-shrink-0">电话</span>
                    <span className="text-gray-900">{selected.phone}</span>
                  </div>
                )}
                {selected.whatsapp && (
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-16 flex-shrink-0">WhatsApp</span>
                    <span className="text-green-600">{selected.whatsapp}</span>
                  </div>
                )}
                {selected.company && (
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-16 flex-shrink-0">公司</span>
                    <span className="text-gray-900">{selected.company}</span>
                  </div>
                )}
                {selected.subject && (
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-16 flex-shrink-0">主题</span>
                    <span className="text-gray-900">{selected.subject}</span>
                  </div>
                )}
              </div>

              {/* 留言内容 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">留言内容</h4>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {selected.message || '（无）'}
                </div>
              </div>

              {/* 状态流转 */}
              {nextStatuses.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">变更状态</h4>
                  <div className="flex flex-wrap gap-2">
                    {nextStatuses.map(s => (
                      <button
                        key={s}
                        onClick={() => changeStatus(s)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          STATUS_MAP[s]?.cls || ''
                        }`}
                        style={{
                          borderColor: STATUS_MAP[s]?.color,
                          color: STATUS_MAP[s]?.color,
                          background: 'white',
                        }}
                      >
                        → {STATUS_MAP[s]?.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 添加备注 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">添加跟进记录</h4>
                <div className="flex gap-2 mb-2">
                  {[
                    { v: 'note', l: '备注' },
                    { v: 'call', l: '电话' },
                    { v: 'email', l: '邮件' },
                    { v: 'whatsapp', l: 'WhatsApp' },
                    { v: 'quote', l: '报价' },
                  ].map(a => (
                    <button
                      key={a.v}
                      onClick={() => setNoteAction(a.v)}
                      className={`px-3 py-1 rounded text-xs transition-colors ${
                        noteAction === a.v
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {a.l}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="输入跟进内容..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={addNote}
                    disabled={savingNote || !newNote.trim()}
                    className="admin-btn-primary text-sm"
                  >
                    {savingNote ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>

              {/* 跟进记录时间线 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">跟进记录</h4>
                {followUps.length === 0 ? (
                  <p className="text-sm text-gray-400">暂无跟进记录</p>
                ) : (
                  <div className="space-y-3">
                    {followUps.map((fu) => (
                      <div key={fu.id} className="flex gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-medium text-gray-700">
                              {fu.action === 'status_change' ? '状态变更' :
                               fu.action === 'note' ? '备注' :
                               fu.action === 'call' ? '电话' :
                               fu.action === 'email' ? '邮件' :
                               fu.action === 'whatsapp' ? 'WhatsApp' :
                               fu.action === 'quote' ? '报价' : fu.action}
                            </span>
                            {fu.status_before && fu.status_after && (
                              <span>
                                {STATUS_MAP[fu.status_before]?.label} → {STATUS_MAP[fu.status_after]?.label}
                              </span>
                            )}
                            <span>{new Date(fu.created_at).toLocaleString('zh-CN')}</span>
                          </div>
                          {fu.content && (
                            <p className="text-gray-600 mt-1">{fu.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
