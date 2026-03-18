import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import DashboardScreen from './screens/DashboardScreen';
import ResidentsScreen from './screens/ResidentsScreen';
import RoomsScreen from './screens/RoomsScreen';
import PaymentsScreen from './screens/PaymentsScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import BottomNav from './components/BottomNav';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const { isAuthenticated } = useAuth();



  return (
    <div className="max-w-md mx-auto h-screen bg-slate-50 relative overflow-hidden flex flex-col shadow-2xl sm:border-x sm:border-slate-200">
      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        <AnimatePresence mode="wait">
          {currentScreen === 'dashboard' && <DashboardScreen key="dashboard" onNavigate={setCurrentScreen} />}
          {currentScreen === 'residents' && <ResidentsScreen key="residents" />}
          {currentScreen === 'rooms' && <RoomsScreen key="rooms" />}
          {currentScreen === 'payments' && <PaymentsScreen key="payments" />}
          {currentScreen === 'settings' && <SettingsScreen key="settings" />}
        </AnimatePresence>
      </div>
      <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </AuthProvider>
  );
}
