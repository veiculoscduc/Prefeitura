import { User, Vehicle, ScheduleRequest, AgendaBlock, RefuelingRecord } from './types';

interface StoreType {
  users: User[];
  vehicles: Vehicle[];
  requests: ScheduleRequest[];
  blocks: AgendaBlock[];
  refuelings: RefuelingRecord[];
  currentUser: User | null; // For simulating active session
}

// Initial mock data
const initialUsers: User[] = [
  { id: 'admin_cduc', name: 'Prefeitura', email: 'veiculos.cduc@gmail.com', role: 'ADMIN', status: 'APROVADO' },
];

const initialVehicles: Vehicle[] = [
  { id: 'v1', name: 'Van Renault Master', plate: 'ABC-1234', quantidadePassageiros: 15 },
  { id: 'v2', name: 'Gol Volkswagen', plate: 'DEF-5678', quantidadePassageiros: 4 },
  { id: 'v3', name: 'Ônibus Mercedes', plate: 'GHI-9012', quantidadePassageiros: 40 },
];

// Initialize on global object to persist across dev reloads
declare global {
  var __SYSTEM_STORE__: StoreType | undefined;
}

if (!globalThis.__SYSTEM_STORE__) {
  globalThis.__SYSTEM_STORE__ = {
    users: initialUsers,
    vehicles: initialVehicles,
    requests: [],
    blocks: [],
    refuelings: [],
    currentUser: null, // Starts unauthenticated to force login screen
  };
} else {
  // Database migration for existing session nodes in memory
  // Filter out any leftover simulated user accounts
  globalThis.__SYSTEM_STORE__.users = globalThis.__SYSTEM_STORE__.users.filter(u => {
    return !['u1', 'u2', 'a1', 'm1', 'm2', 'admin_institucional'].includes(u.id) &&
      u.email.toLowerCase().trim() !== 'admin@instituicao.edu.br' &&
      u.email.toLowerCase().trim() !== 'joao@instituicao.edu.br' &&
      u.email.toLowerCase().trim() !== 'maria@instituicao.edu.br' &&
      u.email.toLowerCase().trim() !== 'carlos@instituicao.edu.br' &&
      u.email.toLowerCase().trim() !== 'roberto@instituicao.edu.br';
  });

  // Guarantee that the default administrator email and accounts exist and have the correct role/status
  const existingAdminIndex = globalThis.__SYSTEM_STORE__.users.findIndex(
    u => u.email.toLowerCase().trim() === 'veiculos.cduc@gmail.com'
  );
  
  if (existingAdminIndex > -1) {
    // Force the correct administrative privileges and status
    globalThis.__SYSTEM_STORE__.users[existingAdminIndex].name = 'Prefeitura';
    globalThis.__SYSTEM_STORE__.users[existingAdminIndex].role = 'ADMIN';
    globalThis.__SYSTEM_STORE__.users[existingAdminIndex].status = 'APROVADO';
  } else {
    // Inject the missing admin user
    globalThis.__SYSTEM_STORE__.users.push(initialUsers[0]);
  }

  // Ensure all existing active users have status defined
  globalThis.__SYSTEM_STORE__.users = globalThis.__SYSTEM_STORE__.users.map(u => {
    // If it's the admin, keep role as ADMIN
    const isMainAdmin = u.email.toLowerCase().trim() === 'veiculos.cduc@gmail.com';
    return {
      ...u,
      name: isMainAdmin ? 'Prefeitura' : u.name,
      role: isMainAdmin ? 'ADMIN' : u.role,
      status: isMainAdmin ? 'APROVADO' : (u.status || 'PENDENTE')
    };
  });
}

export const db = globalThis.__SYSTEM_STORE__;

export function getDb() {
  return globalThis.__SYSTEM_STORE__ as StoreType;
}

export function resetDb() {
  globalThis.__SYSTEM_STORE__ = {
    users: initialUsers,
    vehicles: initialVehicles,
    requests: [],
    blocks: [],
    refuelings: [],
    currentUser: initialUsers[0],
  };
}
