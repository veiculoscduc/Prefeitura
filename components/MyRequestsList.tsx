'use client';

import React, { useState } from 'react';
import { ScheduleRequest, User } from '@/lib/types';
import { cancelRequest, confirmReturn, updateRequestTime } from '@/lib/actions';
import { Edit2, X, Calendar, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function MyRequestsList({ requests, users }: { requests: ScheduleRequest[], users: User[] }) {
  const [editingRequest, setEditingRequest] = useState<ScheduleRequest | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editHoraSaida, setEditHoraSaida] = useState('');
  const [editHoraRetorno, setEditHoraRetorno] = useState('');
  const [editHorarioNoLocal, setEditHorarioNoLocal] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (requests.length === 0) {
    return <div className="text-slate-500">Você ainda não possui solicitações.</div>;
  }

  const handleOpenEdit = (req: ScheduleRequest) => {
    setEditingRequest(req);
    setEditDate(req.dataSaida);
    setEditHoraSaida(req.horaSaida);
    setEditHoraRetorno(req.horaRetorno);
    setEditHorarioNoLocal(req.horarioNoLocal || '');
    setErrorMessage('');
  };

  const handleCloseEdit = () => {
    setEditingRequest(null);
    setErrorMessage('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;

    if (editingRequest.vaiSairCampus && !editHorarioNoLocal) {
      setErrorMessage('Por favor, informe o Horário no Local/Evento.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await updateRequestTime(
        editingRequest.id,
        editDate,
        editHoraSaida,
        editHoraRetorno,
        editingRequest.vaiSairCampus ? editHorarioNoLocal : undefined
      );

      if (result && 'error' in result) {
        setErrorMessage(result.error);
      } else {
        // Success
        setEditingRequest(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Houve um erro ao atualizar os horários.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

        const canEdit = req.status === 'SOLICITADO' || req.status === 'NEGADO';

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

            {canEdit && (
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-3">
                <button 
                  id={`btn-edit-request-${req.id}`}
                  onClick={() => handleOpenEdit(req)}
                  className="flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold px-4 py-2 rounded hover:bg-blue-100/70 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  EDITAR HORÁRIO
                </button>
                {(req.status === 'SOLICITADO' || req.status === 'CONFIRMADO') && (
                  <button 
                    onClick={() => {
                      if (confirm("Deseja realmente cancelar esta solicitação?")) {
                        cancelRequest(req.id);
                      }
                    }}
                    className="bg-white border border-rose-200 text-rose-600 text-xs font-bold px-4 py-2 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    CANCELAR SOLICITAÇÃO
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Edit Request Modal */}
      <AnimatePresence>
        {editingRequest && (
          <div id="edit-request-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseEdit}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.15 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 z-10"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800 text-base">Editar Horários</h3>
                </div>
                <button
                  onClick={handleCloseEdit}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
                <div className="bg-amber-50 text-amber-800 border border-amber-250 p-3 rounded-lg text-xs leading-relaxed">
                  <p className="font-semibold mb-1">Avisos importantes:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Ao salvar as alterações, a solicitação **retornará para aprovação** do administrador.</li>
                    <li>Qualquer alocação de motorista feita anteriormente será limpa para nova avaliação.</li>
                    <li>Sua solicitação será validada contra outros bloqueios e reservas em tempo real.</li>
                  </ul>
                </div>

                {errorMessage && (
                  <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-xs text-rose-600 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">
                      Data da Saída
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        required
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600">
                        Hora da Saída
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="time"
                          required
                          value={editHoraSaida}
                          onChange={(e) => setEditHoraSaida(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600">
                        Hora do Retorno
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="time"
                          required
                          value={editHoraRetorno}
                          onChange={(e) => setEditHoraRetorno(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {editingRequest.vaiSairCampus && (
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600">
                        Horário no Local / Evento (Obrigatório fora do campus)
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="time"
                          required
                          value={editHorarioNoLocal}
                          onChange={(e) => setEditHorarioNoLocal(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    disabled={isSubmitting}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-sm font-semibold py-2.5 rounded transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold py-2.5 rounded transition-colors flex items-center justify-center cursor-pointer"
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
