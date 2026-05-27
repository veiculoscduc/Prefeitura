export type UserRole = 'SOLICITANTE' | 'ADMIN' | 'MOTORISTA';
export type SolicitanteType = 'Docente' | 'Técnico';
export type UserStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  matricula?: string;
  tipo?: SolicitanteType;
  password?: string;
  status?: UserStatus;
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  quantidadePassageiros?: number;
}

export type RequestStatus = 'SOLICITADO' | 'CONFIRMADO' | 'NEGADO' | 'CANCELADO_USUARIO' | 'CANCELADO_PREFEITURA' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export interface ScheduleRequest {
  id: string;
  solicitanteId: string;
  status: RequestStatus;
  dataSolicitacao: string; // ISO date string
  dataSaida: string; // YYYY-MM-DD
  horaSaida: string; // HH:mm
  horaRetorno: string; // HH:mm
  veiculosIds: string[]; // 1 or 2 vehicles
  motoristasIds: string[]; // Assigned drivers
  quantidadePassageiros?: number;
  
  // Conditional fields
  vaiAcompanhar: boolean;
  nomePassageiro?: string;
  vaiSairCampus: boolean;
  enderecoSaida?: string;
  enderecoDestino: string;
  
  // Post-creation fields
  justificativaRejeicao?: string;
  kmSaida?: number; // Added when trip starts
  kmRetorno?: number; // Added when trip ends
  horaSaidaReal?: string; // ISO
  horaRetornoReal?: string; // ISO
}

export interface AgendaBlock {
  id: string;
  veiculoId?: string; // If undefined, applies to all vehicles
  dataInicio: string; // ISO date string YYYY-MM-DD
  dataFim: string; // ISO date string YYYY-MM-DD
  horaInicio?: string; // HH:mm
  horaFim?: string; // HH:mm
  justificativa: string;
}

export interface RefuelingRecord {
  id: string;
  motoristaId: string;
  veiculoId: string;
  data: string;
  valor: number;
  litros: number;
  comprovanteUrl?: string; // Mocked URL
}
