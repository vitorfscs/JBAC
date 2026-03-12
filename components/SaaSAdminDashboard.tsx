import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Office, User, UserRole } from '../types';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';
import { 
  Building2, 
  Users, 
  DollarSign, 
  Plus, 
  Edit, 
  Power, 
  PowerOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserPlus,
  ShieldCheck,
  Trash2,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SaaSAdminDashboard: React.FC = () => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [superAdmins, setSuperAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'offices' | 'users' | 'subscriptions' | 'administration'>('offices');
  
  // Modal states
  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [officeToDelete, setOfficeToDelete] = useState<Office | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSuperAdminModalOpen, setIsSuperAdminModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUserDeleteConfirmOpen, setIsUserDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [officesData, usersData, superAdminsData] = await Promise.all([
      api.getOffices(),
      api.getUsers(),
      api.getSuperAdmins()
    ]);
    setOffices(officesData);
    setUsers(usersData.filter(u => u.role === UserRole.OfficeAdmin));
    setSuperAdmins(superAdminsData);
    setLoading(false);
  };

  const handleToggleOfficeStatus = async (office: Office) => {
    try {
      await api.updateOffice(office.id, { active: !office.active });
      fetchData();
    } catch (error) {
      alert('Erro ao atualizar status do escritório');
    }
  };

  const handleUpdateSubscription = async (office: Office, status: 'paid' | 'pending' | 'overdue') => {
    try {
      await api.updateOffice(office.id, { subscriptionStatus: status });
      fetchData();
    } catch (error) {
      alert('Erro ao atualizar mensalidade');
    }
  };

  const renderOffices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Escritórios Contábeis</h2>
        <button 
          onClick={() => { setEditingOffice(null); setModalError(null); setIsOfficeModalOpen(true); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20} /> Novo Escritório
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offices.map(office => (
          <motion.div 
            layout
            key={office.id} 
            className={`bg-white p-6 rounded-2xl border transition-all ${!office.active ? 'opacity-60 grayscale' : 'border-slate-100 shadow-sm hover:shadow-md'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Building2 size={24} />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleToggleOfficeStatus(office)}
                  className={`p-2 rounded-lg transition-colors ${office.active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                  title={office.active ? "Desativar" : "Ativar"}
                >
                  {office.active ? <PowerOff size={18} /> : <Power size={18} />}
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation();
                    setEditingOffice(office); 
                    setIsOfficeModalOpen(true); 
                  }}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit size={18} />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">{office.name}</h3>
            <p className="text-sm text-slate-500 mb-4">CNPJ: {office.cnpj || 'Não informado'}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                office.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {office.active ? 'Ativo' : 'Inativo'}
              </span>
              <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                <Users size={14} />
                {users.filter(u => u.officeId === office.id).length} usuários
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Usuários de Escritórios</h2>
        <button 
          onClick={() => { setModalError(null); setIsUserModalOpen(true); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <UserPlus size={20} /> Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Escritório</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs mr-3">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-slate-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                    user.role === UserRole.SuperAdmin ? 'bg-rose-100 text-rose-700' :
                    user.role === UserRole.OfficeAdmin ? 'bg-indigo-100 text-indigo-700' :
                    user.role === UserRole.Accountant ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                  {offices.find(o => o.id === user.officeId)?.name || 'Nenhum'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button 
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setIsPasswordModalOpen(true);
                    }}
                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Alterar Senha"
                  >
                    <Lock size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      setEditingUser(user);
                      setModalError(null);
                      setIsUserModalOpen(true);
                    }}
                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Editar Usuário"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      setUserToDelete(user);
                      setIsUserDeleteConfirmOpen(true);
                    }}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                    title="Excluir Usuário"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

  const renderSubscriptions = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Controle de Mensalidades</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Escritório</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Último Pagamento</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {offices.map(office => (
              <tr key={office.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">{office.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    office.subscriptionStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    office.subscriptionStatus === 'overdue' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                    'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {office.subscriptionStatus === 'paid' ? <CheckCircle2 size={14} /> : 
                     office.subscriptionStatus === 'overdue' ? <AlertCircle size={14} /> : <Clock size={14} />}
                    {office.subscriptionStatus === 'paid' ? 'Pago' : 
                     office.subscriptionStatus === 'overdue' ? 'Atrasado' : 'Pendente'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {office.lastPaymentDate ? new Date(office.lastPaymentDate).toLocaleDateString('pt-BR') : '---'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                  <button 
                    onClick={() => handleUpdateSubscription(office, 'paid')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded"
                  >
                    Marcar Pago
                  </button>
                  <button 
                    onClick={() => handleUpdateSubscription(office, 'overdue')}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded"
                  >
                    Marcar Atraso
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

  const renderAdministration = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Administradores do Sistema (SaaS)</h2>
        <button 
          onClick={() => { setModalError(null); setIsSuperAdminModalOpen(true); }}
          className="bg-rose-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
        >
          <ShieldCheck size={20} /> Novo Super Admin
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-rose-600 focus:ring-rose-500" />
                </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nível</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {superAdmins.map(admin => (
              <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="rounded border-slate-300 text-rose-600 focus:ring-rose-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center font-bold text-xs mr-3">
                      {admin.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-slate-900">{admin.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{admin.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Super Admin
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button 
                    onClick={() => {
                      setSelectedUserId(admin.id);
                      setIsPasswordModalOpen(true);
                    }}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                    title="Alterar Senha"
                  >
                    <Lock size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      setEditingUser(admin);
                      setModalError(null);
                      setIsUserModalOpen(true); // Reuse UserModal for editing admins too
                    }}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                    title="Editar Admin"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      setUserToDelete(admin);
                      setIsUserDeleteConfirmOpen(true);
                    }}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                    title="Excluir Admin"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
          <aside className="w-full md:w-64 shrink-0">
            <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide">
              <button 
                onClick={() => setActiveTab('offices')}
                className={`flex items-center px-4 py-2.5 sm:py-3 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'offices' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                <Building2 size={18} className="mr-2 sm:mr-3" /> Escritórios
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`flex items-center px-4 py-2.5 sm:py-3 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                <Users size={18} className="mr-2 sm:mr-3" /> Usuários
              </button>
              <button 
                onClick={() => setActiveTab('subscriptions')}
                className={`flex items-center px-4 py-2.5 sm:py-3 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'subscriptions' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                <DollarSign size={18} className="mr-2 sm:mr-3" /> Mensalidades
              </button>
              <button 
                onClick={() => setActiveTab('administration')}
                className={`flex items-center px-4 py-2.5 sm:py-3 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'administration' ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'text-slate-500 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                <ShieldCheck size={18} className="mr-2 sm:mr-3" /> Admin
              </button>
            </nav>
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                <p className="font-medium">Carregando painel SaaS...</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'offices' && renderOffices()}
                  {activeTab === 'users' && renderUsers()}
                  {activeTab === 'subscriptions' && renderSubscriptions()}
                  {activeTab === 'administration' && renderAdministration()}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>

      {/* Office Modal */}
      {isOfficeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              {editingOffice ? 'Editar Escritório' : 'Novo Escritório'}
            </h3>
            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl">
                {modalError}
              </div>
            )}
            <form 
              key={editingOffice?.id || 'new-office'}
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const cnpj = formData.get('cnpj') as string;
                
                setIsSubmitting(true);
                setModalError(null);
                try {
                  if (editingOffice) {
                    await api.updateOffice(editingOffice.id, { name, cnpj });
                  } else {
                    await api.createOffice(name, cnpj);
                  }
                  setIsOfficeModalOpen(false);
                  fetchData();
                } catch (error) {
                  console.error('Error saving office:', error);
                  setModalError(error instanceof Error ? error.message : 'Erro ao salvar escritório');
                } finally {
                  setIsSubmitting(false);
                }
              }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome do Escritório</label>
                <input name="name" defaultValue={editingOffice?.name} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">CNPJ</label>
                <input 
                  name="cnpj" 
                  defaultValue={editingOffice?.cnpj} 
                  required 
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/\D/g, '');
                  }}
                  placeholder="Somente números"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsOfficeModalOpen(false)} className="flex-1 px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
              {editingOffice && (
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setOfficeToDelete(editingOffice);
                      setIsDeleteConfirmOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-rose-600 font-bold hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={18} /> Excluir Escritório
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      )}

      {/* User Modal (Create/Edit) */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              {editingUser ? 'Editar Usuário' : 'Novo Administrador de Escritório'}
            </h3>
            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl">
                {modalError}
              </div>
            )}
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const username = formData.get('username') as string;
              const password = formData.get('password') as string;
              const officeId = formData.get('officeId') as string;
              const role = formData.get('role') as UserRole || (editingUser?.role || UserRole.OfficeAdmin);
              
              setIsSubmitting(true);
              setModalError(null);
              try {
                if (editingUser) {
                  await api.updateUser(editingUser.id, { 
                    name, 
                    username, 
                    password: password || undefined, 
                    clientId: 'none',
                    role
                  }, currentUser?.id);
                } else {
                  await api.createOfficeUser(name, username, password, officeId, currentUser?.id);
                }
                setIsUserModalOpen(false);
                setEditingUser(null);
                fetchData();
              } catch (error) {
                console.error('Error saving user:', error);
                const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar usuário.';
                setModalError(errorMessage);
              } finally {
                setIsSubmitting(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome Completo</label>
                <input name="name" defaultValue={editingUser?.name} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Username</label>
                <input name="username" defaultValue={editingUser?.username} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              
              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Escritório Vinculado</label>
                  <select name="officeId" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">Selecione um escritório</option>
                    {offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              )}

              {editingUser && editingUser.role === UserRole.SuperAdmin && (
                <input type="hidden" name="role" value={UserRole.SuperAdmin} />
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
                </label>
                <input name="password" type="password" required={!editingUser} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setIsUserModalOpen(false); setEditingUser(null); }} className="flex-1 px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Salvando...' : (editingUser ? 'Salvar Alterações' : 'Criar Usuário')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* User Delete Confirmation Modal */}
      {isUserDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
          >
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Excluir Usuário?</h3>
            <p className="text-slate-500 text-center mb-8">
              Tem certeza que deseja excluir o usuário <span className="font-bold text-slate-800">{userToDelete?.name}</span>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsUserDeleteConfirmOpen(false)}
                className="flex-1 px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={async () => {
                  if (userToDelete) {
                    setIsSubmitting(true);
                    try {
                      await api.deleteUser(userToDelete.id, currentUser?.id);
                      setIsUserDeleteConfirmOpen(false);
                      setUserToDelete(null);
                      fetchData();
                    } catch (error) {
                      alert('Erro ao excluir usuário');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Super Admin Modal */}
      {isSuperAdminModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6">Novo Super Administrador</h3>
            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl">
                {modalError}
              </div>
            )}
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const username = formData.get('username') as string;
              
              setIsSubmitting(true);
              setModalError(null);
              try {
                const password = formData.get('password') as string;
                await api.createSuperAdmin(name, username, password, currentUser?.id);
                setIsSuperAdminModalOpen(false);
                fetchData();
              } catch (error) {
                console.error('Error creating super admin:', error);
                const errorMessage = error instanceof Error ? error.message : 'Erro ao criar super admin.';
                setModalError(errorMessage);
              } finally {
                setIsSubmitting(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome Completo</label>
                <input name="name" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Username</label>
                <input name="username" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Senha</label>
                <input name="password" type="password" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsSuperAdminModalOpen(false)} className="flex-1 px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Criando...' : 'Criar Admin'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Alterar Senha</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newPassword = formData.get('password') as string;
              
              try {
                if (selectedUserId) {
                  await api.updateUserPassword(selectedUserId, newPassword, currentUser?.id);
                  setIsPasswordModalOpen(false);
                  alert('Senha alterada com sucesso!');
                }
              } catch (error) {
                alert('Erro ao alterar senha');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nova Senha</label>
                <input 
                  name="password" 
                  type="password" 
                  required 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="Digite a nova senha"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">Atualizar</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && officeToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4">Confirmar Exclusão</h3>
            <p className="text-slate-600 mb-6">
              ATENÇÃO: Isso excluirá permanentemente o escritório <span className="font-bold">"{officeToDelete.name}"</span>, todos os seus clientes, usuários e registros. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)} 
                className="flex-1 px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await api.deleteOffice(officeToDelete.id);
                    setIsDeleteConfirmOpen(false);
                    setIsOfficeModalOpen(false);
                    fetchData();
                  } catch (error) {
                    alert(`Erro ao excluir: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="flex-1 px-4 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors"
              >
                {isSubmitting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SaaSAdminDashboard;
