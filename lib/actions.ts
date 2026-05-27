'use server';

import { ScheduleRequest, RequestStatus, UserRole, User, Vehicle, AgendaBlock } from './types';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { db } from './store';
import {
  svcGetUsers,
  svcGetUserByEmail,
  svcGetUserById,
  svcCreateUser,
  svcUpdateUser,
  svcGetVehicles,
  svcCreateVehicle,
  svcDeleteVehicle,
  svcGetRequests,
  svcCreateRequest,
  svcUpdateRequest,
  svcGetBlocks,
  svcCreateBlock,
  svcDeleteBlock,
} from './supabaseService';

export async function resolveSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (userId) {
    const user = await svcGetUserById(userId);
    if (user && user.status === 'APROVADO') {
      db.currentUser = user;
      return user;
    }
  }
  db.currentUser = null;
  return null;
}

export async function login(email: string, password: string) {
  const cleanEmail = email.toLowerCase().trim();
  const user = await svcGetUserByEmail(cleanEmail);
  if (!user || user.password !== password) {
    return { error: 'E-mail ou senha incorretos.' };
  }
  if (user.status === 'PENDENTE') {
    return { error: 'Seu cadastro está pendente de aprovação por um administrador.' };
  }
  if (user.status === 'REJEITADO') {
    return { error: 'Seu cadastro foi recusado pelo administrador.' };
  }
  
  db.currentUser = user;
  const cookieStore = await cookies();
  cookieStore.set('userId', user.id, { path: '/' });
  revalidatePath('/');
  return { success: true, user };
}

export async function logout() {
  db.currentUser = null;
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  revalidatePath('/');
  return { success: true };
}

export async function registerUser(data: { name: string, email: string, tipo: 'Docente' | 'Técnico', matricula: string, password: string }) {
  const emailLower = data.email.toLowerCase().trim();
  try {
    const exists = await svcGetUserByEmail(emailLower);
    if (exists) {
      return { error: 'Este e-mail já está cadastrado em nosso sistema.' };
    }
    
    const newUser: User = {
      id: 'u_' + uuidv4().substring(0, 8),
      name: data.name,
      email: data.email,
      role: 'SOLICITANTE',
      tipo: data.tipo,
      matricula: data.matricula,
      password: data.password,
      status: 'PENDENTE'
    };
    
    await svcCreateUser(newUser);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function approveUser(userId: string, role: UserRole, tipo?: import('./types').SolicitanteType) {
  const admin = await resolveSession();
  if (admin?.role !== 'ADMIN') return { error: "Acesso negado" };

  try {
    const u = await svcGetUserById(userId);
    if (!u) return { error: "Usuário não encontrado." };

    const updates: Partial<User> = {
      status: 'APROVADO',
      role,
    };
    if (tipo) {
      updates.tipo = tipo;
    }
    
    await svcUpdateUser(userId, updates);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function rejectUser(userId: string) {
  const admin = await resolveSession();
  if (admin?.role !== 'ADMIN') return { error: "Acesso negado" };

  try {
    const u = await svcGetUserById(userId);
    if (!u) return { error: "Usuário não encontrado." };

    await svcUpdateUser(userId, { status: 'REJEITADO' });
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function switchUser(userId: string) {
  const user = await svcGetUserById(userId);
  if (user && user.status === 'APROVADO') {
    db.currentUser = user;
    const cookieStore = await cookies();
    cookieStore.set('userId', userId, { path: '/' });
    revalidatePath('/');
  }
}

export async function getCurrentUser() {
  return await resolveSession();
}

export async function getStoreData() {
  const user = await resolveSession();
  const [requests, vehicles, users, blocks] = await Promise.all([
    svcGetRequests(),
    svcGetVehicles(),
    svcGetUsers(),
    svcGetBlocks(),
  ]);

  return {
    requests,
    vehicles,
    users,
    blocks,
    currentUser: user,
  };
}

// ----------------- SOLICITANTE ACTIONS -----------------

export async function createRequest(data: Omit<ScheduleRequest, 'id' | 'status' | 'motoristasIds' | 'dataSolicitacao' | 'solicitanteId'>) {
  const user = await resolveSession();
  if (!user) return { error: "Não autenticado" };

  const [users, requests, blocks, vehicles] = await Promise.all([
    svcGetUsers(),
    svcGetRequests(),
    svcGetBlocks(),
    svcGetVehicles(),
  ]);

  // Validate drivers available (need assigned drivers count)
  const driverCount = users.filter(u => u.role === 'MOTORISTA').length;
  if (data.veiculosIds.length > driverCount) {
    return { error: `Não há motoristas suficientes cadastrados para ${data.veiculosIds.length} veículos.` };
  }

  // Helper to parse "HH:mm" to minutes since midnight
  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const newStartMin = parseTime(data.horaSaida);
  const newEndMin = parseTime(data.horaRetorno);

  if (newStartMin >= newEndMin) {
    return { error: "O horário de saída deve ser anterior ao horário de retorno." };
  }

  // Validate Vehicle Availability with 1-hour (60 mins) buffer
  const dayRequests = requests.filter(r => r.dataSaida === data.dataSaida && r.status !== 'CANCELADO_USUARIO' && r.status !== 'NEGADO');
  
  for (const block of blocks) {
    if (data.dataSaida >= block.dataInicio && data.dataSaida <= block.dataFim) {
      if (block.veiculoId && !data.veiculosIds.includes(block.veiculoId)) {
        continue;
      }

      let overlaps = false;
      if (!block.horaInicio && !block.horaFim) {
        overlaps = true;
      } else {
        const blockStartMin = block.horaInicio ? parseTime(block.horaInicio) : 0;
        const blockEndMin = block.horaFim ? parseTime(block.horaFim) : 24 * 60;
        overlaps = (newStartMin < blockEndMin) && (newEndMin > blockStartMin);
      }

      if (overlaps) {
        const vname = block.veiculoId ? vehicles.find(v => v.id === block.veiculoId)?.name : 'Todos os veículos';
        return { error: `Bloqueio da agenda detectado (${vname}): ${block.justificativa}` };
      }
    }
  }

  for (const vid of data.veiculosIds) {
    for (const req of dayRequests) {
      if (req.veiculosIds.includes(vid)) {
        const reqStartMin = parseTime(req.horaSaida);
        const reqEndMin = parseTime(req.horaRetorno);
        
        // Ranges: (newStartMin - 60, newEndMin + 60) must not overlap with (reqStartMin, reqEndMin)
        const overlaps = (newStartMin < reqEndMin + 60) && (newEndMin + 60 > reqStartMin);
        
        if (overlaps) {
           const vname = vehicles.find(v => v.id === vid)?.name;
           return { error: `O veículo ${vname} já possui uma viagem entre ${req.horaSaida} e ${req.horaRetorno}, e requer 1 hora de intervalo mínimo.` };
        }
      }
    }
  }

  const newRequest: ScheduleRequest = {
    ...data,
    id: uuidv4(),
    solicitanteId: user.id,
    status: 'SOLICITADO',
    dataSolicitacao: new Date().toISOString(),
    motoristasIds: [],
  };

  try {
    await svcCreateRequest(newRequest);
    revalidatePath('/');
    return { success: true, request: newRequest };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function cancelRequest(requestId: string) {
  const reqs = await svcGetRequests();
  const req = reqs.find(r => r.id === requestId);
  if (req && req.status !== 'CANCELADO_USUARIO') {
    await svcUpdateRequest(requestId, { status: 'CANCELADO_USUARIO' });
    revalidatePath('/');
  }
}

// ----------------- ADMIN ACTIONS -----------------

export async function adminApprove(requestId: string) {
  const user = await resolveSession();
  if (user?.role !== 'ADMIN') return { error: "Acesso negado" };

  const reqs = await svcGetRequests();
  const req = reqs.find(r => r.id === requestId);
  if (req) {
    await svcUpdateRequest(requestId, { status: 'CONFIRMADO' });
    revalidatePath('/');
    return { success: true };
  }
  return { error: "Solicitação não encontrada" };
}

export async function adminReject(requestId: string, justificativa: string) {
  const user = await resolveSession();
  if (user?.role !== 'ADMIN') return { error: "Acesso negado" };

  const reqs = await svcGetRequests();
  const req = reqs.find(r => r.id === requestId);
  if (req) {
    await svcUpdateRequest(requestId, { status: 'NEGADO', justificativaRejeicao: justificativa });
    revalidatePath('/');
    return { success: true };
  }
  return { error: "Solicitação não encontrada" };
}

export async function adminCancel(requestId: string, justificativa?: string) {
  const user = await resolveSession();
  if (user?.role !== 'ADMIN') return { error: "Acesso negado" };

  const reqs = await svcGetRequests();
  const req = reqs.find(r => r.id === requestId);
  if (req) {
    const updates: Partial<ScheduleRequest> = { status: 'CANCELADO_PREFEITURA' };
    if (justificativa) updates.justificativaRejeicao = justificativa;
    
    await svcUpdateRequest(requestId, updates);
    revalidatePath('/');
    return { success: true };
  }
  return { error: "Solicitação não encontrada" };
}

export async function createVehicle(data: Omit<Vehicle, 'id'>) {
  const user = await resolveSession();
  if (user?.role !== 'ADMIN') return { error: "Acesso negado" };
  const newVehicle: Vehicle = {
    ...data,
    id: 'v_' + uuidv4().substring(0, 8),
  };
  try {
    await svcCreateVehicle(newVehicle);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteVehicle(vehicleId: string) {
  const user = await resolveSession();
  if (user?.role !== 'ADMIN') return { error: "Acesso negado" };
  try {
    await svcDeleteVehicle(vehicleId);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateUser(userId: string, data: Partial<User>) {
  const user = await resolveSession();
  if (user?.role !== 'ADMIN') return { error: "Acesso negado" };
  try {
    const u = await svcGetUserById(userId);
    if (u) {
      await svcUpdateUser(userId, data);
      revalidatePath('/');
      return { success: true };
    }
    return { error: "Usuário não encontrado" };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function createBlock(data: Omit<AgendaBlock, 'id'>) {
  const user = await resolveSession();
  if (user?.role !== 'ADMIN') return { error: "Acesso negado" };
  const newBlock: AgendaBlock = {
    ...data,
    id: uuidv4()
  };
  try {
    await svcCreateBlock(newBlock);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteBlock(blockId: string) {
  const user = await resolveSession();
  if (user?.role !== 'ADMIN') return { error: "Acesso negado" };
  try {
    await svcDeleteBlock(blockId);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ----------------- DRIVER ACTIONS -----------------

export async function claimRequest(requestId: string) {
  const user = await resolveSession();
  if (!user) return { error: "Não autenticado" };
  
  const reqs = await svcGetRequests();
  const req = reqs.find(r => r.id === requestId);
  if (req && req.status === 'CONFIRMADO') {
    const motoristas = req.motoristasIds || [];
    if (!motoristas.includes(user.id)) {
      if (motoristas.length < req.veiculosIds.length) {
        const updatedDrivers = [...motoristas, user.id];
        await svcUpdateRequest(requestId, { motoristasIds: updatedDrivers });
        revalidatePath('/');
        return { success: true };
      } else {
        return { error: "Esta viagem já possui todos os motoristas definidos." };
      }
    }
  }
  return { error: "Não foi possível assumir a viagem." };
}

export async function unclaimRequest(requestId: string, driverIdToOption?: string) {
  const user = await resolveSession();
  const reqs = await svcGetRequests();
  const req = reqs.find(r => r.id === requestId);
  if (!req) return { error: "Solicitação não encontrada" };
  if (req.status !== 'CONFIRMADO') return { error: "Status não é confirmado" };
  
  const motoristas = req.motoristasIds || [];
  const targetDriver = driverIdToOption || user?.id;
  if (!targetDriver) return { error: "Motorista não identificado" };
  if (!motoristas.includes(targetDriver)) return { error: "Motorista não está nesta solicitação" };

  const updatedDrivers = motoristas.filter(id => id !== targetDriver);
  await svcUpdateRequest(requestId, { motoristasIds: updatedDrivers });
  revalidatePath('/');
  return { success: true };
}

export async function assignDriver(requestId: string, driverId: string) {
  const user = await resolveSession();
  if (user?.role !== 'ADMIN') return { error: "Acesso negado" };
  const reqs = await svcGetRequests();
  const req = reqs.find(r => r.id === requestId);
  
  if (req && req.status === 'CONFIRMADO') {
    const motoristas = req.motoristasIds || [];
    if (motoristas.length < req.veiculosIds.length) {
      if (!motoristas.includes(driverId)) {
        const updatedDrivers = [...motoristas, driverId];
        await svcUpdateRequest(requestId, { motoristasIds: updatedDrivers });
        revalidatePath('/');
        return { success: true };
      }
      return { error: "Motorista já atribuído." };
    } else {
      return { error: "Esta viagem já possui todos os motoristas definidos." };
    }
  }
  return { error: "Não foi possível atribuir o motorista." };
}

export async function registerDeparture(requestId: string, kmSaida: number) {
  const reqs = await svcGetRequests();
  const req = reqs.find(r => r.id === requestId);
  if (req) {
    await svcUpdateRequest(requestId, {
      status: 'EM_ANDAMENTO',
      kmSaida,
      horaSaidaReal: new Date().toISOString(),
    });
    revalidatePath('/');
  }
}

export async function registerReturn(requestId: string, kmRetorno: number) {
  const reqs = await svcGetRequests();
  const req = reqs.find(r => r.id === requestId);
  if (req && req.status === 'EM_ANDAMENTO') {
    await svcUpdateRequest(requestId, {
      status: 'CONCLUIDO',
      kmRetorno,
      horaRetornoReal: new Date().toISOString(),
    });
    revalidatePath('/');
  }
}
