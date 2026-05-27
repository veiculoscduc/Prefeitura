import { getStoreData } from '@/lib/actions';
import { MyRequestsList } from '@/components/MyRequestsList';

export default async function SolicitanteMinhasPage() {
  const { requests, currentUser, users } = await getStoreData();

  if (!currentUser) return null;

  const myRequests = requests.filter(r => r.solicitanteId === currentUser.id).sort((a,b) => new Date(b.dataSolicitacao).getTime() - new Date(a.dataSolicitacao).getTime());

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col p-8 items-center">
      <div className="w-full max-w-4xl">
         <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Minhas Solicitações</h1>
            <p className="text-slate-500 mt-1">Acompanhe o status dos seus pedidos e cancele se necessário.</p>
          </div>
        </div>

        <MyRequestsList requests={myRequests} users={users} />
      </div>
    </div>
  );
}
