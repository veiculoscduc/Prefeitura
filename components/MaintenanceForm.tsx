'use client';

import React, { useState, useEffect } from 'react';
import { Vehicle } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, FileText, ChevronLeft, Calendar, Info, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  kmInicial: number;
  kmFinal: number;
  observation: string;
  date: string;
}

export function MaintenanceForm({ vehicles }: { vehicles: Vehicle[] }) {
  const [vehicleId, setVehicleId] = useState('');
  const [kmInicial, setKmInicial] = useState('');
  const [kmFinal, setKmFinal] = useState('');
  const [observation, setObservation] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);

  // Load registered records from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('maintenance_records');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTimeout(() => {
          setRecords(parsed);
        }, 0);
      } catch (e) {
        console.error('Error loading maintenance records', e);
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

    const kmInitVal = parseFloat(kmInicial);
    const kmFinalVal = parseFloat(kmFinal);

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

    if (!observation.trim()) {
      setErrorMsg('Por favor, digite uma observação ou sumário da manutenção realizada.');
      return;
    }

    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    if (!selectedVehicle) {
      setErrorMsg('Veículo não encontrado.');
      return;
    }

    const newRecord: MaintenanceRecord = {
      id: Math.random().toString(36).substring(2, 9),
      vehicleId,
      vehicleName: selectedVehicle.name,
      vehiclePlate: selectedVehicle.plate,
      kmInicial: kmInitVal,
      kmFinal: kmFinalVal,
      observation: observation.trim(),
      date: new Date().toISOString(),
    };

    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('maintenance_records', JSON.stringify(updatedRecords));

    // Clear form inputs
    setKmInicial('');
    setKmFinal('');
    setObservation('');
    setSuccessMsg('Manutenção registrada com sucesso!');
    
    // Auto clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMsg('');
    }, 5000);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('Deseja realmente excluir este registro de manutenção?')) {
      const updated = records.filter(r => r.id !== id);
      setRecords(updated);
      localStorage.setItem('maintenance_records', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/motorista/corridas" className="text-slate-500 hover:text-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6 border rounded bg-white hover:bg-slate-50 shadow-xs" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Registrar Manutenção</h1>
          <p className="text-slate-500 mt-1">Preencha as informações da manutenção preventiva/corretiva realizada.</p>
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
            <Label htmlFor="vehicleSelect">Veículo da Frota</Label>
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
                placeholder="Ex: 50150"
                value={kmFinal}
                onChange={(e) => setKmFinal(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="obsText">Observações da Manutenção</Label>
            <textarea
              id="obsText"
              rows={4}
              placeholder="Descreva o que foi feito (Ex: Troca de óleo, alinhamento, reparo nas lâmpadas, etc.)"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-4">
            <Link href="/motorista/corridas" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
              Voltar para Corridas
            </Link>
            <Button type="submit" className="px-6 bg-slate-900 hover:bg-slate-800 text-white font-medium">
              Salvar Registro
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <Wrench className="w-5 h-5 text-slate-600" />
              Diretrizes de Manutenção
            </h2>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
              <li>Sempre informe a quilometragem conforme o hodômetro físico do veículo.</li>
              <li>A quilometragem final deve registrar o estado exato ao término da manutenção ou serviço.</li>
              <li>Anote detalhes importantes como óleo utilizado, peças substituídas ou problemas reportados.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-700" />
          Histórico de Manutenções Registradas
        </h2>

        {records.length === 0 ? (
          <div className="bg-white border rounded-xl p-6 text-center text-slate-500 text-sm">
            Nenhum registro de manutenção encontrado no seu histórico local.
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
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-md border border-slate-100 text-xs font-semibold text-slate-700">
                    <div>
                      <span className="block text-[10px] text-slate-550 font-normal">KM Inicial:</span>
                      <span>{rec.kmInicial} km</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-550 font-normal">KM Final:</span>
                      <span>{rec.kmFinal} km</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 border-l-2 border-slate-300 pl-2 italic mt-1 bg-slate-50/50 py-1.5 rounded-r">
                    {rec.observation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
