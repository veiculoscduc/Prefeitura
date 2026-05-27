import { getStoreData } from '@/lib/actions';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { AdminRequestsTable } from '@/components/AdminRequestsTable';

export default async function AdminSolicitacoesPage() {
  const { requests, users, vehicles } = await getStoreData();

  // Sort by created descending
  const sortedRequests = [...requests].sort((a, b) => new Date(b.dataSolicitacao).getTime() - new Date(a.dataSolicitacao).getTime());

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="h-16 border-b border-gray-200 flex items-center justify-between px-8 shrink-0 bg-white">
        <h1 className="text-xl font-bold text-slate-800">Gerenciamento de Solicitações</h1>
      </header>

      <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
        <AdminRequestsTable requests={sortedRequests} users={users} vehicles={vehicles} />
      </div>
    </div>
  );
}
