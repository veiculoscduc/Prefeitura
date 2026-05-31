'use client';

import React from 'react';
import { ScheduleRequest, Vehicle, User } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { claimRequest } from '@/lib/actions';
import { MapPin, Clock, CalendarDays, ExternalLink } from 'lucide-react';

export function DriverView({ requests, vehicles, users, currentUser }: { requests: ScheduleRequest[], vehicles: Vehicle[], users: User[], currentUser: User }) {
  const [loading, setLoading] = React.useState<string | null>(null);
  
  // Show only CONFIRMADO requests that the current driver hasn't claimed yet, or needs more drivers
  const availableRequests = requests.filter(r => 
    r.status === 'CONFIRMADO' && 
    (!r.motoristasIds || r.motoristasIds.length < r.veiculosIds.length) &&
    !r.motoristasIds?.includes(currentUser.id)
  ).sort((a, b) => {
    const dateA = new Date(`${a.dataSaida}T${a.horaSaida}`);
    const dateB = new Date(`${b.dataSaida}T${b.horaSaida}`);
    return dateA.getTime() - dateB.getTime();
  });

  async function handleClaim(id: string) {
    setLoading(id);
    try {
      const response = await claimRequest(id);
      if (response && 'error' in response) {
         console.error(response.error);
      }
    } catch (e: any) {
      console.error(e.message);
    }
    setLoading(null);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto w-full flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Solicitações Confirmadas</h1>
        <p className="text-slate-500 mt-1">Olá, {currentUser.name}. Assuma as corridas disponíveis abaixo.</p>
      </div>

      {availableRequests.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhuma corrida disponível no momento.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {availableRequests.map(req => {
            const requester = users.find(u => u.id === req.solicitanteId);
            return (
              <div key={req.id} className="bg-white border flex flex-col border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">
                      {format(parseISO(req.dataSaida), 'dd/MM/yyyy')}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-600 font-mono">
                      <Clock className="w-4 h-4" />
                      {req.horaSaida} - {req.horaRetorno}
                    </div>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                    {req.veiculosIds.length} Veículo(s)
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <span className="text-slate-500 block text-xs">Destino</span>
                      <span className="font-medium">{req.enderecoDestino}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-slate-500 text-xs mb-1">Solicitante</p>
                    <p className="font-medium text-slate-900">{requester?.name}</p>
                    {!req.vaiAcompanhar && (
                      <p className="text-xs text-slate-500 mt-1">
                        Passageiro: {req.nomePassageiro}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700" 
                    onClick={() => handleClaim(req.id)}
                    disabled={loading === req.id}
                  >
                    {loading === req.id ? 'Confirmando...' : 'Eu Vou'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
