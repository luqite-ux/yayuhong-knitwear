import ReadyStockManager from '@/components/admin/ReadyStockManager';

export const dynamic = 'force-dynamic';

export default function ReadyStockPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">现货展示</h1>
      <ReadyStockManager />
    </div>
  );
}
