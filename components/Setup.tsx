import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { motion } from 'motion/react';
import { Shield, User, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

const Setup: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${username}@jb-assessoria.com`,
        password: password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create profile in database
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            name,
            username,
            password,
            role: 'super_admin'
          }]);

        if (profileError) throw profileError;

        setStatus({ type: 'success', message: 'Super Admin criado com sucesso! Agora você pode fazer login.' });
      }
    } catch (error: any) {
      console.error(error);
      setStatus({ type: 'error', message: error.message || 'Erro ao criar administrador.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Configuração Inicial</h2>
          <p className="text-slate-500 text-sm mt-1">Crie o primeiro Super Administrador do sistema.</p>
        </div>

        {status && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}
          >
            {status.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
            <p className="text-sm font-medium">{status.message}</p>
          </motion.div>
        )}

        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                placeholder="Ex: João Silva"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                placeholder="Ex: admin_master"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 disabled:opacity-50 mt-4"
          >
            {loading ? 'Criando...' : 'Criar Super Admin'}
          </button>

          <button 
            type="button"
            onClick={onComplete}
            className="w-full py-3 text-slate-500 font-medium hover:text-slate-700 transition-colors text-sm"
          >
            Voltar para o Login
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Atenção</p>
          <p className="text-xs text-slate-500 mt-1">Esta página é para configuração inicial. Remova-a após criar seu usuário.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Setup;
