'use client';

import React from 'react';
import { ScheduleRequest, User } from '@/lib/types';
import { cancelRequest, confirmReturn } from '@/lib/actions';

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
        let statusText: string = req.status;
        if (req.status === 'CONFIRMADO') badgeClass = "bg-emerald-100 text-emerald-700";
        if (req.status === 'SOLICITADO') badgeClass = "bg-amber-100 text-amber-700";
        if (req.status === 'NEGADO' || req.status === 'CANCELADO_USUARIO') badgeClass = "bg-rose-100 text-rose-700";
        if (req.status === 'EM_ANDAMENTO') badgeClass = "bg-blue-100 text-blue-700";
        if (req.status === 'AGUARDANDO_CONFIRMACAO') {
          badgeClass = "bg-amber-100 text-amber-850 animate-pulse border border-amber-300";
          statusText = "AGUARDANDO CONFIRMAÇÃO";
        }

        return (
          <div key={req.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-lg text-slate-800 border-b border-slate-100 pb-2 flex-1">
                {req.dataSaida} 
                <span className="text-sm font-normal text-slate-500 ml-2">das {req.horaSaida} às {req.horaRetorno}</span>
              </h3>
              <span className={`ml-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                {statusText}
              </span>
            </div>
            
            <div className="text-sm text-slate-600 mb-4 space-y-1">
              <p><strong className="text-slate-800">Destino:</strong> {req.enderecoDestino}</p>
              {req.vaiSairCampus && req.horarioNoLocal && (
                <div className="flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded w-max mt-1">
                  <span>Horário no Local:</span>
                  <span className="font-bold">{req.horarioNoLocal}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-lg p-3 text-sm border border-slate-100 mb-4 text-slate-600">
              <p><strong className="text-slate-800">Motorista(s):</strong> {driversAssigned}</p>
              {req.justificativaRejeicao && (
                <p className="mt-2 text-rose-600">
                  <strong className="text-rose-700">Justificativa da Rejeição:</strong> {req.justificativaRejeicao}
                </p>
              )}
            </div>

            {req.status === 'AGUARDANDO_CONFIRMACAO' && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 text-sm text-slate-700 mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-3xs">
                <div className="space-y-0.5">
                  <p className="text-amber-850 font-bold text-sm">Ação Requerida: Confirmar corrida realizada</p>
                  <p className="text-xs text-slate-650 leading-relaxed">
                    O motorista completou a viagem e reportou o retorno com a quilometragem final de <span className="font-bold underline text-slate-800">{req.kmRetorno} KM</span>.
                    Para fins regulamentares e encerramento do processo, confirme a realização da viagem.
                  </p>
                </div>
                <button
                  id={`btn-confirm-return-${req.id}`}
                  onClick={async () => {
                    const res = await confirmReturn(req.id);
                    if (res?.error) {
                      console.error(res.error);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded shadow-xs cursor-pointer transition-all uppercase tracking-wider shrink-0"
                >
                  Confirmar Realização
                </button>
              </div>
            )}

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
