import { getStoreData } from '@/lib/actions';
import { RefuelingForm } from '@/components/RefuelingForm';

export default async function MotoristaAbastecimentoPage() {
  const { vehicles } = await getStoreData();

  return (
    <div className="flex-1 overflow-y-auto w-full bg-gray-50">
      <div className="p-8 max-w-4xl mx-auto w-full">
        <RefuelingForm vehicles={vehicles} />
      </div>
    </div>
  );
}
