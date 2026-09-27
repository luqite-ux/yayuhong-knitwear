'use client';

import { useState } from 'react';
import { pick } from '@/lib/i18n';

interface Faq {
  id: string;
  category: string | null;
  question: Record<string, string>;
  question_text: string;
  answer: Record<string, string>;
  answer_text: string;
  sort: number;
  is_active: boolean;
  created_at: string;
  sites?: string[];
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  active: { label: '启用', cls: 'admin-badge-green' },
  inactive: { label: '停用', cls: 'admin-badge-gray' },
};

export default function FaqsManager({ faqs: initial }: { faqs: Faq[] }) {
  const [faqs, setFaqs] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    category: '',
    question_zh: '',
    question_en: '',
    question_ru: '',
    answer_zh: '',
    answer_en: '',
    answer_ru: '',
    sort: 0,
    is_active: true,
    sites: ['global'],
  });

  function openCreate() {
    setEditing(null);
    setForm({
      category: '',
      question_zh: '', question_en: '', question_ru: '',
      answer_zh: '', answer_en: '', answer_ru: '',
      sort: 0, is_active: true, sites: ['global'],
    });
    setShowForm(true);
  }

  function openEdit(faq: Faq) {
    setEditing(faq);
    setForm({
      category: faq.category || '',
      question_zh: faq.question?.zh || '',
      question_en: faq.question?.en || '',
      question_ru: faq.question?.ru || '',
      answer_zh: faq.answer?.zh || '',
      answer_en: faq.answer?.en || '',
      answer_ru: faq.answer?.ru || '',
      sort: faq.sort,
      is_active: faq.is_active,
      sites: faq.sites || ['global'],
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const question = { zh: form.question_zh, en: form.question_en, ru: form.question_ru };
    const answer = { zh: form.answer_zh, en: form.answer_en, ru: form.answer_ru };
    const payload = { ...form, question, answer };

    const method = editing ? 'PUT' : 'POST';
    const body = editing ? { ...payload, id: editing.id } : payload;
    const res = await fetch('/api/admin/faqs', {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const result = await res.json();
    if (!res.ok) { alert(result.error || '保存失败'); setSaving(false); return; }

    setShowForm(false); setEditing(null);
    // 刷新列表
    const listRes = await fetch('/api/admin/faqs');
    const data = await listRes.json();
    if (data.faqs) {
      setFaqs(data.faqs.map((f: any) => ({
        ...f,
        question_text: pick(f.question, 'zh'),
        answer_text: pick(f.answer, 'zh'),
      })));
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除此 FAQ？')) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/faqs?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setFaqs(faqs.filter(f => f.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || '删除失败');
    }
    setDeletingId(null);
  }

  // 按分类分组
  const groups = faqs.reduce((acc: Record<string, Faq[]>, f) => {
    const cat = f.category || '未分类';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">共 {faqs.length} 条 FAQ</p>
        <button onClick={openCreate} className="admin-btn-primary">+ 新增 FAQ</button>
      </div>

      {Object.keys(groups).length === 0 ? (
        <div className="admin-card text-center py-12 text-gray-400">暂无 FAQ，点击右上角新增。</div>
      ) : (
        Object.entries(groups).map(([cat, items]) => (
          <div key={cat} className="admin-card mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-[var(--color-primary)] rounded-full"></span>
              {cat}
              <span className="text-xs text-gray-400 font-normal">({items.length})</span>
            </h3>
            <div className="space-y-3">
              {items.map((faq) => (
                <div key={faq.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`admin-badge ${faq.is_active ? 'admin-badge-green' : 'admin-badge-gray'}`}>
                          {faq.is_active ? '启用' : '停用'}
                        </span>
                        <span className="text-xs text-gray-400">排序 {faq.sort}</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{faq.question_text || '（无中文问题）'}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2">{faq.answer_text || '（无中文答案）'}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => openEdit(faq)} className="admin-btn-secondary text-sm">编辑</button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        disabled={deletingId === faq.id}
                        className="admin-btn-danger text-sm"
                      >
                        {deletingId === faq.id ? '删除中' : '删除'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* 弹窗 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{editing ? '编辑 FAQ' : '新增 FAQ'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="如：产品、合作、物流"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.sort}
                    onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">问题（中文）*</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={form.question_zh}
                  onChange={(e) => setForm({ ...form, question_zh: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">问题（英文）</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.question_en}
                  onChange={(e) => setForm({ ...form, question_en: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">问题（俄文）</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.question_ru}
                  onChange={(e) => setForm({ ...form, question_ru: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">答案（中文）*</label>
                <textarea
                  required
                  rows={4}
                  className="form-input"
                  value={form.answer_zh}
                  onChange={(e) => setForm({ ...form, answer_zh: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">答案（英文）</label>
                <textarea
                  rows={4}
                  className="form-input"
                  value={form.answer_en}
                  onChange={(e) => setForm({ ...form, answer_en: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">答案（俄文）</label>
                <textarea
                  rows={4}
                  className="form-input"
                  value={form.answer_ru}
                  onChange={(e) => setForm({ ...form, answer_ru: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="faq_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                <label htmlFor="faq_active" className="text-sm text-gray-700">启用</label>
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
                        checked={(form.sites as string[]).includes(opt.value)}
                        onChange={(e) => {
                          const current = form.sites as string[];
                          const next = e.target.checked
                            ? [...current, opt.value]
                            : current.filter((s) => s !== opt.value);
                          setForm({ ...form, sites: next.length > 0 ? next : ['global'] });
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="admin-btn-secondary">
                  取消
                </button>
                <button type="submit" disabled={saving} className="admin-btn-primary">
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
