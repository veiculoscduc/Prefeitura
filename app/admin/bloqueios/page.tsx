import { getStoreData } from '@/lib/actions';
import { AdminBlocksView } from '@/components/AdminBlocksView';

export default async function AdminBloqueiosPage() {
  const { blocks, vehicles } = await getStoreData();

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="h-16 border-b border-gray-200 flex items-center justify-between px-8 shrink-0 bg-white">
        <h1 className="text-xl font-bold text-slate-800">Gerenciamento de Bloqueios</h1>
      </header>
      <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
        <AdminBlocksView blocks={blocks} vehicles={vehicles} />
      </div>
    </div>
  );
}
