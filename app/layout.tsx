import type { Metadata } from 'next';
import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Sidebar } from '@/components/layout/Sidebar';
import { AuthView } from '@/components/AuthView';
import { getStoreData } from '@/lib/actions';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Sistema de Agendamento de Veículos',
  description: 'Sistema institucional para requisição e gestão de frota',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = await getStoreData();

  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-gray-50 text-slate-800 h-screen flex overflow-hidden" suppressHydrationWarning>
        {currentUser ? (
          <>
            <Sidebar currentUser={currentUser} />
            
            <main className="flex-1 flex flex-col min-h-0 bg-white overflow-y-auto">
              {children}
            </main>
          </>
        ) : (
          <AuthView />
        )}
      </body>
    </html>
  );
}

