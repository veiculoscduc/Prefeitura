'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MotoristaAbastecimentoPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Abastecimento registrado com sucesso!');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Registrar Abastecimento</h1>
        <p className="text-slate-500 mt-1">Preencha os dados e anexe a nota fiscal / comprovante.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="space-y-1">
          <Label>Valor Total (R$)</Label>
          <Input type="number" step="0.01" required />
        </div>
        <div className="space-y-1">
          <Label>Litros (L)</Label>
          <Input type="number" step="0.01" required />
        </div>
        <div className="space-y-1">
          <Label>Anexo (Comprovante/NF)</Label>
          <Input type="file" required accept="image/*,.pdf" className="py-1 cursor-pointer" />
        </div>
        <div className="pt-4">
          <Button type="submit" className="w-full">Registrar</Button>
        </div>
      </form>
    </div>
  );
}
