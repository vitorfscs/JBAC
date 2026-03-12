import { User, Client, UserRole, FeeStatus, Document, Notification, Fee } from '../types';

// NOTE: This is an in-memory mock database. Data will reset on page refresh.
// A real application would connect to a database like MongoDB.

let clients: Client[] = [
  {
    id: 'client-01',
    name: 'Empresa Teste Ltda',
    documents: [
      { id: 'doc-1', name: 'Cartão CNPJ', type: 'cnpj', fileUrl: '/path/to/mock-cnpj.pdf' },
      { id: 'doc-2', name: 'Certificado Digital A1', type: 'certificate', fileUrl: '/path/to/mock-cert.pfx' },
    ],
    notifications: [
      { id: 'notif-1', title: 'DAS - Competência 06/2024', date: '2024-07-15', fileUrl: '/path/to/mock-das.pdf', read: false },
      { id: 'notif-2', title: 'DARF PIS - Competência 05/2024', date: '2024-06-20', fileUrl: '/path/to/mock-darf.pdf', read: true },
    ],
    fees: [
        { id: 'fee-1', month: 'Julho', year: 2024, status: FeeStatus.Pending, amount: 500.00 },
        { id: 'fee-2', month: 'Junho', year: 2024, status: FeeStatus.Paid, amount: 500.00 },
        { id: 'fee-3', month: 'Maio', year: 2024, status: FeeStatus.Paid, amount: 500.00 },
        { id: 'fee-4', month: 'Abril', year: 2024, status: FeeStatus.Overdue, amount: 450.00 },
    ],
  },
  {
    id: 'client-02',
    name: 'Inovação Tech S.A.',
    documents: [
        { id: 'doc-3', name: 'Cartão CNPJ', type: 'cnpj', fileUrl: '/path/to/mock-cnpj-2.pdf' },
    ],
    notifications: [],
    fees: [
        { id: 'fee-5', month: 'Julho', year: 2024, status: FeeStatus.Paid, amount: 750.00 },
    ]
  }
];

const users: User[] = [
  { id: 'user-office', username: 'admin', password: 'password', role: UserRole.OfficeAdmin, name: 'Contador', active: true },
  { id: 'user-client', username: 'teste', password: 'teste', role: UserRole.Client, clientId: 'client-01', name: 'Cliente Teste', active: true },
];

export const api = {
  authenticateUser: async (username: string, pass: string): Promise<User | null> => {
    // In a real app, this would be a secure API call.
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const user = users.find(u => u.username === username && u.password === pass);
    if (user) {
      // Return user object without the password for security
      const { password, ...userToReturn } = user;
      return userToReturn as User;
    }
    return null;
  },

  getClientData: async (clientId: string): Promise<Client | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return clients.find(c => c.id === clientId) || null;
  },
  
  getOfficeClients: async (): Promise<Client[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return clients;
  },
  
  uploadTaxDocument: async (clientId: string, title: string, file: File): Promise<Notification | null> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const clientIndex = clients.findIndex(c => c.id === clientId);
    if (clientIndex === -1) {
      return null;
    }

    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      title,
      date: new Date().toISOString().split('T')[0],
      fileUrl: `/path/to/mock-${file.name}`, // Mock file path
      read: false,
    };

    clients[clientIndex].notifications.unshift(newNotification);
    return newNotification;
  },

  uploadGeneralDocument: async (clientId: string, docType: 'contratoSocial', file: File): Promise<Document> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const clientIndex = clients.findIndex(c => c.id === clientId);
    if (clientIndex === -1) {
        throw new Error("Client not found");
    }

    const docNameMap = {
        contratoSocial: 'Contrato Social',
    };

    const newDoc: Document = {
        id: `doc-${Date.now()}`,
        name: docNameMap[docType],
        type: docType,
        fileUrl: `/path/to/mock-${file.name}`,
    };
    
    clients[clientIndex].documents.push(newDoc);
    return newDoc;
  },

  updateClientDocument: async (clientId: string, docType: 'cnpj' | 'certificate', file: File): Promise<Document> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const clientIndex = clients.findIndex(c => c.id === clientId);
      if (clientIndex === -1) {
          throw new Error("Client not found");
      }
      
      const docIndex = clients[clientIndex].documents.findIndex(d => d.type === docType);
      
      const updatedDoc: Document = {
          id: docIndex !== -1 ? clients[clientIndex].documents[docIndex].id : `doc-${Date.now()}`,
          name: docType === 'cnpj' ? 'Cartão CNPJ' : 'Certificado Digital A1',
          type: docType,
          fileUrl: `/path/to/mock-${file.name}`,
      };

      if (docIndex !== -1) {
          clients[clientIndex].documents[docIndex] = updatedDoc;
      } else {
          clients[clientIndex].documents.push(updatedDoc);
      }
      
      return updatedDoc;
  },
  
  markNotificationAsRead: async (clientId: string, notificationId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 200));
     const clientIndex = clients.findIndex(c => c.id === clientId);
    if (clientIndex === -1) return false;
    
    const notifIndex = clients[clientIndex].notifications.findIndex(n => n.id === notificationId);
    if (notifIndex === -1) return false;

    clients[clientIndex].notifications[notifIndex].read = true;
    return true;
  },

  addClient: async (
    name: string,
    cnpjFile: File,
    certificateFile: File | null
  ): Promise<Client> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newClient: Client = {
      id: `client-${Date.now()}`,
      name,
      documents: [],
      notifications: [],
      fees: [],
    };
    
    newClient.documents.push({
        id: `doc-${Date.now()}-cnpj`,
        name: 'Cartão CNPJ',
        type: 'cnpj',
        fileUrl: `/path/to/mock-${cnpjFile.name}`,
    });

    if (certificateFile) {
        newClient.documents.push({
            id: `doc-${Date.now()}-cert`,
            name: 'Certificado Digital',
            type: 'certificate',
            fileUrl: `/path/to/mock-${certificateFile.name}`,
        });
    }

    clients.push(newClient);
    return newClient;
  },

  addFee: async (
    clientId: string,
    feeData: Omit<Fee, 'id'>
  ): Promise<Fee> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const clientIndex = clients.findIndex((c) => c.id === clientId);
    if (clientIndex === -1) {
      throw new Error("Client not found");
    }

    const newFee: Fee = {
      id: `fee-${Date.now()}`,
      ...feeData,
    };

    clients[clientIndex].fees.unshift(newFee); // add to the top of the list
    return newFee;
  },

  updateFeeStatus: async (
    clientId: string,
    feeId: string,
    status: FeeStatus
  ): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const clientIndex = clients.findIndex(c => c.id === clientId);
    if (clientIndex === -1) return false;

    const feeIndex = clients[clientIndex].fees.findIndex(f => f.id === feeId);
    if (feeIndex === -1) return false;

    clients[clientIndex].fees[feeIndex].status = status;
    return true;
  },

  getUsers: async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Return non-office users without password
    return users
      .filter(u => u.role === UserRole.Client)
      .map(u => {
          const { password, ...userWithoutPassword } = u;
          return userWithoutPassword as User;
      });
  },

  createUser: async (
      name: string,
      username: string,
      passwordVal: string,
      clientId: string
  ): Promise<User> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (users.some(u => u.username === username)) {
          throw new Error('Nome de usuário já existe.');
      }

      const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          username,
          password: passwordVal,
          role: UserRole.Client,
          clientId,
          active: true,
      };
      users.push(newUser);

      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword as User;
  },

  updateUser: async (
    userId: string,
    updates: { name?: string; username?: string; password?: string; clientId?: string }
  ): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error('Usuário não encontrado.');
    }
    
    if (updates.username && users.some(u => u.username === updates.username && u.id !== userId)) {
        throw new Error('Nome de usuário já existe.');
    }

    const currentUser = users[userIndex];
    const updatedUserData = {
        ...currentUser,
        ...updates
    };

    // Only update password if a new one is provided and is not empty
    if (!updates.password) {
        updatedUserData.password = currentUser.password;
    }

    users[userIndex] = updatedUserData;

    const { password, ...userWithoutPassword } = updatedUserData;
    return userWithoutPassword as User;
  },

  deleteUser: async (userId: string): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
          return false;
      }
      users.splice(userIndex, 1);
      return true;
  },
};