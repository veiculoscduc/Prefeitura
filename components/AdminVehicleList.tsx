'use client';

import React, { useState } from 'react';
import { Vehicle } from '@/lib/types';
import { deleteVehicle, createVehicle } from '@/lib/actions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function AdminVehicleList({ vehicles }: { vehicles: Vehicle[] }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [quantidadePassageiros, setQuantidadePassageiros] = useState<number>(4);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: string, name: string) => {
    const response = await deleteVehicle(id);
    if (response && 'error' in response) {
      console.error(response.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !plate || !quantidadePassageiros) return;
    setLoading(true);
    const res = await createVehicle({
      name,
      plate,
      quantidadePassageiros: Number(quantidadePassageiros),
    });
    setLoading(false);
    if (res && 'error' in res) {
      alert(res.error);
    } else {
      setName('');
      setPlate('');
      setQuantidadePassageiros(4);
      setShowForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {showForm ? 'Fechar Formulário' : 'Novo Veículo'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 max-w-xl">
          <h2 className="text-lg font-bold text-slate-800">Cadastrar Novo Veículo</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="v-name">Nome/Modelo</Label>
              <Input 
                id="v-name" 
                placeholder="Exenplo: Van Renault Master" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="v-plate">Placa</Label>
              <Input 
                id="v-plate" 
                placeholder="Exemplo: ABC-1234" 
                value={plate} 
                onChange={e => setPlate(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="v-qty">Quantidade de Passageiros (Capacidade)</Label>
            <Input 
              id="v-qty" 
              type="number" 
              min={1} 
              max={100} 
              value={quantidadePassageiros} 
              onChange={e => setQuantidadePassageiros(Number(e.target.value))} 
              required 
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading ? 'Salvando...' : 'Salvar Veículo'}
            </Button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Código</th>
              <th className="px-6 py-3">Nome/Modelo</th>
              <th className="px-6 py-3">Placa</th>
              <th className="px-6 py-3">Capacidade</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehicles.map(v => (
              <tr key={v.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-mono text-slate-500">{v.id}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{v.name}</td>
                <td className="px-6 py-4 font-mono">{v.plate}</td>
                <td className="px-6 py-4 font-semibold text-slate-600">{v.quantidadePassageiros || 4} passageiros</td>
                <td className="px-6 py-4">
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold">Ativo</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(v.id, v.name)}>
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
