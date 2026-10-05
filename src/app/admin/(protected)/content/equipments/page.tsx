import EquipmentsManager from '@/components/admin/EquipmentsManager';

export const dynamic = 'force-dynamic';

export default function EquipmentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">设备管理</h1>
      <EquipmentsManager />
    </div>
  );
}
