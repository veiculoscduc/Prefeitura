'use client';

import React from 'react';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { ScheduleRequest, Vehicle, AgendaBlock } from '@/lib/types';

interface CalendarViewProps {
  requests: ScheduleRequest[];
  blocks: AgendaBlock[];
  vehicles: Vehicle[];
  onDayClick: (date: Date) => void;
}

export function CalendarView({ requests, blocks, vehicles, onDayClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  const today = startOfDay(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  function getDayStatus(date: Date) {
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Get blocks for this day
    const dayBlocks = blocks.filter(b => formattedDate >= b.dataInicio && formattedDate <= b.dataFim);
    
    const hasFullBlock = dayBlocks.some(b => !b.horaInicio && !b.horaFim);
    if (hasFullBlock) return 'RED';

    const hasHourBlock = dayBlocks.some(b => b.horaInicio || b.horaFim);
    if (hasHourBlock) return 'YELLOW';

    const dayRequests = requests.filter(r => r.dataSaida === formattedDate && r.status !== 'CANCELADO_USUARIO' && r.status !== 'NEGADO' && r.status !== 'CANCELADO_PREFEITURA');
    
    if (dayRequests.length === 0) return 'GREEN';
    // Simplified rule: if more than total vehicles * 2 requests (mocking capacity), then RED
    if (dayRequests.length >= vehicles.length * 2) return 'RED';
    return 'YELLOW';
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-slate-700 capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <div className="flex border border-gray-200 rounded overflow-hidden bg-white">
            <button className="p-1 px-3 hover:bg-gray-100 border-r border-gray-200 text-slate-600" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 px-3 hover:bg-gray-100 text-slate-600" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <span className="text-slate-400 text-sm font-medium">UTC-3 Horário de Brasília</span>
      </div>
      
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden flex-1">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-xs font-bold text-slate-500 uppercase">
            {day}
          </div>
        ))}
        {days.map(day => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const status = getDayStatus(day);
          
          let cellStyle = "bg-white border-t-4 border-transparent text-slate-800";
          let indicatorColor = "";
          
          if (isCurrentMonth) {
            if (status === 'GREEN') {
              cellStyle = "bg-emerald-50 border-t-4 border-emerald-500";
              indicatorColor = "bg-emerald-500";
            } else if (status === 'YELLOW') {
              cellStyle = "bg-amber-50 border-t-4 border-amber-500";
              indicatorColor = "bg-amber-500";
            } else if (status === 'RED') {
              cellStyle = "bg-rose-50 border-t-4 border-rose-500";
              indicatorColor = "bg-rose-500";
            }
          }
          
          return (
            <div
              key={day.toString()}
              onClick={() => onDayClick(day)}
              className={cn(
                "p-2 min-h-[90px] relative transition-colors cursor-pointer hover:opacity-80 flex flex-col",
                cellStyle,
                !isCurrentMonth && "opacity-40"
              )}
            >
              <span className={cn("text-sm font-bold", isToday ? "text-blue-600" : "")}>
                {format(day, 'd')}
              </span>
              
              {isCurrentMonth && indicatorColor && (
                <div className={cn("absolute bottom-2 right-2 w-2 h-2 rounded-full", indicatorColor)} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
