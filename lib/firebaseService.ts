import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { firestoreDb } from './firebase';
import { User, Vehicle, ScheduleRequest, AgendaBlock } from './types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

// Error handling wrapper conforming to Firestore SKU instructions
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: 'server-action', // Since we resolve via cookies / server-side logic
      email: 'server-action',
    },
    operationType,
    path,
  };
  console.error('Firestore Error Raised: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Collections
const USERS_COL = 'users';
const VEHICLES_COL = 'vehicles';
const REQUESTS_COL = 'requests';
const BLOCKS_COL = 'blocks';

// Helper to seed data if empty
let dbSeeded = false;
async function ensureDbSeeded() {
  if (dbSeeded) return;
  try {
    // Check if admin user exists in Firestore
    const adminRef = doc(firestoreDb, USERS_COL, 'admin_cduc');
    const adminSnap = await getDoc(adminRef);
    if (!adminSnap.exists()) {
      // Seed default admin
      const defaultAdmin: User = {
        id: 'admin_cduc',
        name: 'Administrador Salvador',
        email: 'veiculos.cduc@gmail.com',
        role: 'ADMIN',
        password: '12345',
        status: 'APROVADO'
      };
      await setDoc(adminRef, defaultAdmin);
    }

    // Check if vehicles are empty
    const vehiclesColRef = collection(firestoreDb, VEHICLES_COL);
    const vehiclesSnap = await getDocs(vehiclesColRef);
    if (vehiclesSnap.empty) {
      const defaultVehicles: Vehicle[] = [
        { id: 'v1', name: 'Van Renault Master', plate: 'ABC-1234', quantidadePassageiros: 15 },
        { id: 'v2', name: 'Gol Volkswagen', plate: 'DEF-5678', quantidadePassageiros: 4 },
        { id: 'v3', name: 'Ônibus Mercedes', plate: 'GHI-9012', quantidadePassageiros: 40 },
      ];
      for (const v of defaultVehicles) {
        await setDoc(doc(firestoreDb, VEHICLES_COL, v.id), v);
      }
    }
    
    dbSeeded = true;
  } catch (error) {
    console.error('Failure seeding Firestore collections:', error);
  }
}

// --- USER OPERATIONS ---
export async function fsGetUsers(): Promise<User[]> {
  await ensureDbSeeded();
  try {
    const snap = await getDocs(collection(firestoreDb, USERS_COL));
    const list: User[] = [];
    snap.forEach((doc) => {
      list.push(doc.data() as User);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, USERS_COL);
  }
}

export async function fsGetUserByEmail(email: string): Promise<User | null> {
  await ensureDbSeeded();
  try {
    const q = query(collection(firestoreDb, USERS_COL), where('email', '==', email.toLowerCase().trim()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as User;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `${USERS_COL}/query-by-email`);
  }
}

export async function fsGetUserById(id: string): Promise<User | null> {
  await ensureDbSeeded();
  try {
    const snap = await getDoc(doc(firestoreDb, USERS_COL, id));
    if (!snap.exists()) return null;
    return snap.data() as User;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `${USERS_COL}/${id}`);
  }
}

export async function fsCreateUser(user: User): Promise<void> {
  await ensureDbSeeded();
  try {
    await setDoc(doc(firestoreDb, USERS_COL, user.id), user);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${USERS_COL}/${user.id}`);
  }
}

export async function fsUpdateUser(id: string, data: Partial<User>): Promise<void> {
  await ensureDbSeeded();
  try {
    await updateDoc(doc(firestoreDb, USERS_COL, id), data as any);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${USERS_COL}/${id}`);
  }
}

// --- VEHICLE OPERATIONS ---
export async function fsGetVehicles(): Promise<Vehicle[]> {
  await ensureDbSeeded();
  try {
    const snap = await getDocs(collection(firestoreDb, VEHICLES_COL));
    const list: Vehicle[] = [];
    snap.forEach((doc) => {
      list.push(doc.data() as Vehicle);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, VEHICLES_COL);
  }
}

export async function fsCreateVehicle(vehicle: Vehicle): Promise<void> {
  await ensureDbSeeded();
  try {
    await setDoc(doc(firestoreDb, VEHICLES_COL, vehicle.id), vehicle);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${VEHICLES_COL}/${vehicle.id}`);
  }
}

export async function fsDeleteVehicle(id: string): Promise<void> {
  await ensureDbSeeded();
  try {
    await deleteDoc(doc(firestoreDb, VEHICLES_COL, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${VEHICLES_COL}/${id}`);
  }
}

// --- REQUEST OPERATIONS ---
export async function fsGetRequests(): Promise<ScheduleRequest[]> {
  await ensureDbSeeded();
  try {
    const snap = await getDocs(collection(firestoreDb, REQUESTS_COL));
    const list: ScheduleRequest[] = [];
    snap.forEach((doc) => {
      list.push(doc.data() as ScheduleRequest);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, REQUESTS_COL);
  }
}

export async function fsCreateRequest(request: ScheduleRequest): Promise<void> {
  await ensureDbSeeded();
  try {
    await setDoc(doc(firestoreDb, REQUESTS_COL, request.id), request);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${REQUESTS_COL}/${request.id}`);
  }
}

export async function fsUpdateRequest(id: string, data: Partial<ScheduleRequest>): Promise<void> {
  await ensureDbSeeded();
  try {
    await updateDoc(doc(firestoreDb, REQUESTS_COL, id), data as any);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${REQUESTS_COL}/${id}`);
  }
}

// --- AGENDA BLOCK OPERATIONS ---
export async function fsGetBlocks(): Promise<AgendaBlock[]> {
  await ensureDbSeeded();
  try {
    const snap = await getDocs(collection(firestoreDb, BLOCKS_COL));
    const list: AgendaBlock[] = [];
    snap.forEach((doc) => {
      list.push(doc.data() as AgendaBlock);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, BLOCKS_COL);
  }
}

export async function fsCreateBlock(block: AgendaBlock): Promise<void> {
  await ensureDbSeeded();
  try {
    await setDoc(doc(firestoreDb, BLOCKS_COL, block.id), block);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${BLOCKS_COL}/${block.id}`);
  }
}

export async function fsDeleteBlock(id: string): Promise<void> {
  await ensureDbSeeded();
  try {
    await deleteDoc(doc(firestoreDb, BLOCKS_COL, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${BLOCKS_COL}/${id}`);
  }
}
