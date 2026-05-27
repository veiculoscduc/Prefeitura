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

  const myRides = requests.filter(r => (r.status === 'CONFIRMADO' || r.status === 'EM_ANDAMENTO') && r.motoristasIds?.includes(currentUser.id));
  
  if (myRides.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
        Nenhuma corrida sob sua responsabilidade (Confirmada ou Em Andamento).
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
        return (
          <div key={req.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
             <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="font-semibold text-lg text-slate-900 border-b border-slate-200 pb-2 mb-2">
                    {format(parseISO(req.dataSaida), 'dd/MM/yyyy')} 
                    <span className="text-sm font-normal text-slate-500 ml-2">Das {req.horaSaida} às {req.horaRetorno}</span>
                  </h3>
                  <div className="text-sm space-y-1">
                    <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-emerald-500" /> {req.enderecoDestino}</p>
                    <p className="text-slate-600">Passageiro: {req.vaiAcompanhar ? solicitante?.name : req.nomePassageiro}</p>
                  </div>
               </div>
               <div className="flex flex-col items-end gap-2">
                 <span className={`text-xs px-3 py-1 rounded-full font-semibold ${req.status === 'EM_ANDAMENTO' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                   {req.status}
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
             </div>
          </div>
        );
      })}
    </div>
  );
}
