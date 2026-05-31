'use client';

import React, { useState } from 'react';
import { User, UserRole, SolicitanteType } from '@/lib/types';
import { updateUser, approveUser, rejectUser, deleteUser, resetUserPassword } from '@/lib/actions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';

export function AdminUserList({ users }: { users: User[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<User>>({});
  
  // State for pending user role/type assignments during approval
  const [pendingAssignments, setPendingAssignments] = useState<Record<string, { role: UserRole, tipo: SolicitanteType }>>({});

  const pendingUsers = users.filter(u => u.status === 'PENDENTE');
  const activeUsers = users.filter(u => u.status !== 'PENDENTE');

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setEditData({ ...user });
  };

  const handleSave = async (id: string) => {
    const response = await updateUser(id, editData);
    if (response && 'error' in response) {
      console.error(response.error);
    } else {
      setEditingId(null);
      setEditData({});
    }
  };

  const handleUpdateAssignment = (userId: string, role: UserRole, tipo: SolicitanteType) => {
    setPendingAssignments(prev => ({
      ...prev,
      [userId]: { role, tipo }
    }));
  };

  const handleApprove = async (id: string) => {
    const assignment = pendingAssignments[id] || { role: 'SOLICITANTE', tipo: 'Docente' };
    const response = await approveUser(id, assignment.role, assignment.tipo);
    if (response && 'error' in response) {
      console.error(response.error);
    }
  };

  const handleReject = async (id: string) => {
    const response = await rejectUser(id);
    if (response && 'error' in response) {
      console.error(response.error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Pending Registrations Panel */}
      {pendingUsers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <h2 className="text-base font-bold text-amber-900">
              Solicitações de Cadastro Pendentes ({pendingUsers.length})
            </h2>
          </div>
          <p className="text-xs text-amber-750 mb-4">
            Novos solicitantes cadastrados aguardando atribuição de perfil e aprovação regulamentar para acesso ao sistema.
          </p>
          <div className="bg-white rounded-lg border border-amber-150 overflow-hidden shadow-xs overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-amber-900 uppercase bg-amber-100/50 border-b border-amber-150">
                <tr>
                  <th className="px-5 py-3">Nome Completo</th>
                  <th className="px-5 py-3">E-mail</th>
                  <th className="px-5 py-3">Matrícula</th>
                  <th className="px-5 py-3">Filiado como</th>
                  <th className="px-5 py-3">Definir Perfil</th>
                  <th className="px-5 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingUsers.map(u => {
                  const assignment = pendingAssignments[u.id] || { role: 'SOLICITANTE', tipo: u.tipo || 'Docente' };
                  return (
                    <tr key={u.id} className="hover:bg-amber-50/20 origin-left transition-all">
                      <td className="px-5 py-3.5 font-semibold text-slate-800">{u.name}</td>
                      <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-500 text-xs">{u.matricula || '-'}</td>
                      <td className="px-5 py-3.5">
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          {u.tipo || 'Docente'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <Select
                            value={assignment.role}
                            onChange={e => handleUpdateAssignment(u.id, e.target.value as UserRole, assignment.tipo)}
                            className="h-8 text-xs bg-white border border-rose-300 rounded font-medium select-none cursor-pointer"
                          >
                            <option value="SOLICITANTE">SOLICITANTE</option>
                            <option value="ADMIN">ADMINISTRADOR</option>
                            <option value="MOTORISTA">MOTORISTA</option>
                          </Select>
                          
                          {assignment.role === 'SOLICITANTE' && (
                            <Select
                              value={assignment.tipo}
                              onChange={e => handleUpdateAssignment(u.id, assignment.role, e.target.value as SolicitanteType)}
                              className="h-8 text-xs bg-white border border-rose-300 rounded font-medium select-none cursor-pointer"
                            >
                              <option value="Docente">Docente</option>
                              <option value="Técnico">Técnico</option>
                            </Select>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-2 text-xs">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                            onClick={() => handleReject(u.id)}
                          >
                            Recusar
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            onClick={() => handleApprove(u.id)}
                          >
                            Aprovar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Directory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-850">Diretório de Usuários Ativos</h2>
          <p className="text-xs text-slate-550 mt-0.5">Gestão de solicitantes, administradores e motoristas aprovados no sistema.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Nome</th>
              <th className="px-6 py-3">E-mail</th>
              <th className="px-6 py-3">Perfil</th>
              <th className="px-6 py-3">Tipo Solicitante</th>
              <th className="px-6 py-3">Matrícula</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeUsers.map(u => {
              const isEditing = editingId === u.id;
              return (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {isEditing ? <Input value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} className="h-7 text-sm px-2" /> : u.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {isEditing ? <Input value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} className="h-7 text-sm px-2" /> : u.email}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <Select value={editData.role || ''} onChange={e => setEditData({...editData, role: e.target.value as UserRole})} className="h-7 text-sm px-2">
                         <option value="SOLICITANTE">SOLICITANTE</option>
                         <option value="ADMIN">ADMIN</option>
                         <option value="MOTORISTA">MOTORISTA</option>
                      </Select>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'MOTORISTA' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {isEditing && (editData.role === 'SOLICITANTE' || u.role === 'SOLICITANTE') ? (
                      <Select value={editData.tipo || ''} onChange={e => setEditData({...editData, tipo: e.target.value as SolicitanteType})} className="h-7 text-sm px-2">
                         <option value="">Nenhum</option>
                         <option value="Docente">Docente</option>
                         <option value="Técnico">Técnico</option>
                      </Select>
                    ) : u.tipo || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {isEditing ? <Input value={editData.matricula || ''} onChange={e => setEditData({...editData, matricula: e.target.value})} className="h-7 text-sm px-2" /> : (u.matricula || '-')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => setEditingId(null)}>Cancelar</Button>
                        <Button size="sm" className="h-7 px-2" onClick={() => handleSave(u.id)}>Salvar</Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2 text-xs">
                        <Button variant="outline" size="sm" className="h-7 px-2 text-slate-600 hover:text-slate-800" onClick={() => handleEdit(u)}>
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 px-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                          onClick={async () => {
                            if (window.confirm('Deseja resetar a senha deste usuário para "123"?')) {
                              await resetUserPassword(u.id);
                            }
                          }}
                        >
                          Resetar Senha
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 px-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                          onClick={async () => {
                            if (window.confirm('Tem certeza que deseja excluir este usuário definitivamente?')) {
                              await deleteUser(u.id);
                            }
                          }}
                        >
                          Excluir
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
