import { getStoreData } from '@/lib/actions';
import { AdminVehicleList } from '@/components/AdminVehicleList';

export default async function AdminVeiculosPage() {
  const { vehicles } = await getStoreData();

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
       <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Veículos</h1>
          <p className="text-slate-500 mt-1">Gestão da frota institucional.</p>
        </div>
      </div>

      <AdminVehicleList vehicles={vehicles} />
    </div>
  );
}
