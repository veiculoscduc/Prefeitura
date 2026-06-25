'use client';

import React, { useState } from 'react';
import { ScheduleRequest, Vehicle, User } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { registerDeparture, registerReturn, unclaimRequest } from '@/lib/actions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function DriverMyRidesList({ requests, currentUser, vehicles, users }: { requests: ScheduleRequest[], currentUser: User, vehicles: Vehicle[], users: User[] }) {
  const [kmInput, setKmInput] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const myRides = requests
    .filter(r => (r.status === 'CONFIRMADO' || r.status === 'EM_ANDAMENTO' || r.status === 'AGUARDANDO_CONFIRMACAO') && r.motoristasIds?.includes(currentUser.id))
    .sort((a, b) => {
      const dateA = new Date(`${a.dataSaida}T${a.horaSaida}`);
      const dateB = new Date(`${b.dataSaida}T${b.horaSaida}`);
      return dateA.getTime() - dateB.getTime();
    });
  
  if (myRides.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
        Nenhuma corrida sob sua responsabilidade (Confirmada, Em Andamento ou Aguardando Confirmação).
      </div>
    );
  }

  const handleDeparture = async (id: string) => {
    const km = parseFloat(kmInput[id]);
    if (isNaN(km)) return alert("KM inválido");
    setLoading(id);
    try {
      await registerDeparture(id, km);
    } finally {
      setLoading(null);
    }
  };

  const handleReturn = async (id: string) => {
    const km = parseFloat(kmInput[id]);
    if (isNaN(km)) return alert("KM inválido");
    setLoading(id);
    try {
      await registerReturn(id, km);
    } finally {
      setLoading(null);
    }
  };

  const handleUnclaim = async (id: string) => {
    setLoading(id);
    try {
      const response = await unclaimRequest(id);
      if (response && 'error' in response) {
        console.error(response.error);
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {myRides.map(req => {
        const solicitante = users.find(u => u.id === req.solicitanteId);
        const reqVehicles = vehicles.filter(v => req.veiculosIds?.includes(v.id));
        const localSaida = (req.vaiSairCampus || !req.enderecoSaida) ? "Saída do Campus" : req.enderecoSaida;
        return (
          <div key={req.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
             <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="font-semibold text-lg text-slate-900 border-b border-slate-200 pb-2 mb-2">
                    {format(parseISO(req.dataSaida), 'dd/MM/yyyy')} 
                    <span className="text-sm font-normal text-slate-500 ml-2">Das {req.horaSaida} às {req.horaRetorno}</span>
                  </h3>
                  <div className="text-sm space-y-1.5">
                    <p className="text-slate-700">
                      <span className="font-bold text-slate-800">Veículo:</span> {reqVehicles.map(v => v.name).join(', ') || 'Não definido'}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-bold text-slate-800">Local de Saída:</span> {localSaida}
                    </p>
                    {req.observacoes && (
                      <p className="text-amber-700 text-xs bg-amber-50 border border-amber-100 p-1.5 rounded mt-1">
                        <span className="font-bold text-amber-800">Obs:</span> {req.observacoes}
                      </p>
                    )}
                    {req.vaiSairCampus && req.horarioNoLocal && (
                      <p className="flex items-center gap-1.5 text-xs text-indigo-850 bg-indigo-50/50 p-1 rounded border border-indigo-100 max-w-max">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-bold">Horário no Local:</span> {req.horarioNoLocal}
                      </p>
                    )}
                    <p className="flex items-center gap-1.5 text-slate-700"><MapPin className="w-4 h-4 text-emerald-500" /> <span className="font-bold text-slate-800">Destino:</span> {req.enderecoDestino}</p>
                    <p className="text-slate-600"><span className="font-semibold">Passageiro:</span> {req.vaiAcompanhar ? solicitante?.name : req.nomePassageiro}</p>
                  </div>
               </div>
               <div className="flex flex-col items-end gap-2">
                 <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                   req.status === 'EM_ANDAMENTO' 
                     ? 'bg-blue-100 text-blue-800' 
                     : req.status === 'AGUARDANDO_CONFIRMACAO'
                     ? 'bg-amber-100 text-amber-800 animate-pulse border border-amber-300'
                     : 'bg-emerald-100 text-emerald-800'
                 }`}>
                   {req.status === 'AGUARDANDO_CONFIRMACAO' ? 'AGUARDANDO CONFIRMAÇÃO' : req.status}
                 </span>
                 {req.status === 'CONFIRMADO' && (
                   <button 
                     onClick={() => handleUnclaim(req.id)}
                     disabled={loading === req.id}
                     className="text-xs font-bold text-rose-600 hover:text-rose-800 uppercase tracking-wider"
                   >
                     Desistir da Corrida
                   </button>
                 )}
               </div>
             </div>

             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
               {req.status === 'CONFIRMADO' && (
                 <div className="flex items-end gap-4">
                   <div className="flex-1 space-y-1">
                     <Label>KM de Saída</Label>
                     <Input 
                       type="number" 
                       placeholder="Ex: 50200.5" 
                       value={kmInput[req.id] || ''} 
                       onChange={e => setKmInput({...kmInput, [req.id]: e.target.value})} 
                     />
                   </div>
                   <Button onClick={() => handleDeparture(req.id)} disabled={loading === req.id || !kmInput[req.id]}>
                     Registrar Saída <ArrowRight className="w-4 h-4 ml-2" />
                   </Button>
                 </div>
               )}

               {req.status === 'EM_ANDAMENTO' && (
                 <div className="flex items-end gap-4">
                   <div className="flex-1 space-y-1">
                     <Label>KM de Retorno</Label>
                     <Input 
                       type="number" 
                       placeholder="Ex: 50250.5" 
                       value={kmInput[req.id] || ''} 
                       onChange={e => setKmInput({...kmInput, [req.id]: e.target.value})} 
                     />
                   </div>
                   <Button variant="outline" className="text-emerald-700 bg-white hover:bg-emerald-50 border-emerald-200" onClick={() => handleReturn(req.id)} disabled={loading === req.id || !kmInput[req.id]}>
                     Registrar Retorno
                   </Button>
                 </div>
               )}

               {req.status === 'AGUARDANDO_CONFIRMACAO' && (
                 <div className="text-slate-600 space-y-1.5 text-sm bg-amber-50/50 p-3 rounded-md border border-amber-200">
                   <p className="font-semibold text-amber-850 text-xs">Retorno Registrado com Sucesso</p>
                   <p className="text-xs">
                     KM de Saída: <span className="font-semibold text-slate-800">{req.kmSaida}</span> | KM de Retorno: <span className="font-semibold text-slate-800">{req.kmRetorno}</span>
                   </p>
                   <p className="text-[11px] text-slate-500 italic">Aguardando que o solicitante confirme a realização da corrida.</p>
                 </div>
               )}
             </div>
          </div>
        );
      })}
    </div>
  );
}
