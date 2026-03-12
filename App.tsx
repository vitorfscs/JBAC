
import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './components/Login';
import ClientDashboard from './components/ClientDashboard';
import OfficeDashboard from './components/OfficeDashboard';
import SaaSAdminDashboard from './components/SaaSAdminDashboard';
import Setup from './components/Setup';
import { UserRole } from './types';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [isSetupMode, setIsSetupMode] = React.useState(false);

  if (isSetupMode) {
    return <Setup onComplete={() => setIsSetupMode(false)} />;
  }

  if (!user) {
    return (
      <div className="relative">
        <Login />
        <button 
          onClick={() => setIsSetupMode(true)}
          className="fixed bottom-4 right-4 text-[10px] text-slate-300 hover:text-slate-500 font-bold uppercase tracking-widest transition-colors"
        >
          Setup Inicial
        </button>
      </div>
    );
  }

  switch (user.role) {
    case UserRole.SuperAdmin:
      return <SaaSAdminDashboard />;
    case UserRole.OfficeAdmin:
    case UserRole.Accountant:
      return <OfficeDashboard />;
    case UserRole.Client:
      return <ClientDashboard />;
    default:
      return <Login />;
  }
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AppContent />
      </div>
    </AuthProvider>
  );
};

export default App;
