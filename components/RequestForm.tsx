'use client';

import React from 'react';
import { Vehicle } from '@/lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { createRequest } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

export function RequestForm({ date, vehicles }: { date: string, vehicles: Vehicle[] }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [doisVeiculos, setDoisVeiculos] = React.useState(false);
  const [vaiAcompanhar, setVaiAcompanhar] = React.useState(true);
  const [vaiSairCampus, setVaiSairCampus] = React.useState(true);
  const [quantidadePassageiros, setQuantidadePassageiros] = React.useState(1);
  const [horarioNoLocal, setHorarioNoLocal] = React.useState('');

  // Form State
  const [horaSaida, setHoraSaida] = React.useState('');
  const [horaRetorno, setHoraRetorno] = React.useState('');
  const [veiculo1, setVeiculo1] = React.useState('');
  const [veiculo2, setVeiculo2] = React.useState('');
  const [nomePassageiro, setNomePassageiro] = React.useState('');
  const [enderecoSaida, setEnderecoSaida] = React.useState('');
  const [enderecoDestino, setEnderecoDestino] = React.useState('');
  const [observacoes, setObservacoes] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!horaSaida || !horaRetorno || !veiculo1 || !enderecoDestino) {
      alert("Preencha os campos obrigatórios.");
      return;
    }
    if (vaiSairCampus && !horarioNoLocal) {
      alert("Por favor, preencha o horário no local.");
      return;
    }
    if (doisVeiculos && !veiculo2) {
      alert("Selecione o segundo veículo.");
      return;
    }

    setLoading(true);
    try {
      const veiculosIds = [veiculo1];
      if (doisVeiculos && veiculo2) veiculosIds.push(veiculo2);

      const response = await createRequest({
        dataSaida: date,
        horaSaida,
        horaRetorno,
        veiculosIds,
        vaiAcompanhar,
        nomePassageiro: !vaiAcompanhar ? nomePassageiro : undefined,
        vaiSairCampus,
        enderecoSaida: !vaiSairCampus ? enderecoSaida : undefined,
        enderecoDestino,
        quantidadePassageiros,
        horarioNoLocal: vaiSairCampus ? horarioNoLocal : undefined,
        observacoes,
      });

      if (response && 'error' in response) {
        console.error(response.error);
        setErrorMessage(response.error || 'Ocorreu um erro desconhecido.');
        setLoading(false);
        return;
      }

      router.push('/solicitacoes');
    } catch (err: any) {
      alert(err.message || 'Erro ao criar solicitação');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Menu Flutuante - Quantidade de Passageiros */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-150 rounded-xl p-4 shadow-sm relative overflow-visible mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide block mb-0.5">Quantidade de Passageiros</span>
            <span className="text-[11px] text-slate-500 block">Capacidade total necessária</span>
          </div>
          <div className="relative overflow-visible">
            <select
              value={quantidadePassageiros}
              onChange={e => setQuantidadePassageiros(Number(e.target.value))}
              className="appearance-none font-bold text-sm bg-white border border-indigo-200 text-indigo-900 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm cursor-pointer min-w-[100px] text-center"
            >
              {Array.from({ length: 19 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'passageiro' : 'passageiros'}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-indigo-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Horário de Saída</Label>
          <Input type="time" value={horaSaida} onChange={e => setHoraSaida(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>Horário Previsto de Retorno</Label>
          <Input type="time" value={horaRetorno} onChange={e => setHoraRetorno(e.target.value)} required />
        </div>
      </div>

      <div className="space-y-1 pt-2">
        <div className="flex items-center justify-between">
          <Label>Veículo 1</Label>
          <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer">
            <Checkbox checked={doisVeiculos} onCheckedChange={(c) => {
              setDoisVeiculos(c);
              if (!c) setVeiculo2('');
            }} />
            Dois Veículos
          </label>
        </div>
        <Select value={veiculo1} onChange={e => setVeiculo1(e.target.value)} required>
          <option value="" disabled>Selecionar veículo...</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.name} (Capacidade: {v.quantidadePassageiros || 4})</option>
          ))}
        </Select>
      </div>

      {doisVeiculos && (
        <div className="space-y-1">
          <Label>Veículo 2</Label>
          <Select value={veiculo2} onChange={e => setVeiculo2(e.target.value)} required>
             <option value="" disabled>Selecionar segundo veículo...</option>
             {vehicles.map((v) => (
                <option key={v.id} value={v.id} disabled={v.id === veiculo1}>{v.name} (Capacidade: {v.quantidadePassageiros || 4})</option>
             ))}
          </Select>
        </div>
      )}

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
             <Checkbox checked={vaiAcompanhar} onCheckedChange={setVaiAcompanhar} />
             O solicitante vai acompanhar?
          </label>
          {!vaiAcompanhar && (
            <Input 
              placeholder="Nome do responsável/passageiro" 
              value={nomePassageiro} 
              onChange={e => setNomePassageiro(e.target.value)} 
              required
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
             <Checkbox checked={vaiSairCampus} onCheckedChange={(checked) => {
               setVaiSairCampus(!!checked);
               if (!checked) setHorarioNoLocal('');
             }} />
             Vai sair do campus?
          </label>
          {!vaiSairCampus && (
            <Input 
              placeholder="Endereço de saída (Local no Campus)" 
              value={enderecoSaida} 
              onChange={e => setEnderecoSaida(e.target.value)} 
              required
            />
          )}
          {vaiSairCampus && (
            <div className="space-y-1">
              <Label htmlFor="horarioNoLocal">Horário no Local / Evento (Obrigatório)</Label>
              <Input 
                id="horarioNoLocal"
                type="time"
                value={horarioNoLocal} 
                onChange={e => setHorarioNoLocal(e.target.value)} 
                required
              />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label>Endereço de Destino (Obrigatório)</Label>
          <Input 
            placeholder="Digite o destino completo" 
            value={enderecoDestino} 
            onChange={e => setEnderecoDestino(e.target.value)} 
            required
          />
        </div>

        <div className="space-y-1">
          <Label>Observações (Opcional)</Label>
          <Input 
            placeholder="Alguma observação importante para esta solicitação?" 
            value={observacoes} 
            onChange={e => setObservacoes(e.target.value)} 
          />
        </div>
      </div>

      <div className="pt-2">
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" type="submit" disabled={loading}>
          {loading ? 'Processando...' : 'Solicitar Agendamento'}
        </Button>
      </div>

      <AnimatePresence>
        {errorMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-w-md w-full relative"
              role="alert"
            >
              <div className="p-6">
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-50"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl shrink-0 animate-pulse">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="space-y-2 pt-0.5">
                    <h3 className="text-base font-bold text-slate-800 leading-tight">
                      Não foi possível registrar a solicitação
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <Button 
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 text-sm rounded-lg"
                >
                  Entendido
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </form>
  );
}
