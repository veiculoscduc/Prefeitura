import { getStoreData } from '@/lib/actions';
import { RequesterAdminView } from '@/components/RequesterAdminView';
import { DriverView } from '@/components/DriverView';

export default async function Home() {
  const { currentUser, requests, vehicles, users, blocks } = await getStoreData();

  if (!currentUser) return <div className="p-10">Carregando...</div>;

  if (currentUser.role === 'MOTORISTA') {
    return <DriverView requests={requests} vehicles={vehicles} users={users} currentUser={currentUser} />;
  }

  // Admin or Solicitante
  return <RequesterAdminView initialRequests={requests} vehicles={vehicles} blocks={blocks} currentUser={currentUser} />;
}
