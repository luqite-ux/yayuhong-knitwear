import ServicesManager from '@/components/admin/ServicesManager';

export const dynamic = 'force-dynamic';

export default function ServicesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">服务内容</h1>
      <ServicesManager />
    </div>
  );
}
