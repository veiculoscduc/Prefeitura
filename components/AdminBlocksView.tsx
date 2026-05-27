'use client';

import React, { useState } from 'react';
import { AgendaBlock, Vehicle } from '@/lib/types';
import { createBlock, deleteBlock } from '@/lib/actions';
import { format, parseISO } from 'date-fns';

export function AdminBlocksView({ blocks, vehicles }: { blocks: AgendaBlock[], vehicles: Vehicle[] }) {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataInicio || !dataFim || !justificativa) {
      alert("Preencha as datas e a justificativa.");
      return;
    }

    setLoading(true);
    const res = await createBlock({
      dataInicio,
      dataFim,
      horaInicio: horaInicio || undefined,
      horaFim: horaFim || undefined,
      justificativa
    });

    if (res?.error) {
      alert(res.error);
    } else {
      setDataInicio('');
      setDataFim('');
      setHoraInicio('');
      setHoraFim('');
      setJustificativa('');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este bloqueio?")) {
      const res = await deleteBlock(id);
      if (res?.error) alert(res.error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm w-full lg:w-96 shrink-0 h-fit">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Novo Bloqueio</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Data Início</label>
              <input
                type="date"
                required
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Data Fim</label>
              <input
                type="date"
                required
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
                className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Hora Início (Opcional)</label>
              <input
                type="time"
                value={horaInicio}
                onChange={e => setHoraInicio(e.target.value)}
                className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Hora Fim (Opcional)</label>
              <input
                type="time"
                value={horaFim}
                onChange={e => setHoraFim(e.target.value)}
                className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Justificativa</label>
            <textarea
              required
              rows={3}
              value={justificativa}
              onChange={e => setJustificativa(e.target.value)}
              className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Manutenção preventiva"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors"
          >
            {loading ? 'Salvando...' : 'Adicionar Bloqueio'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Período / Horário</th>
              <th className="px-6 py-3">Bloqueio</th>
              <th className="px-6 py-3">Justificativa</th>
              <th className="px-6 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {blocks.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  Nenhum bloqueio registrado.
                </td>
              </tr>
            ) : (
              blocks.map(b => {
                let periodoStr = `${format(parseISO(b.dataInicio), 'dd/MM/yyyy')} a ${format(parseISO(b.dataFim), 'dd/MM/yyyy')}`;
                if (b.horaInicio || b.horaFim) {
                  periodoStr += ` (${b.horaInicio || '00:00'} às ${b.horaFim || '23:59'})`;
                }

                const isHourBlock = !(!b.horaInicio && !b.horaFim);

                return (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-800">{periodoStr}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className={isHourBlock ? "bg-amber-100 text-amber-700 px-2 py-1 flex w-fit rounded text-xs font-bold uppercase" : "bg-rose-100 text-rose-700 px-2 py-1 flex w-fit rounded text-xs font-bold uppercase"}>
                         {isHourBlock ? 'Por Horário' : 'Dia / Período'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-xs" title={b.justificativa}>{b.justificativa}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="text-rose-600 hover:text-rose-800 text-xs font-bold uppercase"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
