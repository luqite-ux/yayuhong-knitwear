import BlocksManager from '@/components/admin/BlocksManager';

export const dynamic = 'force-dynamic';

export default function BlocksPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">内容区块</h1>
      <BlocksManager />
    </div>
  );
}
