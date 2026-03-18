import { Home, Building2, Users, IndianRupee, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export default function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'rooms', icon: Building2, label: 'Rooms' },
    { id: 'residents', icon: Users, label: 'Residents' },
    { id: 'payments', icon: IndianRupee, label: 'Rent' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-full bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 pb-safe shrink-0">
      {navItems.map((item) => {
        const isActive = currentScreen === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 relative ${
              isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-2 -right-2 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white"
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
              )}
            </div>
            <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
