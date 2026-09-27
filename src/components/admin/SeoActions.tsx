'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SeoActions() {
  const router = useRouter();
  const [bootstrapping, setBootstrapping] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  async function handleBootstrap() {
    if (!confirm('一键启动将：生词关键词种子、配置 SEO、生成首批文章。确定继续？')) return;
    setBootstrapping(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/seo/bootstrap', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage('一键启动完成。' + JSON.stringify(data.details || {}));
      } else {
        setMessage('失败：' + (data.error || '未知错误'));
      }
      router.refresh();
    } catch {
      setMessage('网络错误');
    }
    setBootstrapping(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/seo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`生成完成：成功 ${data.success} 篇，失败 ${data.failed} 篇，费用 $${(data.cost || 0).toFixed(4)}`);
      } else {
        setMessage('失败：' + (data.error || '未知错误'));
      }
      router.refresh();
    } catch {
      setMessage('网络错误');
    }
    setGenerating(false);
  }

  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-2">
        <button
          onClick={handleBootstrap}
          disabled={bootstrapping}
          className="admin-btn admin-btn-primary"
        >
          {bootstrapping ? '启动中...' : '一键启动'}
        </button>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="admin-btn admin-btn-secondary"
        >
          {generating ? '生成中...' : '生成文章'}
        </button>
      </div>
      {message && (
        <div className="p-3 rounded-lg bg-blue-50 text-blue-700 text-sm">{message}</div>
      )}
    </div>
  );
}
