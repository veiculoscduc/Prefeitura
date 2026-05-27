import { getStoreData } from '@/lib/actions';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = await getStoreData();

  if (!currentUser || currentUser.role !== 'ADMIN') {
    redirect('/');
  }

  return <>{children}</>;
}
