import { getStoreData } from '@/lib/actions';
import { AdminUserList } from '@/components/AdminUserList';

export default async function AdminUsuariosPage() {
  const { users } = await getStoreData();

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
       <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Usuários</h1>
          <p className="text-slate-500 mt-1">Gestão de solicitantes, administradores e motoristas.</p>
        </div>
      </div>

      <AdminUserList users={users} />
    </div>
  );
}
