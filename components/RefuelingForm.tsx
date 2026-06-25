'use client';

import React, { useState, useEffect } from 'react';
import { Vehicle } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Fuel, FileText, ChevronLeft, Calendar, Info, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface RefuelingRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  valorTotal: number;
  litros: number;
  kmInicial: number;
  kmFinal: number;
  attachmentName?: string;
  date: string;
}

export function RefuelingForm({ vehicles }: { vehicles: Vehicle[] }) {
  const [vehicleId, setVehicleId] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [litros, setLitros] = useState('');
  const [kmInicial, setKmInicial] = useState('');
  const [kmFinal, setKmFinal] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [records, setRecords] = useState<RefuelingRecord[]>([]);

  // Load records from localStorage safely
  useEffect(() => {
    const stored = localStorage.getItem('refueling_records');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTimeout(() => {
          setRecords(parsed);
        }, 0);
      } catch (e) {
        console.error('Error loading refueling records', e);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!vehicleId) {
      setErrorMsg('Selecione o veículo correspondente.');
      return;
    }

    const valorVal = parseFloat(valorTotal);
    const litrosVal = parseFloat(litros);
    const kmInitVal = parseFloat(kmInicial);
    const kmFinalVal = parseFloat(kmFinal);

    if (isNaN(valorVal) || valorVal <= 0) {
      setErrorMsg('Por favor, informe um valor total (R$) válido.');
      return;
    }

    if (isNaN(litrosVal) || litrosVal <= 0) {
      setErrorMsg('Por favor, informe a quantidade de litros abastecida.');
      return;
    }

    if (isNaN(kmInitVal) || kmInitVal < 0) {
      setErrorMsg('Por favor, informe uma quilometragem inicial válida.');
      return;
    }

    if (isNaN(kmFinalVal) || kmFinalVal < 0) {
      setErrorMsg('Por favor, informe uma quilometragem final válida.');
      return;
    }

    if (kmFinalVal < kmInitVal) {
      setErrorMsg('A quilometragem final não pode ser menor que a quilometragem inicial.');
      return;
    }

    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    if (!selectedVehicle) {
      setErrorMsg('Veículo não encontrado.');
      return;
    }

    const newRecord: RefuelingRecord = {
      id: Math.random().toString(36).substring(2, 9),
      vehicleId,
      vehicleName: selectedVehicle.name,
      vehiclePlate: selectedVehicle.plate,
      valorTotal: valorVal,
      litros: litrosVal,
      kmInicial: kmInitVal,
      kmFinal: kmFinalVal,
      attachmentName: attachment ? attachment.name : undefined,
      date: new Date().toISOString(),
    };

    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('refueling_records', JSON.stringify(updatedRecords));

    // Reset inputs
    setValorTotal('');
    setLitros('');
    setKmInicial('');
    setKmFinal('');
    setAttachment(null);
    const fileInput = document.getElementById('fileAttachment') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    setSuccessMsg('Abastecimento registrado com sucesso!');

    setTimeout(() => {
      setSuccessMsg('');
    }, 5000);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('Deseja realmente obter e excluir este registro de abastecimento?')) {
      const updated = records.filter(r => r.id !== id);
      setRecords(updated);
      localStorage.setItem('refueling_records', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/motorista/corridas" className="text-slate-500 hover:text-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6 border rounded bg-white hover:bg-slate-50 shadow-xs" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Registrar Abastecimento</h1>
          <p className="text-slate-500 mt-1">Preencha as informações de abastecimento, hodômetro e insira o comprovante fiscal.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-800 text-sm rounded-md border border-rose-200 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-sm rounded-md border border-emerald-200 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="vehicleSelect">Veículo Abastecido</Label>
            <select
              id="vehicleSelect"
              required
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="">Selecione o veículo...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="valor">Valor Total (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                placeholder="Ex: 150.00"
                value={valorTotal}
                onChange={(e) => setValorTotal(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="litros">Litros (L)</Label>
              <Input
                id="litros"
                type="number"
                step="0.01"
                placeholder="Ex: 25.5"
                value={litros}
                onChange={(e) => setLitros(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="kmInit">Quilometragem Inicial (KM)</Label>
              <Input
                id="kmInit"
                type="number"
                placeholder="Ex: 50100"
                value={kmInicial}
                onChange={(e) => setKmInicial(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="kmEnd">Quilometragem Final (KM)</Label>
              <Input
                id="kmEnd"
                type="number"
                placeholder="Ex: 50500"
                value={kmFinal}
                onChange={(e) => setKmFinal(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="fileAttachment">Nota Fiscal / Cupom Fiscal (Anexo)</Label>
            <Input
              id="fileAttachment"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  setAttachment(files[0]);
                } else {
                  setAttachment(null);
                }
              }}
              className="py-1 cursor-pointer bg-white"
            />
            <p className="text-[10px] text-slate-500 mt-1">Formatos aceitos: Imagens (PNG, JPG) ou PDF.</p>
          </div>

          <div className="pt-2 flex items-center justify-between gap-4">
            <Link href="/motorista/corridas" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
              Voltar para Corridas
            </Link>
            <Button type="submit" className="px-6 bg-slate-900 hover:bg-slate-800 text-white font-medium">
              Registrar Abastecimento
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <Fuel className="w-5 h-5 text-slate-600" />
              Instruções de Abastecimento
            </h2>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
              <li>Selecione o veículo correto associado à sua corrida atual.</li>
              <li>Preencha a quilometragem inicial e final com os mesmos dados informados na corrida.</li>
              <li>Anexar a nota fiscal ajuda o setor administrativo a validar o reembolso ou faturamento de combustível.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-700" />
          Histórico de Abastecimentos Registrados
        </h2>

        {records.length === 0 ? (
          <div className="bg-white border rounded-xl p-6 text-center text-slate-500 text-sm">
            Nenhum registro de abastecimento encontrado no seu histórico local.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records.map((rec) => (
              <div key={rec.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs relative hover:border-slate-300 transition-colors">
                <button
                  onClick={() => handleDeleteRecord(rec.id)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Excluir Registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(rec.date).toLocaleString('pt-BR')}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{rec.vehicleName}</h3>
                    <p className="text-xs text-slate-500 font-mono">Placa: {rec.vehiclePlate}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-2 rounded-md border border-slate-100 text-[11px] font-semibold text-slate-700">
                    <div className="col-span-1">
                      <span className="block text-[9px] text-slate-550 font-normal">Valor:</span>
                      <span className="text-emerald-700">R$ {rec.valorTotal.toFixed(2)}</span>
                    </div>
                    <div className="col-span-1">
                      <span className="block text-[9px] text-slate-550 font-normal">Litros:</span>
                      <span>{rec.litros} L</span>
                    </div>
                    <div className="col-span-1">
                      <span className="block text-[9px] text-slate-550 font-normal">KM Inicial:</span>
                      <span>{rec.kmInicial} km</span>
                    </div>
                    <div className="col-span-1">
                      <span className="block text-[9px] text-slate-550 font-normal">KM Final:</span>
                      <span>{rec.kmFinal} km</span>
                    </div>
                  </div>
                  {rec.attachmentName && (
                    <div className="text-[10px] text-slate-600 flex items-center gap-1 mt-1 font-medium bg-slate-100/60 p-1 rounded inline-flex">
                      <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate max-w-[170px]">{rec.attachmentName}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
