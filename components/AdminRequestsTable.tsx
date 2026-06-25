'use client';

import React from 'react';
import { ScheduleRequest, User, Vehicle } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { adminApprove, adminReject, assignDriver, unclaimRequest, adminCancel } from '@/lib/actions';

export function AdminRequestsTable({ requests, users, vehicles }: { requests: ScheduleRequest[], users: User[], vehicles: Vehicle[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-bold tracking-wider text-slate-500">Solicitante / Contato</th>
            <th className="px-6 py-4 font-bold tracking-wider text-slate-500">Status</th>
            <th className="px-6 py-4 font-bold tracking-wider text-slate-500">Datas / Horários</th>
            <th className="px-6 py-4 font-bold tracking-wider text-slate-500">Detalhes de Saída</th>
            <th className="px-6 py-4 font-bold tracking-wider text-slate-500">Passageiro</th>
            <th className="px-6 py-4 font-bold tracking-wider text-slate-500">Destino / Veículos</th>
            <th className="px-6 py-4 font-bold tracking-wider text-slate-500 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {requests.map(req => {
            const solicitante = users.find(u => u.id === req.solicitanteId);
            const veiculosNomes = req.veiculosIds.map(vid => {
              const v = vehicles.find(x => x.id === vid);
              return v ? `${v.name} (${v.quantidadePassageiros || 4})` : '';
            }).filter(Boolean).join(', ');
            let badgeClass = "bg-slate-100 text-slate-700";
            let statusText: string = req.status;
            if (req.status === 'CONFIRMADO') badgeClass = "bg-emerald-100 text-emerald-700";
            if (req.status === 'SOLICITADO') badgeClass = "bg-amber-100 text-amber-700";
            if (req.status === 'NEGADO' || req.status === 'CANCELADO_USUARIO' || req.status === 'CANCELADO_PREFEITURA') badgeClass = "bg-rose-100 text-rose-700";
            if (req.status === 'EM_ANDAMENTO') badgeClass = "bg-blue-100 text-blue-700";
            if (req.status === 'AGUARDANDO_CONFIRMACAO') {
              badgeClass = "bg-amber-100/80 text-amber-800 border border-amber-200 animate-pulse";
              statusText = "AGUARDANDO CONFIRMAÇÃO";
            }

            return (
              <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{solicitante?.name}</div>
                  <div className="text-xs text-slate-550 mt-1">{solicitante?.email}</div>
                  <div className="text-[10px] uppercase text-blue-500 font-bold mt-1">Feita em: {format(parseISO(req.dataSolicitacao), 'dd/MM/yyyy HH:mm')}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${badgeClass}`}>{statusText}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">{format(parseISO(req.dataSaida), 'dd/MM/yyyy')}</div>
                  <div className="text-xs text-slate-600 mt-1 flex items-center"><span className="font-mono">{req.horaSaida}</span> <span className="mx-1 text-slate-300">-</span> <span className="font-mono">{req.horaRetorno}</span></div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold">{req.vaiSairCampus ? 'Fora do Campus' : 'Interno'}</div>
                  {req.vaiSairCampus ? (
                    <div className="space-y-1 mt-1">
                      <div className="text-xs text-slate-500">Origem: Campus</div>
                      {req.horarioNoLocal && (
                        <div className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-1 py-0.5 rounded w-max">Horário no Loc: {req.horarioNoLocal}</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 mt-1">Origem: {req.enderecoSaida || '-'}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">{req.vaiAcompanhar ? 'Próprio Solicitante' : (req.nomePassageiro || '-')}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold truncate max-w-[200px]" title={req.enderecoDestino}>{req.enderecoDestino}</div>
                  <div className="text-xs text-slate-500 mt-1 truncate max-w-[200px]" title={veiculosNomes}>{veiculosNomes}</div>
                  {req.observacoes && (
                    <div className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 mt-1 rounded border border-amber-200 truncate max-w-[200px]" title={req.observacoes}>
                      Obs: {req.observacoes}
                    </div>
                  )}
                  {req.status === 'CONFIRMADO' && (
                     <div className="mt-2 space-y-1">
                        {req.motoristasIds?.map(mid => {
                           const d = users.find(u => u.id === mid);
                           return (
                             <div key={mid} className="text-[10px] bg-slate-200 text-slate-800 rounded px-2 py-1 flex items-center justify-between">
                               <span className="truncate">{d?.name}</span>
                               <button onClick={() => unclaimRequest(req.id, mid)} className="text-rose-500 hover:text-rose-700 font-bold ml-2">Remover</button>
                             </div>
                           )
                        })}
                        {(!req.motoristasIds || req.motoristasIds.length < req.veiculosIds.length) && (
                           <select 
                             className="text-[10px] border border-slate-300 rounded p-1 w-full mt-1 bg-white"
                             onChange={(e) => {
                                if (e.target.value) assignDriver(req.id, e.target.value);
                                e.target.value = "";
                             }}
                             defaultValue=""
                           >
                             <option value="" disabled>Atribuir motorista...</option>
                             {users.filter(u => u.role === 'MOTORISTA' && !req.motoristasIds?.includes(u.id)).map(u => (
                               <option key={u.id} value={u.id}>{u.name}</option>
                             ))}
                           </select>
                        )}
                     </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {req.status === 'SOLICITADO' && (
                    <div className="flex justify-end gap-2 mb-2">
                       <button className="bg-white border border-rose-200 text-rose-600 text-[10px] font-bold px-2 py-1.5 rounded hover:bg-rose-100 transition-colors" onClick={() => {
                        adminReject(req.id, "Rejeitado pelo administrador");
                      }}>
                        REJEITAR
                      </button>
                      <button className="bg-white border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-1.5 rounded hover:bg-emerald-100 transition-colors" onClick={() => adminApprove(req.id)}>
                        CONFIRMAR
                      </button>
                    </div>
                  )}
                  {(req.status === 'SOLICITADO' || req.status === 'CONFIRMADO') && (
                    <button className="bg-white border border-rose-200 text-rose-600 text-[10px] font-bold px-2 py-1.5 rounded hover:bg-rose-100 transition-colors inline-block" onClick={() => {
                        adminCancel(req.id, "Cancelada pela prefeitura");
                    }}>
                      CANCELAR (PREFEITURA)
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
