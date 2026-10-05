import FeaturesManager from '@/components/admin/FeaturesManager';

export const dynamic = 'force-dynamic';

export default function FeaturesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">优势特点</h1>
      <FeaturesManager />
    </div>
  );
}
