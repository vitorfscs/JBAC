import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Client, FeeStatus, Notification } from '../types';
import Header from './Header';
import { 
  FileText, 
  Bell, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight,
  Download
} from 'lucide-react';

const NotificationList: React.FC<{notifications: Notification[], onNotificationClick: (id: string) => void}> = ({ notifications, onNotificationClick }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {notifications.length > 0 ? notifications.map(notif => (
                <li key={notif.id} onClick={() => onNotificationClick(notif.id)} className={`p-5 hover:bg-slate-50 transition-all cursor-pointer group ${!notif.read ? 'bg-indigo-50/30' : ''}`}>
                  <div className="flex items-start gap-4">
                     <div className={`mt-2 flex-shrink-0 w-2 h-2 rounded-full ${!notif.read ? 'bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]' : 'bg-slate-200'}`}></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                          <p className={`text-sm font-semibold ${!notif.read ? 'text-indigo-900' : 'text-slate-700'}`}>{notif.title}</p>
                          <p className="text-xs text-slate-400 font-medium">{new Date(notif.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <a href={notif.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Download size={14} />
                          Baixar Guia (PDF)
                        </a>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                </li>
              )) : <li className="p-10 text-center text-slate-400 font-medium">Nenhuma notificação encontrada.</li>}
            </ul>
        </div>
    )
}

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');
  const [docSubTab, setDocSubTab] = useState<'geral' | 'impostos'>('geral');

  useEffect(() => {
    const fetchClientData = async () => {
      if (user && user.clientId) {
        setLoading(true);
        const data = await api.getClientData(user.clientId);
        setClient(data);
        setLoading(false);
      }
    };
    fetchClientData();
  }, [user]);

  const handleNotificationClick = (notificationId: string) => {
    if(!client || !user?.clientId) return;
    const notification = client.notifications.find(n => n.id === notificationId);
    if(notification && !notification.read) {
        api.markNotificationAsRead(user.clientId, notificationId);
        setClient(prev => prev ? ({...prev, notifications: prev.notifications.map(n => n.id === notificationId ? {...n, read: true} : n)}) : null);
    }
  }
  
  const unreadCount = client?.notifications.filter(n => !n.read).length || 0;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400">
          <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="font-medium">Carregando seus dados...</p>
        </div>
      );
    }
    if (!client) {
      return (
        <div className="bg-rose-50 border border-rose-100 p-8 rounded-2xl text-center text-rose-600 font-medium">
          Não foi possível carregar os dados da sua empresa.
        </div>
      );
    }

    switch (activeTab) {
      case 'documents':
        const getSubTabClass = (tabName: 'geral' | 'impostos') => 
            `px-4 py-2 text-sm font-semibold transition-all relative ${
            docSubTab === tabName
                ? 'text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`;

        return (
            <div className="space-y-6">
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setDocSubTab('geral')} className={getSubTabClass('geral')}>Geral</button>
                        <button onClick={() => setDocSubTab('impostos')} className={getSubTabClass('impostos')}>Impostos</button>
                    </nav>
                </div>

                {docSubTab === 'geral' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {client.documents.length > 0 ? client.documents.map(doc => (
                        <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="group block p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              <FileText size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 leading-tight">{doc.name}</h3>
                            <p className="text-xs font-bold text-indigo-600 mt-3 flex items-center gap-1.5 uppercase tracking-wider">
                              Visualizar Arquivo
                              <ChevronRight size={14} />
                            </p>
                        </a>
                        )) : <div className="p-10 text-center text-slate-400 font-medium col-span-full bg-white rounded-2xl border border-dashed border-slate-200">Nenhum documento geral encontrado.</div>}
                    </div>
                )}
                {docSubTab === 'impostos' && (
                    <NotificationList notifications={client.notifications} onNotificationClick={handleNotificationClick} />
                )}
            </div>
        );
      case 'notifications':
        return <NotificationList notifications={client.notifications} onNotificationClick={handleNotificationClick} />;
      case 'fees':
        const statusStyles = {
            [FeeStatus.Paid]: { icon: <CheckCircle2 size={16} />, text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            [FeeStatus.Pending]: { icon: <Clock size={16} />, text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
            [FeeStatus.Overdue]: { icon: <XCircle size={16} />, text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100' },
        }
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                      <tr>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mês/Ano</th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                  {client.fees.map(fee => (
                      <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{fee.month}/{fee.year}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">R$ {fee.amount.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusStyles[fee.status].bg} ${statusStyles[fee.status].text} ${statusStyles[fee.status].border}`}>
                                  {statusStyles[fee.status].icon}
                                  {fee.status}
                              </span>
                          </td>
                      </tr>
                  ))}
                  </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getTabClass = (tabName: string) => 
    `flex items-center justify-center sm:justify-start px-4 py-2.5 sm:py-3 text-sm font-semibold rounded-xl transition-all ${
      activeTab === tabName
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
        : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'
    }`;
    
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
          <aside className="w-full md:w-64 shrink-0">
            <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide">
              <button className={getTabClass('notifications')} onClick={() => setActiveTab('notifications')}>
                <Bell size={18} className="mr-2 sm:mr-3" /> 
                <span className="whitespace-nowrap">Notificações</span>
                {unreadCount > 0 && <span className="ml-2 bg-rose-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm shadow-rose-200">{unreadCount}</span>}
              </button>
              <button className={getTabClass('documents')} onClick={() => setActiveTab('documents')}>
                <FileText size={18} className="mr-2 sm:mr-3" /> <span className="whitespace-nowrap">Documentos</span>
              </button>
              <button className={getTabClass('fees')} onClick={() => setActiveTab('fees')}>
                <DollarSign size={18} className="mr-2 sm:mr-3" /> <span className="whitespace-nowrap">Honorários</span>
              </button>
            </nav>
          </aside>
          <div className="flex-1 min-w-0">
              {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;