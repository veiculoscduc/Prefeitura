'use client';

import React from 'react';
import { ScheduleRequest, User, Vehicle } from '@/lib/types';
import { Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cancelRequest, adminApprove, adminReject } from '@/lib/actions';
import { Button } from './ui/button';

export function DayRequestsList({ requests, currentUser, users, vehicles }: { requests: ScheduleRequest[], currentUser: User, users: User[], vehicles: Vehicle[] }) {
  if (requests.length === 0) {
    return <div className="text-slate-500 text-sm py-4">Nenhum agendamento para este dia.</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMADO': return { root: 'border-blue-100 bg-blue-50', text: 'text-blue-600' };
      case 'SOLICITADO': return { root: 'border-amber-100 bg-amber-50', text: 'text-amber-600' };
      case 'NEGADO': 
      case 'CANCELADO_USUARIO': return { root: 'border-rose-100 bg-rose-50', text: 'text-rose-600' };
      case 'EM_ANDAMENTO': return { root: 'border-emerald-100 bg-emerald-50', text: 'text-emerald-600' };
      default: return { root: 'border-slate-100 bg-slate-50', text: 'text-slate-600' };
    }
  };

  return (
    <div className="space-y-4">
      {requests.map(req => {
        const solicitante = users.find(u => u.id === req.solicitanteId);
        const isAdmin = currentUser.role === 'ADMIN';
        const isOwner = currentUser.id === req.solicitanteId;
        const colors = getStatusColor(req.status);
        const veiculosNomes = req.veiculosIds.map(vid => {
          const v = vehicles.find(x => x.id === vid);
          return v ? `${v.name} (${v.quantidadePassageiros || 4})` : '';
        }).filter(Boolean).join(', ');
        const driverName = req.motoristasIds?.length ? req.motoristasIds.map(mid => users.find(u => u.id === mid)?.name).join(', ') : 'Aguardando assumir';

        return (
          <div key={req.id} className={cn("p-4 border rounded-lg", colors.root)}>
            <div className="flex justify-between items-start mb-2">
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", colors.text)}>
                {req.status}
              </span>
              <span className="text-[10px] text-slate-400">ID #{req.id.substring(0, 5)}</span>
            </div>
            
            <p className="text-sm font-semibold mb-2">Destino: {req.enderecoDestino}</p>

            <div className="space-y-1 text-xs text-slate-600">
               <div className="flex items-center"><Clock className="w-3 h-3 mr-1 opacity-60" /> {req.horaSaida} - {req.horaRetorno}</div>
               <div className="flex items-center"><MapPin className="w-3 h-3 mr-1 opacity-60" /> {req.veiculosIds.length} Veículo(s): {veiculosNomes || "?"}</div>
               <div className="flex items-center"><MapPin className="w-3 h-3 mr-1 opacity-60 flex-shrink-0 text-transparent" /> Condutor(es): {driverName}</div>
            </div>

            {req.status === 'SOLICITADO' && (
              <div className="flex space-x-2 mt-4 pt-3 border-t border-black/5">
                {isOwner && (
                  <button className="flex-1 bg-white border border-rose-200 text-rose-600 text-[10px] font-bold py-1.5 rounded hover:bg-rose-100 transition-colors" onClick={() => cancelRequest(req.id)}>
                    CANCELAR
                  </button>
                )}
                {isAdmin && (
                  <>
                    <button className="flex-1 bg-white border border-rose-200 text-rose-600 text-[10px] font-bold py-1.5 rounded hover:bg-rose-100 transition-colors" onClick={() => {
                      adminReject(req.id, "Rejeitada pelo administrador");
                    }}>
                      REJEITAR
                    </button>
                    <button className="flex-1 bg-white border border-emerald-200 text-emerald-700 text-[10px] font-bold py-1.5 rounded hover:bg-emerald-100 transition-colors" onClick={() => adminApprove(req.id)}>
                      CONFIRMAR
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
