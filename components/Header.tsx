
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User as UserIcon, ShieldCheck, Building2, UserCircle } from 'lucide-react';
import { UserRole } from '../types';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleBadge = () => {
    switch (user?.role) {
      case UserRole.SuperAdmin:
        return <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1"><ShieldCheck size={10} /> SaaS Admin</span>;
      case UserRole.OfficeAdmin:
        return <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1"><Building2 size={10} /> Escritório</span>;
      case UserRole.Client:
        return <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1"><UserCircle size={10} /> Cliente</span>;
      default:
        return null;
    }
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Building2 size={20} className="sm:hidden" />
              <Building2 size={24} className="hidden sm:block" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">AccountAPP</h1>
              <div className="flex items-center gap-2">
                {getRoleBadge()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3 text-slate-600">
              <div className="text-right hidden xs:block">
                <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-none truncate max-w-[100px] sm:max-w-none">{user?.name}</p>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1">@{user?.username}</p>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <UserIcon size={16} className="sm:hidden" />
                <UserIcon size={18} className="hidden sm:block" />
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 sm:gap-2 text-sm font-medium text-slate-400 hover:text-rose-600 transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
