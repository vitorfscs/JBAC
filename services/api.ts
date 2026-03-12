import { supabase } from './supabase';
import { User, UserRole, Client, Document, Notification, Fee, FeeStatus, Office } from '../types';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

const sanitizeCnpj = (cnpj: string) => {
  return cnpj.replace(/\D/g, '');
};

const createAuditLog = async (action: string, performerId: string, targetId?: string, details?: any) => {
  try {
    const { error } = await supabase.from('audit_logs').insert([{
      action,
      performer_id: performerId,
      target_id: targetId,
      details
    }]);
    if (error) console.error('Error creating audit log:', error);
  } catch (e) {
    console.error('Audit log failed:', e);
  }
};

const checkSupabaseConfig = () => {
  // @ts-ignore
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url || url.includes('placeholder')) {
    throw new Error('Configuração do Supabase ausente. Por favor, configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas configurações do projeto.');
  }
};

export const api = {
  authenticateUser: async (username: string, pass: string): Promise<User | null> => {
    checkSupabaseConfig();
    
    try {
      // 1. Check profiles table for the user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          offices (active)
        `)
        .eq('username', username)
        .single();

      if (profileData && !profileError) {
        // Verify password hash
        const isPasswordValid = await bcrypt.compare(pass, profileData.password);
        
        // Fallback for plain text passwords (if any exist from before)
        const isPlainTextMatch = pass === profileData.password;

        if (!isPasswordValid && !isPlainTextMatch) {
          return null;
        }

        // Check if office is active (if user belongs to an office)
        if (profileData.office_id && profileData.offices && !profileData.offices.active) {
          throw new Error('Este escritório está inativo. Entre em contato com o administrador.');
        }

        // Check if user itself is active
        if (profileData.active === false) {
          throw new Error('Sua conta está desativada.');
        }

        return {
          id: profileData.id,
          username: profileData.username,
          role: profileData.role as UserRole,
          name: profileData.name,
          officeId: profileData.office_id,
          clientId: profileData.client_id,
          active: profileData.active ?? true
        };
      }

      return null;
    } catch (e) {
      console.error('Auth error:', e);
      throw e;
    }
  },

  getClientData: async (clientId: string): Promise<Client | null> => {
    checkSupabaseConfig();
    try {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select(`
          *,
          documents (*),
          notifications (*),
          fees (*)
        `)
        .eq('id', clientId)
        .single();

      if (clientError || !client) throw new Error('Not found');
      
      return {
        id: client.id,
        name: client.name,
        cnpj: client.cnpj,
        documents: (client.documents || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          fileUrl: d.file_url
        })),
        notifications: (client.notifications || []).map((n: any) => ({
          id: n.id,
          title: n.title,
          date: n.date,
          fileUrl: n.file_url,
          read: n.is_read
        })),
        fees: (client.fees || []).map((f: any) => ({
          ...f,
          amount: Number(f.amount || 0)
        })),
      };
    } catch (e) {
      console.error('Error fetching client data:', e);
      return null;
    }
  },

  getOfficeClients: async (officeId?: string): Promise<Client[]> => {
    checkSupabaseConfig();
    try {
      let query = supabase.from('clients').select(`
        *,
        fees (*),
        documents (*),
        notifications (*)
      `);
      if (officeId) {
        query = query.eq('office_id', officeId);
      }
      const { data: clients, error } = await query;
      if (error) throw error;
      
      return (clients || []).map(client => ({
        id: client.id,
        name: client.name,
        cnpj: client.cnpj,
        fees: (client.fees || []).map((f: any) => ({
          ...f,
          amount: Number(f.amount || 0)
        })),
        documents: (client.documents || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          fileUrl: d.file_url
        })),
        notifications: (client.notifications || []).map((n: any) => ({
          id: n.id,
          title: n.title,
          date: n.date,
          fileUrl: n.file_url,
          read: n.is_read
        }))
      }));
    } catch (e) {
      console.error('Error fetching office clients:', e);
      return [];
    }
  },

  getUsers: async (officeId?: string): Promise<User[]> => {
    checkSupabaseConfig();
    try {
      let query = supabase.from('profiles').select('*');
      if (officeId) {
        query = query.eq('office_id', officeId);
      }
      const { data: profiles, error } = await query;
      if (error) throw error;
      return (profiles || []).map(p => ({
        id: p.id,
        username: p.username,
        role: p.role as UserRole,
        name: p.name,
        officeId: p.office_id,
        clientId: p.client_id,
        active: p.active ?? true
      }));
    } catch (e) {
      return [];
    }
  },

  // Document Upload Methods
  uploadTaxDocument: async (clientId: string, title: string, file: File) => {
    checkSupabaseConfig();
    try {
      // 1. Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${clientId}/tax_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('clients-data')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Storage upload error (tax):', uploadError);
        if (uploadError.message.toLowerCase().includes('not found')) {
          throw new Error('O bucket "clients-data" não foi encontrado no Supabase Storage. Crie-o no painel do Supabase.');
        }
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('clients-data')
        .getPublicUrl(fileName);

      // 3. Create notification record
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          client_id: clientId,
          title: title,
          file_url: publicUrl,
          date: new Date().toISOString().split('T')[0],
          is_read: false
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Error uploading tax document:', e);
      throw e;
    }
  },

  uploadGeneralDocument: async (clientId: string, docType: string, file: File) => {
    checkSupabaseConfig();
    try {
      // 1. Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${clientId}/doc_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('clients-data')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Storage upload error (general):', uploadError);
        if (uploadError.message.toLowerCase().includes('not found')) {
          throw new Error('O bucket "clients-data" não foi encontrado no Supabase Storage. Crie-o no painel do Supabase.');
        }
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('clients-data')
        .getPublicUrl(fileName);

      // 3. Create document record
      const { data, error } = await supabase
        .from('documents')
        .insert([{
          client_id: clientId,
          name: file.name,
          type: docType,
          file_url: publicUrl
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Error uploading general document:', e);
      throw e;
    }
  },

  updateClientDocument: async (clientId: string, docType: string, file: File) => {
    checkSupabaseConfig();
    try {
      // 1. Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${clientId}/update_${docType}_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('clients-data')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Storage upload error (update):', uploadError);
        if (uploadError.message.toLowerCase().includes('not found')) {
          throw new Error('O bucket "clients-data" não foi encontrado no Supabase Storage. Crie-o no painel do Supabase.');
        }
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('clients-data')
        .getPublicUrl(fileName);

      // 3. Update or Insert document record
      // First check if it exists
      const { data: existing } = await supabase
        .from('documents')
        .select('id')
        .eq('client_id', clientId)
        .eq('type', docType)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('documents')
          .update({ file_url: publicUrl, name: file.name })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('documents')
          .insert([{
            client_id: clientId,
            name: file.name,
            type: docType,
            file_url: publicUrl
          }]);
        if (error) throw error;
      }
      return true;
    } catch (e) {
      console.error('Error updating client document:', e);
      throw e;
    }
  },
  markNotificationAsRead: async (clientId: string, notificationId: string) => {
    checkSupabaseConfig();
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('client_id', clientId);
    if (error) throw error;
    return true;
  },
  addClient: async (name: string, cnpj: string, officeId: string) => {
    const cleanCnpj = sanitizeCnpj(cnpj);
    // Check if CNPJ already exists
    const { data: existingClient } = await supabase
      .from('clients')
      .select('cnpj')
      .eq('cnpj', cleanCnpj)
      .maybeSingle();

    if (existingClient) {
      throw new Error('Este CNPJ já está cadastrado.');
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([{ name, cnpj: cleanCnpj, office_id: officeId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  addFee: async (clientId: string, feeData: any) => {
    const { data, error } = await supabase
      .from('fees')
      .insert([{
        client_id: clientId,
        month: feeData.month,
        year: feeData.year,
        amount: feeData.amount,
        status: feeData.status
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  updateFeeStatus: async (clientId: string, feeId: string, status: any) => {
    const { error } = await supabase
      .from('fees')
      .update({ status })
      .eq('id', feeId)
      .eq('client_id', clientId);
    if (error) throw error;
    return true;
  },
  createUser: async (name: string, username: string, passwordVal: string, clientId: string, officeId: string, role: UserRole = UserRole.Client, performerId?: string) => {
    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (existingUser) {
      throw new Error('Este nome de usuário já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(passwordVal, SALT_ROUNDS);

    const { data, error } = await supabase.from('profiles').insert([{
      name,
      username,
      password: hashedPassword,
      role: role,
      client_id: clientId === 'none' || !clientId ? null : clientId,
      office_id: officeId
    }]).select().maybeSingle();
    
    if (error) {
      console.error('Erro Supabase (createUser):', error);
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }

    if (performerId && data) {
      await createAuditLog('CREATE_USER', performerId, data.id, { role, username });
    }

    return data;
  },
  updateUser: async (userId: string, updates: any, performerId?: string) => {
    const updateData: any = {
      name: updates.name,
      username: updates.username,
      client_id: updates.clientId === 'none' || !updates.clientId ? null : updates.clientId,
      role: updates.role
    };

    if (updates.password) {
      updateData.password = await bcrypt.hash(updates.password, SALT_ROUNDS);
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);
    if (error) throw error;

    if (performerId) {
      await createAuditLog('UPDATE_USER', performerId, userId, { name: updates.name, role: updates.role });
    }

    return true;
  },
  deleteUser: async (userId: string, performerId?: string) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (error) throw error;

    if (performerId) {
      await createAuditLog('DELETE_USER', performerId, userId);
    }

    return true;
  },
  getOffices: async (): Promise<Office[]> => {
    checkSupabaseConfig();
    try {
      const { data, error } = await supabase.from('offices').select('*');
      if (error) throw error;
      return (data || []).map(o => ({
        id: o.id,
        name: o.name,
        cnpj: o.cnpj,
        active: o.active ?? true,
        subscriptionStatus: o.subscription_status || 'paid',
        lastPaymentDate: o.last_payment_date
      }));
    } catch (e) {
      return [];
    }
  },

  createOffice: async (name: string, cnpj: string) => {
    checkSupabaseConfig();
    const cleanCnpj = sanitizeCnpj(cnpj);
    const { data, error } = await supabase.from('offices').insert([{ name, cnpj: cleanCnpj, active: true, subscription_status: 'paid' }]).select().single();
    if (error) throw error;
    return data;
  },

  updateOffice: async (id: string, updates: Partial<Office>) => {
    checkSupabaseConfig();
    
    // 1. Update the office itself
    const { error: officeError } = await supabase.from('offices').update({
      name: updates.name,
      cnpj: updates.cnpj ? sanitizeCnpj(updates.cnpj) : undefined,
      active: updates.active,
      subscription_status: updates.subscriptionStatus,
    }).eq('id', id);
    
    if (officeError) throw officeError;

    // 2. Cascading Inactivation: If office is inactivated, disable all users
    if (updates.active !== undefined) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ active: updates.active })
        .eq('office_id', id);
      
      if (profileError) {
        console.error('Error updating linked profiles:', profileError);
      }
    }
    
    return true;
  },
  deleteOffice: async (id: string) => {
    console.log('API: Deleting office', id);
    checkSupabaseConfig();
    
    try {
      // 1. Delete profiles first (if they are not CASCADE)
      const { error: pError } = await supabase.from('profiles').delete().eq('office_id', id);
      if (pError) console.warn('API: Warning deleting profiles', pError);
      
      // 2. Delete the office (this should trigger CASCADE for clients, etc. if configured)
      const { error } = await supabase.from('offices').delete().eq('id', id);
      
      if (error) {
        console.error('API: Error deleting office:', error);
        throw new Error(`Falha ao excluir escritório: ${error.message}`);
      }
      console.log('API: Office deleted successfully');
      return true;
    } catch (e) {
      console.error('API: Catch error deleting office:', e);
      throw e;
    }
  },
  deleteClient: async (id: string) => {
    console.log('API: Deleting client', id);
    checkSupabaseConfig();
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
      console.error('API: Error deleting client:', error);
      throw error;
    }
    console.log('API: Client deleted successfully');
    return true;
  },

  deleteDocument: async (id: string) => {
    checkSupabaseConfig();
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  deleteNotification: async (id: string) => {
    checkSupabaseConfig();
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
  updateClient: async (id: string, updates: { name?: string, cnpj?: string }) => {
    checkSupabaseConfig();
    const updateData: any = { name: updates.name };
    if (updates.cnpj) {
      updateData.cnpj = sanitizeCnpj(updates.cnpj);
    }
    const { error } = await supabase.from('clients').update(updateData).eq('id', id);
    if (error) throw error;
    return true;
  },

  createOfficeUser: async (name: string, username: string, passwordVal: string, officeId: string, performerId?: string) => {
    return api.createUser(name, username, passwordVal, '', officeId, UserRole.OfficeAdmin, performerId);
  },

  createSuperAdmin: async (name: string, username: string, passwordVal: string, performerId?: string) => {
    return api.createUser(name, username, passwordVal, '', '', UserRole.SuperAdmin, performerId);
  },

  getSuperAdmins: async (): Promise<User[]> => {
    checkSupabaseConfig();
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', UserRole.SuperAdmin);
      if (error) throw error;
      return (data || []).map(p => ({
        id: p.id,
        username: p.username,
        role: p.role as UserRole,
        name: p.name,
        active: p.active ?? true
      }));
    } catch (e) {
      return [];
    }
  },

  updateUserPassword: async (userId: string, newPasswordVal: string, performerId?: string) => {
    checkSupabaseConfig();
    const hashedPassword = await bcrypt.hash(newPasswordVal, SALT_ROUNDS);
    const { error } = await supabase
      .from('profiles')
      .update({ password: hashedPassword })
      .eq('id', userId);
    if (error) throw error;
    if (performerId) {
      await createAuditLog('UPDATE_PASSWORD', performerId, userId);
    }
    return true;
  },
};
