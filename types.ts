export enum UserRole {
  SuperAdmin = 'super_admin',
  OfficeAdmin = 'office_admin',
  Accountant = 'accountant',
  Client = 'client',
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  clientId?: string; 
  officeId?: string;
  name: string;
  active: boolean;
}

export interface Office {
  id: string;
  name: string;
  cnpj?: string;
  active: boolean;
  subscriptionStatus: 'paid' | 'pending' | 'overdue';
  lastPaymentDate?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'cnpj' | 'certificate' | 'contratoSocial';
  fileUrl: string;
}

export interface Notification {
  id: string;
  title: string;
  date: string;
  fileUrl: string;
  read: boolean;
}

export enum FeeStatus {
  Paid = 'Pago',
  Pending = 'Pendente',
  Overdue = 'Atrasado',
}

export interface Fee {
  id: string;
  month: string;
  year: number;
  status: FeeStatus;
  amount: number;
}

export interface Client {
  id: string;
  name: string;
  cnpj?: string;
  documents: Document[];
  notifications: Notification[];
  fees: Fee[];
}