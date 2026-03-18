import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Room, Tenant, Transaction, Complaint, ActivityLog, PGSettings, Worker } from '../types';
import { mockRooms } from '../data/mockRooms';
import api from '../utils/api';

// ─── Storage helpers ───────────────────────────────────────────────
const STORAGE_KEY = 'pg_manager_data';

interface StoredData {
  rooms: Room[];
  residents: Tenant[];
  transactions: Transaction[];
  complaints: Complaint[];
  activityLog: ActivityLog[];
  settings: PGSettings;
  initialized: boolean;
}

function loadFromStorage(): StoredData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveToStorage(data: Omit<StoredData, 'initialized'>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, initialized: true }));
  } catch { /* storage full */ }
}

// ─── Defaults ──────────────────────────────────────────────────────
const defaultSettings: PGSettings = {
  pgName: 'Srujan PG',
  ownerName: 'Admin',
  address: 'Bangalore, Karnataka',
  phone: '+91 98765 43210',
  email: 'admin@pgmanager.com',
};

const AVATAR_COLORS = [
  'bg-blue-500/20 text-blue-400', 'bg-emerald-500/20 text-emerald-400',
  'bg-purple-500/20 text-purple-400', 'bg-amber-500/20 text-amber-400',
  'bg-rose-500/20 text-rose-400', 'bg-cyan-500/20 text-cyan-400',
  'bg-indigo-500/20 text-indigo-400', 'bg-pink-500/20 text-pink-400',
];

const initialResidents: Tenant[] = [
  { id: 't1', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul@email.com', aadhaar: '1234-5678-9012', emergencyContact: '+91 91111 11111', roomId: '1', bedId: 'b1', checkInDate: '2025-09-01', rentDueDate: '2026-03-15', paymentStatus: 'Pending Payment', initials: 'RS', color: AVATAR_COLORS[0], rentAmount: 8000, securityDeposit: 16000, isActive: true },
  { id: 't2', name: 'Suresh Kumar', phone: '+91 91234 56789', email: 'suresh@email.com', roomId: '5', bedId: 'b6', checkInDate: '2025-08-10', rentDueDate: '2026-03-05', paymentStatus: 'Paid', initials: 'SK', color: AVATAR_COLORS[1], rentAmount: 6000, securityDeposit: 12000, isActive: true },
  { id: 't3', name: 'Amit Verma', phone: '+91 99887 76655', roomId: '7', bedId: 'b9', checkInDate: '2025-07-20', rentDueDate: '2026-03-12', paymentStatus: 'Overdue', initials: 'AV', color: AVATAR_COLORS[4], rentAmount: 5000, securityDeposit: 10000, isActive: true },
  { id: 't4', name: 'Priya Nair', phone: '+91 87654 32109', email: 'priya@email.com', roomId: '4', bedId: 'b4', checkInDate: '2025-10-01', rentDueDate: '2026-03-18', paymentStatus: 'Paid', initials: 'PN', color: AVATAR_COLORS[2], rentAmount: 6000, securityDeposit: 12000, isActive: true },
  { id: 't5', name: 'Deepak Joshi', phone: '+91 76543 21098', roomId: '4', bedId: 'b5', checkInDate: '2025-11-15', rentDueDate: '2026-03-20', paymentStatus: 'Pending Payment', initials: 'DJ', color: AVATAR_COLORS[3], rentAmount: 6000, securityDeposit: 12000, isActive: true },
  { id: 't6', name: 'Vikram Singh', phone: '+91 65432 10987', roomId: '8', bedId: 'b12', checkInDate: '2025-06-01', rentDueDate: '2026-03-10', paymentStatus: 'Paid', initials: 'VS', color: AVATAR_COLORS[5], rentAmount: 5000, securityDeposit: 10000, isActive: true },
  { id: 't7', name: 'Naveen Reddy', phone: '+91 54321 09876', email: 'naveen@email.com', roomId: '8', bedId: 'b13', checkInDate: '2025-08-20', rentDueDate: '2026-03-22', paymentStatus: 'Pending Payment', initials: 'NR', color: AVATAR_COLORS[6], rentAmount: 5000, securityDeposit: 10000, isActive: true },
  { id: 't8', name: 'Kiran Patel', phone: '+91 43210 98765', roomId: '8', bedId: 'b14', checkInDate: '2025-09-10', rentDueDate: '2026-03-08', paymentStatus: 'Paid', initials: 'KP', color: AVATAR_COLORS[7], rentAmount: 5000, securityDeposit: 10000, isActive: true },
];

const initialTransactions: Transaction[] = [
  { id: 'tx1', tenantId: 't2', type: 'Income', category: 'Rent', amount: 6000, date: '2026-03-01', description: 'March Rent — Suresh Kumar', paymentMethod: 'UPI', status: 'Completed' },
  { id: 'tx2', tenantId: 't4', type: 'Income', category: 'Rent', amount: 6000, date: '2026-03-02', description: 'March Rent — Priya Nair', paymentMethod: 'Bank Transfer', status: 'Completed' },
  { id: 'tx3', tenantId: 't6', type: 'Income', category: 'Rent', amount: 5000, date: '2026-03-03', description: 'March Rent — Vikram Singh', paymentMethod: 'Cash', status: 'Completed' },
  { id: 'tx4', tenantId: 't8', type: 'Income', category: 'Rent', amount: 5000, date: '2026-03-04', description: 'March Rent — Kiran Patel', paymentMethod: 'UPI', status: 'Completed' },
  { id: 'tx5', type: 'Expense', category: 'Electricity', amount: 8500, date: '2026-03-02', description: 'February Electricity Bill', paymentMethod: 'Bank Transfer', status: 'Completed' },
  { id: 'tx6', type: 'Expense', category: 'Water', amount: 3200, date: '2026-03-03', description: 'February Water Bill', paymentMethod: 'Bank Transfer', status: 'Completed' },
  { id: 'tx7', type: 'Expense', category: 'Groceries', amount: 15000, date: '2026-03-05', description: 'Weekly Groceries for mess', paymentMethod: 'UPI', status: 'Completed' },
  { id: 'tx8', type: 'Expense', category: 'Maintenance', amount: 2500, date: '2026-03-06', description: 'Plumber — Room 103 leak fix', paymentMethod: 'Cash', status: 'Completed' },
  { id: 'tx9', type: 'Expense', category: 'Salary', amount: 12000, date: '2026-03-01', description: 'Cook salary — March', paymentMethod: 'Bank Transfer', status: 'Completed' },
];

const initialComplaints: Complaint[] = [
  { id: 'c1', tenantId: 't1', roomId: '1', title: 'Leaking Tap', description: 'Bathroom tap is leaking continuously, needs plumber.', priority: 'High', status: 'Open', dateReported: '2026-03-10' },
  { id: 'c2', tenantId: 't3', roomId: '7', title: 'AC Not Cooling', description: 'The AC in the room is not cooling properly, may need gas refill.', priority: 'Medium', status: 'In Progress', dateReported: '2026-03-12' },
  { id: 'c3', tenantId: 't7', roomId: '8', title: 'WiFi Slow', description: 'WiFi speed drops significantly after 9 PM every day.', priority: 'Low', status: 'Open', dateReported: '2026-03-14' },
];

const initialActivityLog: ActivityLog[] = [
  { id: 'a1', type: 'payment_received', message: 'Received ₹6,000 rent from Suresh Kumar', timestamp: '2026-03-01T10:30:00' },
  { id: 'a2', type: 'payment_received', message: 'Received ₹6,000 rent from Priya Nair', timestamp: '2026-03-02T11:00:00' },
  { id: 'a3', type: 'expense_added', message: 'Electricity bill ₹8,500 paid', timestamp: '2026-03-02T14:00:00' },
  { id: 'a4', type: 'complaint_filed', message: 'Rahul Sharma reported: Leaking Tap', timestamp: '2026-03-10T09:00:00' },
  { id: 'a5', type: 'payment_received', message: 'Received ₹5,000 rent from Vikram Singh', timestamp: '2026-03-03T10:00:00' },
];

// ─── Context ───────────────────────────────────────────────────────
interface AppContextType {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  residents: Tenant[];
  setResidents: React.Dispatch<React.SetStateAction<Tenant[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  activityLog: ActivityLog[];
  settings: PGSettings;
  setSettings: React.Dispatch<React.SetStateAction<PGSettings>>;

  // Helpers
  addResident: (tenant: Omit<Tenant, 'id' | 'initials' | 'color' | 'isActive'>) => void;
  removeResident: (tenantId: string) => void;
  updateResident: (tenantId: string, data: Partial<Tenant>) => void;
  recordPayment: (txData: Omit<Transaction, 'id'>) => void;
  addExpense: (txData: Omit<Transaction, 'id'>) => void;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'status' | 'dateReported'>) => void;
  updateComplaintStatus: (id: string, status: Complaint['status']) => void;
  addActivity: (type: ActivityLog['type'], message: string) => void;
  clearAllData: () => void;
  workers: Worker[];
  setWorkers: React.Dispatch<React.SetStateAction<Worker[]>>;
  fetchData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const stored = loadFromStorage();

  const [rooms, setRooms] = useState<Room[]>(stored?.rooms || mockRooms);
  const [residents, setResidents] = useState<Tenant[]>(stored?.residents || initialResidents);
  const [transactions, setTransactions] = useState<Transaction[]>(stored?.transactions || initialTransactions);
  const [complaints, setComplaints] = useState<Complaint[]>(stored?.complaints || initialComplaints);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>(stored?.activityLog || initialActivityLog);
  const [settings, setSettings] = useState<PGSettings>(stored?.settings || defaultSettings);
  const [workers, setWorkers] = useState<Worker[]>([]);

  const fetchData = async () => {
    try {
      const [rRes, tRes, pRes, mRes, wRes] = await Promise.all([
        api.get('/rooms').catch(() => ({ data: mockRooms })),
        api.get('/tenants').catch(() => ({ data: initialResidents })),
        api.get('/payments').catch(() => ({ data: [] })),
        api.get('/maintenance').catch(() => ({ data: initialComplaints })),
        api.get('/workers').catch(() => ({ data: [] }))
      ]);
      setRooms(rRes.data);
      const formattedResidents = tRes.data.map((r: any) => ({
        ...r,
        paymentStatus: (r.dueAmount && r.dueAmount > 0) ? 'Pending Payment' : 'Paid',
        initials: r.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
        color: 'bg-blue-500/20 text-blue-400', // Default color, can be enhanced to use consistent hash
      }));
      setResidents(formattedResidents);
      // Simplify transactions to just payments for now or merge later
      if (pRes.data && pRes.data.length > 0) {
        setTransactions(pRes.data as Transaction[]);
      }
      setComplaints(mRes.data);
      setWorkers(wRes.data);
    } catch (err) {
      console.error('Error fetching backend data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Removed localStorage persistent save for now, as we use backend logic mainly

  const addActivity = useCallback((type: ActivityLog['type'], message: string) => {
    const entry: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      type, message,
      timestamp: new Date().toISOString(),
    };
    setActivityLog(prev => [entry, ...prev].slice(0, 50)); // keep last 50
  }, []);

  const addResident = useCallback((tenantData: Omit<Tenant, 'id' | 'initials' | 'color' | 'isActive'>) => {
    const id = 't_' + Math.random().toString(36).substr(2, 9);
    const initials = tenantData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const newResident: Tenant = { ...tenantData, id, initials, color, isActive: true };
    setResidents(prev => [...prev, newResident]);

    // Update room/bed status
    setRooms(prev => prev.map(room => {
      if (room.id === tenantData.roomId) {
        const updatedBeds = room.beds.map(bed =>
          bed.id === tenantData.bedId ? { ...bed, status: 'Occupied' as const, tenantId: id } : bed
        );
        const occupiedCount = updatedBeds.filter(b => b.status === 'Occupied').length;
        const newStatus = occupiedCount === updatedBeds.length ? 'Occupied' : occupiedCount > 0 ? 'Partially Occupied' : room.status;
        return { ...room, beds: updatedBeds, status: newStatus };
      }
      return room;
    }));

    addActivity('resident_added', `${tenantData.name} moved into Room ${tenantData.roomId}`);
  }, [addActivity]);

  const removeResident = useCallback((tenantId: string) => {
    const tenant = residents.find(r => r.id === tenantId);
    if (!tenant) return;

    setResidents(prev => prev.map(r =>
      r.id === tenantId ? { ...r, isActive: false, checkOutDate: new Date().toISOString().split('T')[0] } : r
    ));

    // Free up the bed
    setRooms(prev => prev.map(room => {
      if (room.id === tenant.roomId) {
        const updatedBeds = room.beds.map(bed =>
          bed.id === tenant.bedId ? { ...bed, status: 'Available' as const, tenantId: undefined } : bed
        );
        const occupiedCount = updatedBeds.filter(b => b.status === 'Occupied').length;
        const newStatus = occupiedCount === 0 ? 'Vacant' : occupiedCount === updatedBeds.length ? 'Occupied' : 'Partially Occupied';
        return { ...room, beds: updatedBeds, status: newStatus };
      }
      return room;
    }));

    addActivity('resident_removed', `${tenant.name} checked out`);
  }, [residents, addActivity]);

  const updateResident = useCallback((tenantId: string, data: Partial<Tenant>) => {
    setResidents(prev => prev.map(r => r.id === tenantId ? { ...r, ...data } : r));
  }, []);

  const recordPayment = useCallback((txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...txData, id: 'tx_' + Math.random().toString(36).substr(2, 9) };
    setTransactions(prev => [newTx, ...prev]);

    if (txData.type === 'Income' && txData.category === 'Rent' && txData.tenantId) {
      setResidents(prev => prev.map(r =>
        r.id === txData.tenantId ? { ...r, paymentStatus: 'Paid' as const } : r
      ));
    }

    const tenant = residents.find(r => r.id === txData.tenantId);
    addActivity('payment_received', `Received ₹${txData.amount.toLocaleString()} from ${tenant?.name || 'tenant'}`);
  }, [residents, addActivity]);

  const addExpense = useCallback((txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...txData, id: 'tx_' + Math.random().toString(36).substr(2, 9) };
    setTransactions(prev => [newTx, ...prev]);
    addActivity('expense_added', `${txData.category} expense ₹${txData.amount.toLocaleString()}`);
  }, [addActivity]);

  const addComplaint = useCallback((data: Omit<Complaint, 'id' | 'status' | 'dateReported'>) => {
    const newComplaint: Complaint = {
      ...data,
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      status: 'Open',
      dateReported: new Date().toISOString().split('T')[0],
    };
    setComplaints(prev => [newComplaint, ...prev]);

    const tenant = residents.find(r => r.id === data.tenantId);
    addActivity('complaint_filed', `${tenant?.name || 'Resident'} reported: ${data.title}`);
  }, [residents, addActivity]);

  const updateComplaintStatus = useCallback((id: string, status: Complaint['status']) => {
    setComplaints(prev => prev.map(c =>
      c.id === id ? { ...c, status, ...(status === 'Resolved' ? { dateResolved: new Date().toISOString().split('T')[0] } : {}) } : c
    ));
    if (status === 'Resolved') {
      const complaint = complaints.find(c => c.id === id);
      addActivity('complaint_resolved', `Resolved: ${complaint?.title || 'complaint'}`);
    }
  }, [complaints, addActivity]);

  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRooms(mockRooms);
    setResidents(initialResidents);
    setTransactions(initialTransactions);
    setComplaints(initialComplaints);
    setActivityLog(initialActivityLog);
    setSettings(defaultSettings);
  }, []);

  return (
    <AppContext.Provider value={{
      rooms, setRooms,
      residents, setResidents,
      transactions, setTransactions,
      complaints, setComplaints,
      activityLog,
      settings, setSettings,
      addResident, removeResident, updateResident,
      recordPayment, addExpense,
      addComplaint, updateComplaintStatus,
      addActivity, clearAllData,
      workers, setWorkers, fetchData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
