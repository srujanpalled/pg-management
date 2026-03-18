export type BedStatus = 'Available' | 'Occupied' | 'Reserved';
export type PaymentStatus = 'Paid' | 'Pending Payment' | 'Overdue';

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email?: string;
  aadhaar?: string;
  emergencyContact?: string;
  roomId: string;
  bedId: string;
  checkInDate: string;
  checkOutDate?: string;
  rentDueDate: string;
  paymentStatus: PaymentStatus;
  initials: string;
  color: string;
  rentAmount: number;
  securityDeposit: number;
  dueAmount?: number;
  isActive: boolean;
}

export interface Bed {
  id: string;
  number: number;
  label?: string;
  status: BedStatus;
  tenantId?: string;
}

export interface Reminder {
  id: string;
  type: 'maintenance' | 'rent' | 'vacancy' | 'repair';
  message: string;
}

export interface Room {
  id: string;
  number: string;
  floor: string;
  type: 'Single' | 'Double' | 'Triple' | 'Custom';
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Temporarily Closed' | 'Active';
  beds: Bed[];
  reminders: Reminder[];
  rentPerBed?: number;
  securityDeposit?: number;
  maintenanceCharges?: number;
  facilities?: string[];
}

export interface Transaction {
  id: string;
  tenantId?: string;
  type: 'Income' | 'Expense';
  category: 'Rent' | 'Deposit' | 'Electricity' | 'Water' | 'Maintenance' | 'Salary' | 'Groceries' | 'Other';
  amount: number;
  date: string;
  description: string;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer';
  status: 'Completed' | 'Pending';
}

export interface Complaint {
  id: string;
  tenantId: string;
  roomId: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  dateReported: string;
  dateResolved?: string;
}

export interface ActivityLog {
  id: string;
  type: 'resident_added' | 'resident_removed' | 'payment_received' | 'expense_added' | 'complaint_filed' | 'complaint_resolved' | 'room_added' | 'room_updated';
  message: string;
  timestamp: string;
}

export interface PGSettings {
  pgName: string;
  ownerName: string;
  address: string;
  phone: string;
  email: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  workType: string;
}
