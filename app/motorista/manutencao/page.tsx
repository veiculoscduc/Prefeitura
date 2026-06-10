import { getStoreData } from '@/lib/actions';
import { MaintenanceForm } from '@/components/MaintenanceForm';

export default async function MotoristaManutencaoPage() {
  const { vehicles } = await getStoreData();

  return (
    <div className="flex-1 overflow-y-auto w-full bg-gray-50">
      <div className="p-8 max-w-4xl mx-auto w-full">
        <MaintenanceForm vehicles={vehicles} />
      </div>
    </div>
  );
}
