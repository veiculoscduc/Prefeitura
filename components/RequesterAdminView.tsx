'use client';

import React from 'react';
import { ScheduleRequest, Vehicle, User } from '@/lib/types';
import { CalendarView } from '@/components/CalendarView';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getStoreData } from '@/lib/actions';

export function RequesterAdminView({ initialRequests, vehicles, blocks }: { initialRequests: ScheduleRequest[], vehicles: Vehicle[], blocks: any[] }) {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
      <header className="h-16 border-b border-gray-200 flex items-center justify-between px-8 shrink-0 bg-white">
        <h1 className="text-xl font-bold text-slate-800">Agenda de Veículos</h1>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 text-sm font-medium text-slate-600">
            <span className="flex items-center"><span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span> Livre</span>
            <span className="flex items-center"><span className="w-3 h-3 bg-amber-500 rounded-full mr-2"></span> Parcial</span>
            <span className="flex items-center"><span className="w-3 h-3 bg-rose-500 rounded-full mr-2"></span> Ocupado</span>
          </div>
          <button 
            onClick={() => router.push(`/agenda/dia/${format(new Date(), 'yyyy-MM-dd')}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            + Nova Solicitação
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col p-8">
        <CalendarView 
          requests={initialRequests} 
          vehicles={vehicles} 
          blocks={blocks}
          onDayClick={(date) => {
            router.push(`/agenda/dia/${format(date, 'yyyy-MM-dd')}`);
          }}
        />
      </div>
    </div>
  );
}
