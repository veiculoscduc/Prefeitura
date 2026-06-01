import { getSupabase } from './supabase';
import { db } from './store';
import { User, Vehicle, ScheduleRequest, AgendaBlock, RefuelingRecord } from './types';

// --- FIELD MAPPING UTILITIES ---
function mapUserFromDb(row: any): User {
  return {
    id: row.id,
    auth_id: row.auth_id,
    name: row.name,
    email: row.email,
    role: row.role,
    matricula: row.matricula,
    tipo: row.tipo,
    password: row.password,
    status: row.status,
  };
}

function mapUserToDb(user: User): any {
  return {
    id: user.id,
    auth_id: user.auth_id,
    name: user.name,
    email: user.email.toLowerCase().trim(),
    role: user.role,
    matricula: user.matricula || null,
    tipo: user.tipo || null,
    password: user.password || '12345',
    status: user.status || 'PENDENTE',
  };
}

function mapVehicleFromDb(row: any): Vehicle {
  return {
    id: row.id,
    name: row.name,
    plate: row.plate,
    quantidadePassageiros: row.quantidade_passageiros || row.quantidadePassageiros,
  };
}

function mapVehicleToDb(v: Vehicle): any {
  return {
    id: v.id,
    name: v.name,
    plate: v.plate,
    quantidade_passageiros: v.quantidadePassageiros || 4,
  };
}

function mapRequestFromDb(row: any): ScheduleRequest {
  return {
    id: row.id,
    solicitanteId: row.solicitante_id || row.solicitanteId,
    status: row.status,
    dataSolicitacao: row.data_solicitacao || row.dataSolicitacao,
    dataSaida: row.data_saida || row.dataSaida,
    horaSaida: row.hora_saida || row.horaSaida,
    horaRetorno: row.hora_retorno || row.horaRetorno,
    veiculosIds: row.veiculos_ids || row.veiculosIds || [],
    motoristasIds: row.motoristas_ids || row.motoristasIds || [],
    quantidadePassageiros: row.quantidade_passageiros || row.quantidadePassageiros,
    vaiAcompanhar: row.vai_acompanhar !== undefined ? row.vai_acompanhar : row.vaiAcompanhar,
    nomePassageiro: row.nome_passageiro || row.nomePassageiro,
    vaiSairCampus: row.vai_sair_campus !== undefined ? row.vai_sair_campus : row.vaiSairCampus,
    enderecoSaida: row.endereco_saida || row.enderecoSaida,
    enderecoDestino: row.endereco_destino || row.enderecoDestino || row.destino || '',
    justificativaRejeicao: row.justificativa_rejeicao || row.justificativaRejeicao,
    kmSaida: row.km_saida !== null ? row.km_saida : row.kmSaida,
    kmRetorno: row.km_retorno !== null ? row.km_retorno : row.kmRetorno,
    horaSaidaReal: row.hora_saida_real || row.horaSaidaReal,
    horaRetornoReal: row.hora_retorno_real || row.horaRetornoReal,
  };
}

function mapRequestToDb(req: ScheduleRequest): any {
  return {
    id: req.id,
    solicitante_id: req.solicitanteId,
    status: req.status,
    data_solicitacao: req.dataSolicitacao,
    data_saida: req.dataSaida,
    hora_saida: req.horaSaida,
    hora_retorno: req.horaRetorno,
    veiculos_ids: req.veiculosIds || [],
    motoristas_ids: req.motoristasIds || [],
    quantidade_passageiros: req.quantidadePassageiros || 1,
    vai_acompanhar: req.vaiAcompanhar ?? true,
    nome_passageiro: req.nomePassageiro || null,
    vai_sair_campus: req.vaiSairCampus ?? false,
    endereco_saida: req.enderecoSaida || null,
    endereco_destino: req.enderecoDestino || '',
    justificativa_rejeicao: req.justificativaRejeicao || null,
    km_saida: req.kmSaida ?? null,
    km_retorno: req.kmRetorno ?? null,
    hora_saida_real: req.horaSaidaReal || null,
    hora_retorno_real: req.horaRetornoReal || null,
  };
}

function mapBlockFromDb(row: any): AgendaBlock {
  return {
    id: row.id,
    veiculoId: row.veiculo_id || row.veiculoId,
    dataInicio: row.data_inicio || row.dataInicio,
    dataFim: row.data_fim || row.dataFim,
    horaInicio: row.hora_inicio || row.horaInicio,
    horaFim: row.hora_fim || row.horaFim,
    justificativa: row.justificativa,
  };
}

function mapBlockToDb(b: AgendaBlock): any {
  return {
    id: b.id,
    veiculo_id: b.veiculoId || null,
    data_inicio: b.dataInicio,
    data_fim: b.dataFim,
    hora_inicio: b.horaInicio || null,
    hora_fim: b.horaFim || null,
    justificativa: b.justificativa,
  };
}

// --- DB ACCESS WRAPPERS ---

export async function svcGetUsers(): Promise<User[]> {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Supabase users table query error:', error.message || error);
      } else if (data) {
        return data.map(mapUserFromDb);
      }
    }
  } catch (err) {
    console.error('Supabase users fetch exception:', err);
  }
  return db.users;
}

export async function svcGetUserByEmail(email: string): Promise<User | null> {
  const cleanEmail = email.toLowerCase().trim();
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (error) {
        console.error('Supabase user by email query error:', error.message || error);
      } else if (data) {
        return mapUserFromDb(data);
      }
    }
  } catch (err) {
    console.error('Supabase user select exception:', err);
  }
  return db.users.find(u => u.email.toLowerCase().trim() === cleanEmail) || null;
}

export async function svcGetUserById(id: string): Promise<User | null> {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        console.error('Supabase user by id query error:', error.message || error);
      } else if (data) {
        return mapUserFromDb(data);
      }
    }
  } catch (err) {
    console.error('Supabase user by id exception:', err);
  }
  return db.users.find(u => u.id === id) || null;
}

export async function svcCreateUser(user: User): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('users').insert(mapUserToDb(user));
    if (error) {
      console.error('Supabase user create error:', error);
      throw new Error(`Erro no Supabase: ${error.message}. Verifique se a tabela 'users' foi devidamente criada executando o script SQL consolidado.`);
    }
  }
  const exists = db.users.some(u => u.id === user.id);
  if (!exists) {
    db.users.push(user);
  }
}

export async function svcUpdateUser(id: string, updates: Partial<User>): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.auth_id !== undefined) dbUpdates.auth_id = updates.auth_id;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.matricula !== undefined) dbUpdates.matricula = updates.matricula;
    if (updates.tipo !== undefined) dbUpdates.tipo = updates.tipo;
    if (updates.password !== undefined) dbUpdates.password = updates.password;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { error } = await supabase.from('users').update(dbUpdates).eq('id', id);
    if (error) {
      console.error('Supabase user update error:', error);
      throw new Error(`Erro no Supabase ao atualizar usuário: ${error.message}`);
    }
  }
  const idx = db.users.findIndex(u => u.id === id);
  if (idx > -1) {
    db.users[idx] = { ...db.users[idx], ...updates };
  }
}

export async function svcDeleteUser(id: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      console.error('Supabase user delete error:', error);
      throw new Error('Erro ao excluir usuário no banco de dados.');
    }
  } else {
    db.users = db.users.filter(u => u.id !== id);
  }
}

export async function svcGetVehicles(): Promise<Vehicle[]> {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('vehicles').select('*');
      if (error) {
        console.error('Supabase vehicles table query error:', error.message || error);
      } else if (data) {
        return data.map(mapVehicleFromDb);
      }
    }
  } catch (err) {
    console.error('Supabase vehicles fetch exception:', err);
  }
  return db.vehicles;
}

export async function svcCreateVehicle(vehicle: Vehicle): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('vehicles').insert(mapVehicleToDb(vehicle));
    if (error) {
      console.error('Supabase vehicle insert error:', error);
      throw new Error(`Erro no Supabase: ${error.message}. Verifique se a tabela 'vehicles' foi devidamente criada executando o script SQL consolidado.`);
    }
  }
  const exists = db.vehicles.some(v => v.id === vehicle.id);
  if (!exists) {
    db.vehicles.push(vehicle);
  }
}

export async function svcDeleteVehicle(id: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) {
      console.error('Supabase vehicle delete error:', error);
      throw new Error(`Erro no Supabase ao deletar veículo: ${error.message}`);
    }
  }
  db.vehicles = db.vehicles.filter(v => v.id !== id);
}

export async function svcGetRequests(): Promise<ScheduleRequest[]> {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('requests').select('*');
      if (error) {
        console.error('Supabase requests table query error:', error.message || error);
      } else if (data) {
        return data.map(mapRequestFromDb);
      }
    }
  } catch (err) {
    console.error('Supabase requests fetch exception:', err);
  }
  return db.requests;
}

export async function svcCreateRequest(req: ScheduleRequest): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('requests').insert(mapRequestToDb(req));
    if (error) {
      console.error('Supabase request insert error:', error);
      throw new Error(`Erro no Supabase: ${error.message}. Verifique se a tabela 'requests' foi criada executando o script SQL consolidado.`);
    }
  }
  const exists = db.requests.some(r => r.id === req.id);
  if (!exists) {
    db.requests.push(req);
  }
}

export async function svcUpdateRequest(id: string, updates: Partial<ScheduleRequest>): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.motoristasIds !== undefined) dbUpdates.motoristas_ids = updates.motoristasIds;
    if (updates.justificativaRejeicao !== undefined) dbUpdates.justificativa_rejeicao = updates.justificativaRejeicao;
    if (updates.kmSaida !== undefined) dbUpdates.km_saida = updates.kmSaida;
    if (updates.kmRetorno !== undefined) dbUpdates.km_retorno = updates.kmRetorno;
    if (updates.horaSaidaReal !== undefined) dbUpdates.hora_saida_real = updates.horaSaidaReal;
    if (updates.horaRetornoReal !== undefined) dbUpdates.hora_retorno_real = updates.horaRetornoReal;

    const { error } = await supabase.from('requests').update(dbUpdates).eq('id', id);
    if (error) {
      console.error('Supabase request update error:', error);
      throw new Error(`Erro no Supabase ao atualizar solicitação: ${error.message}`);
    }
  }
  const idx = db.requests.findIndex(r => r.id === id);
  if (idx > -1) {
    db.requests[idx] = { ...db.requests[idx], ...updates };
  }
}

export async function svcGetBlocks(): Promise<AgendaBlock[]> {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('blocks').select('*');
      if (error) {
        console.error('Supabase blocks table query error:', error.message || error);
      } else if (data) {
        return data.map(mapBlockFromDb);
      }
    }
  } catch (err) {
    console.error('Supabase blocks fetch exception:', err);
  }
  return db.blocks;
}

export async function svcCreateBlock(block: AgendaBlock): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('blocks').insert(mapBlockToDb(block));
    if (error) {
      console.error('Supabase block insert error:', error);
      throw new Error(`Erro no Supabase: ${error.message}. Verifique se a tabela 'blocks' foi criada executando o script SQL consolidado.`);
    }
  }
  const exists = db.blocks.some(b => b.id === block.id);
  if (!exists) {
    db.blocks.push(block);
  }
}

export async function svcDeleteBlock(id: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('blocks').delete().eq('id', id);
    if (error) {
      console.error('Supabase block delete error:', error);
      throw new Error(`Erro no Supabase ao deletar bloqueio: ${error.message}`);
    }
  }
  db.blocks = db.blocks.filter(b => b.id !== id);
}
