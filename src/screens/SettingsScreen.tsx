import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Bell, Shield, LogOut, ChevronRight, Plus, Home } from 'lucide-react';
import RoomEditorModal from '../components/RoomEditorModal';
import { useAppContext } from '../context/AppContext';
import { Room } from '../types';

export default function SettingsScreen() {
  const { rooms, setRooms } = useAppContext();
  const [isAddingRoom, setIsAddingRoom] = useState(false);

  const handleSaveRoom = (roomData: Partial<Room>) => {
    const newRoom: Room = {
      ...roomData,
      id: Math.random().toString(36).substr(2, 9),
      tenants: [],
      reminders: [],
    } as Room;
    setRooms([...rooms, newRoom]);
    setIsAddingRoom(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-full bg-slate-50 relative"
    >
      <div className="bg-white sticky top-0 z-20 border-b border-slate-100 px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
      </div>

      <div className="p-6 space-y-6 pb-24">
        {/* Profile Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0">
            <span className="text-2xl font-black text-blue-600">AD</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800">Admin User</h2>
            <p className="text-sm text-slate-500 font-medium">admin@pgmanager.com</p>
          </div>
          <button className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Property Management */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider px-2">Property Management</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div 
              onClick={() => setIsAddingRoom(true)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <Home className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-700">Add New Room</span>
              </div>
              <Plus className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Settings Options */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider px-2">App Settings</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <User className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-700">Account Details</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>
            <div className="p-4 flex items-center justify-between border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                  <Bell className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-700">Notifications</span>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-700">Privacy & Security</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>
          </div>
        </div>

        <button className="w-full bg-rose-50 text-rose-600 font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 hover:bg-rose-100 transition-colors mt-8">
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>

      <AnimatePresence>
        {isAddingRoom && (
          <RoomEditorModal
            onClose={() => setIsAddingRoom(false)}
            onSave={handleSaveRoom}
            onDelete={() => {}}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
