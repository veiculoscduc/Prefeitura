'use client';

import React from 'react';
import { ScheduleRequest, User } from '@/lib/types';
import { cancelRequest } from '@/lib/actions';

export function MyRequestsList({ requests, users }: { requests: ScheduleRequest[], users: User[] }) {
  if (requests.length === 0) {
    return <div className="text-slate-500">Você ainda não possui solicitações.</div>;
  }

  return (
    <div className="space-y-4">
      {requests.map(req => {
        const hasDriver = req.motoristasIds && req.motoristasIds.length > 0;
        const driversAssigned = hasDriver ? req.motoristasIds.map(mid => users.find(u => u.id === mid)?.name).join(', ') : 'Aguardando atribuição';

        let badgeClass = "bg-slate-100 text-slate-700";
        if (req.status === 'CONFIRMADO') badgeClass = "bg-emerald-100 text-emerald-700";
        if (req.status === 'SOLICITADO') badgeClass = "bg-amber-100 text-amber-700";
        if (req.status === 'NEGADO' || req.status === 'CANCELADO_USUARIO') badgeClass = "bg-rose-100 text-rose-700";
        if (req.status === 'EM_ANDAMENTO') badgeClass = "bg-blue-100 text-blue-700";

        return (
          <div key={req.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-lg text-slate-800 border-b border-slate-100 pb-2 flex-1">
                {req.dataSaida} 
                <span className="text-sm font-normal text-slate-500 ml-2">das {req.horaSaida} às {req.horaRetorno}</span>
              </h3>
              <span className={`ml-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                {req.status}
              </span>
            </div>
            
            <div className="text-sm text-slate-600 mb-4">
              <p><strong className="text-slate-800">Destino:</strong> {req.enderecoDestino}</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 text-sm border border-slate-100 mb-4 text-slate-600">
              <p><strong className="text-slate-800">Motorista(s):</strong> {driversAssigned}</p>
              {req.justificativaRejeicao && (
                <p className="mt-2 text-rose-600">
                  <strong className="text-rose-700">Justificativa da Rejeição:</strong> {req.justificativaRejeicao}
                </p>
              )}
            </div>

            {req.status === 'SOLICITADO' && (
              <div className="flex justify-end border-t border-slate-100 pt-3">
                <button 
                  onClick={() => {
                    cancelRequest(req.id);
                  }}
                  className="bg-white border border-rose-200 text-rose-600 text-xs font-bold px-4 py-2 rounded hover:bg-rose-50 transition-colors"
                >
                  CANCELAR SOLICITAÇÃO
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
