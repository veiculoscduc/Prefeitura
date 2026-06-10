import { getStoreData } from '@/lib/actions';
import { DriverMyRidesList } from '@/components/DriverMyRidesList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DriverCorridasPage() {
  const { requests, currentUser, vehicles, users } = await getStoreData();

  if (!currentUser) return null;

  return (
    <div className="flex-1 overflow-y-auto w-full bg-gray-50">
      <div className="p-8 max-w-4xl mx-auto w-full">
         <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Minhas Corridas</h1>
            <p className="text-slate-500 mt-1">Registre as saídas, os retornos e, se preciso, abastecimentos ou manutenções da frota.</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link href="/motorista/abastecimento">
              <Button variant="outline" className="gap-2 bg-white text-slate-700 hover:bg-slate-50 border-slate-200">
                Registrar Abastecimento
              </Button>
            </Link>
            <Link href="/motorista/manutencao">
              <Button variant="outline" className="gap-2 bg-white text-amber-700 hover:bg-amber-50/50 border-amber-200">
                Registrar Manutenção
              </Button>
            </Link>
          </div>
        </div>

        <DriverMyRidesList requests={requests} currentUser={currentUser} vehicles={vehicles} users={users} />
      </div>
    </div>
  );
}
