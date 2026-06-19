'use client';

import React, { useState, useEffect } from 'react';
import { Fuel, Wrench, Search, Calendar, ChevronLeft, FileText, Trash2 } from 'lucide-react';
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

export default function AdminRegistrosPage() {
  const [activeTab, setActiveTab] = useState<'refueling' | 'maintenance'>('refueling');
  const [refuelings, setRefuelings] = useState<RefuelingRecord[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load refueling records
    const storedRefuel = localStorage.getItem('refueling_records');
    if (storedRefuel) {
      try {
        const parsedRefuel = JSON.parse(storedRefuel);
        setTimeout(() => {
          setRefuelings(parsedRefuel);
        }, 0);
      } catch (e) {
        console.error('Error parsing refueling_records', e);
      }
    }

    // Load maintenance records
    const storedMaint = localStorage.getItem('maintenance_records');
    if (storedMaint) {
      try {
        const parsedMaint = JSON.parse(storedMaint);
        setTimeout(() => {
          setMaintenances(parsedMaint);
        }, 0);
      } catch (e) {
        console.error('Error parsing maintenance_records', e);
      }
    }
  }, []);

  const handleDeleteRefuel = (id: string) => {
    if (confirm('Deseja realmente excluir este registro de abastecimento?')) {
      const updated = refuelings.filter(r => r.id !== id);
      setRefuelings(updated);
      localStorage.setItem('refueling_records', JSON.stringify(updated));
    }
  };

  const handleDeleteMaint = (id: string) => {
    if (confirm('Deseja realmente excluir este registro de manutenção?')) {
      const updated = maintenances.filter(m => m.id !== id);
      setMaintenances(updated);
      localStorage.setItem('maintenance_records', JSON.stringify(updated));
    }
  };

  const filteredRefuelings = refuelings.filter(r => 
    r.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMaintenances = maintenances.filter(m => 
    m.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals for refuelings
  const totalSpent = filteredRefuelings.reduce((sum, r) => sum + r.valorTotal, 0);
  const totalLiters = filteredRefuelings.reduce((sum, r) => sum + r.litros, 0);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      <header className="h-16 border-b border-gray-200 flex items-center justify-between px-8 shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-500 hover:text-slate-800 md:hidden">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Registros de Abastecimentos & Manutenções</h1>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
        {/* Navigation Tabs and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex bg-slate-100 p-1 rounded-lg gap-1 max-w-max">
            <button
              onClick={() => setActiveTab('refueling')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'refueling'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Fuel className="w-4 h-4 text-slate-600" />
              Abastecimentos
              {refuelings.length > 0 && (
                <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {refuelings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'maintenance'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Wrench className="w-4 h-4 text-slate-600" />
              Manutenções
              {maintenances.length > 0 && (
                <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {maintenances.length}
                </span>
              )}
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por veículo ou placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Dynamic Display */}
        {activeTab === 'refueling' ? (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-2xs">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Gasto Total com Abastecimento</p>
                <p className="text-2xl font-bold text-emerald-600">R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-2xs">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Volume Total Abastecido</p>
                <p className="text-2xl font-bold text-slate-800">{totalLiters.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} Litros</p>
              </div>
              <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-2xs col-span-1 sm:col-span-2 md:col-span-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Preço Médio por Litro</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalLiters > 0 ? `R$ ${(totalSpent / totalLiters).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'}
                </p>
              </div>
            </div>

            {/* List */}
            {filteredRefuelings.length === 0 ? (
              <div className="bg-white border border-slate-250 rounded-xl p-8 text-center text-slate-400">
                Nenhum registro de abastecimento encontrado.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRefuelings.map((rec) => (
                  <div key={rec.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:border-slate-300 transition-colors relative flex flex-col justify-between">
                    <button
                      onClick={() => handleDeleteRefuel(rec.id)}
                      className="absolute top-4 right-4 text-slate-300 hover:text-rose-600 transition-colors p-1"
                      title="Excluir Registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-4">
                      {/* Date & Title */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(rec.date).toLocaleString('pt-BR')}</span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-base">{rec.vehicleName}</h3>
                        <p className="text-xs font-mono bg-slate-100 text-slate-650 px-2 py-0.5 rounded w-max">
                          Placa: {rec.vehiclePlate}
                        </p>
                      </div>

                      {/* Detail Metrics */}
                      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-150 text-xs font-semibold text-slate-700">
                        <div>
                          <span className="block text-[10px] text-slate-400 font-normal">Valor Total:</span>
                          <span className="text-emerald-700 text-sm">R$ {rec.valorTotal.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-normal">Quantidade Litros:</span>
                          <span className="text-sm">{rec.litros} L</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-normal">KM Inicial:</span>
                          <span>{rec.kmInicial} km</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-normal">KM Final:</span>
                          <span>{rec.kmFinal} km</span>
                        </div>
                      </div>

                      {/* Attachment if present */}
                      {rec.attachmentName && (
                        <div className="text-xs text-slate-600 flex items-center gap-1.5 bg-slate-100/70 p-2 border border-slate-200/50 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="truncate flex-1 font-medium">{rec.attachmentName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* List */}
            {filteredMaintenances.length === 0 ? (
              <div className="bg-white border border-slate-250 rounded-xl p-8 text-center text-slate-400">
                Nenhum registro de manutenção encontrado.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaintenances.map((rec) => (
                  <div key={rec.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:border-slate-300 transition-colors relative flex flex-col justify-between">
                    <button
                      onClick={() => handleDeleteMaint(rec.id)}
                      className="absolute top-4 right-4 text-slate-300 hover:text-rose-600 transition-colors p-1"
                      title="Excluir Registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-4">
                      {/* Date & Title */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(rec.date).toLocaleString('pt-BR')}</span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-base">{rec.vehicleName}</h3>
                        <p className="text-xs font-mono bg-slate-100 text-slate-650 px-2 py-0.5 rounded w-max">
                          Placa: {rec.vehiclePlate}
                        </p>
                      </div>

                      {/* Detail Metrics */}
                      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-150 text-xs font-semibold text-slate-705">
                        <div>
                          <span className="block text-[10px] text-slate-400 font-normal font-sans">KM Inicial:</span>
                          <span className="text-sm">{rec.kmInicial} km</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-normal font-sans">KM Final:</span>
                          <span className="text-sm">{rec.kmFinal} km</span>
                        </div>
                      </div>

                      {/* Observation */}
                      <div className="space-y-1 bg-amber-50/50 p-3 border border-amber-100 rounded-lg text-xs text-amber-900 leading-relaxed">
                        <span className="font-bold block text-[10px] text-amber-800 uppercase tracking-wider">Observações / Detalhes:</span>
                        <p>{rec.observation || 'Nenhuma observação informada.'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
