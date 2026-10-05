import EquipmentsManager from '@/components/admin/EquipmentsManager';
import ProcessesManager from '@/components/admin/ProcessesManager';

export const dynamic = 'force-dynamic';

export default function FactoryPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">工厂数据</h1>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">生产设备</h2>
        <EquipmentsManager />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">生产流程</h2>
        <ProcessesManager />
      </div>
    </div>
  );
}
