import { getStoreData } from '@/lib/actions';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { RequestForm } from '@/components/RequestForm';
import { DayRequestsList } from '@/components/DayRequestsList';

// Remove strict checking for async params, standard Next.js 15 requires unwrapping properly.
export default async function DiaPage({ params }: { params: Promise<{ date: string }> }) {
  const resolvedParams = await params;
  const { date } = resolvedParams;
  const { currentUser, requests, vehicles, users, blocks } = await getStoreData();

  if (!currentUser) return null;

  const dayRequests = requests.filter(r => r.dataSaida === date);
  const parsedDate = parseISO(date);
  const isBlocked = blocks.some(b => {
    const isWithinDays = date >= b.dataInicio && date <= b.dataFim;
    return isWithinDays && !b.horaInicio && !b.horaFim;
  });

  const activeBlocksOfDay = blocks.filter(b => date >= b.dataInicio && date <= b.dataFim);

  return (
    <div className="flex-1 flex overflow-hidden min-h-0">
      <div className="flex-1 overflow-y-auto p-8 flex flex-col bg-gray-50">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-blue-600 font-medium hover:text-blue-800 mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar para a Agenda
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 capitalize">
            {format(parsedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h1>
          {activeBlocksOfDay.length > 0 && (
            <div className="mt-4 space-y-2">
              {activeBlocksOfDay.map(b => {
                const isFullDay = !b.horaInicio && !b.horaFim;
                const label = isFullDay ? 'Bloqueio do Dia' : 'Bloqueio de Horário';
                const timeStr = isFullDay ? 'Dia Inteiro' : `${b.horaInicio || '00:00'} às ${b.horaFim || '23:59'}`;
                return (
                  <div key={b.id} className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs bg-rose-200 px-2 py-1 rounded text-rose-900 mr-2 uppercase tracking-wide">{label}</span>
                      <span className="text-sm font-medium">{timeStr}</span>
                    </div>
                    <span className="text-sm opacity-80">{b.justificativa}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h2 className="font-semibold text-lg mb-4 text-slate-800">Agendamentos do Dia</h2>
          <DayRequestsList requests={dayRequests} currentUser={currentUser} users={users} vehicles={vehicles} />
        </div>
      </div>

      <aside className="w-96 border-l border-gray-200 bg-white p-6 flex flex-col overflow-y-auto shrink-0 shadow-sm">
         <h2 className="font-bold text-lg mb-6 text-slate-800">Nova Solicitação</h2>
         {isBlocked ? (
           <p className="text-sm text-slate-500">Agendamentos fechados para esta data.</p>
         ) : (
           <RequestForm date={date} vehicles={vehicles} />
         )}

         <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mt-auto">
            <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase">Regras de Intervalo</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              O sistema impõe um intervalo de <strong>1 hora</strong> entre viagens do mesmo veículo para manutenção e limpeza básica.
            </p>
         </div>
      </aside>
    </div>
  );
}
