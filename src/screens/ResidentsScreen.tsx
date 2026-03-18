import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, Plus, IndianRupee } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import AddResidentModal from '../components/AddResidentModal';

export default function ResidentsScreen() {
  const { residents, rooms } = useAppContext();
  const [activeTab, setActiveTab] = useState('All');
  const [isAddingResident, setIsAddingResident] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = residents.filter(r => {
    const matchesTab = activeTab === 'All' ? true : r.paymentStatus === activeTab;
    const room = rooms.find(room => room.id === r.roomId);
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (room && room.number.includes(searchQuery));
    return matchesTab && matchesSearch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-full bg-slate-50 relative pb-24"
    >
      <div className="bg-blue-600 px-6 pt-12 pb-6 text-white sticky top-0 z-20 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Residents</h1>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-blue-600"></span>
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or room number..." 
            className="w-full bg-white/15 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
          />
        </div>
      </div>

      <div className="flex border-b border-slate-200 bg-white sticky top-[132px] z-10">
        {['All', 'Pending Payment', 'Paid'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-sm font-bold relative transition-colors ${activeTab === tab ? 'text-blue-600' : 'text-slate-500'}`}
          >
            {tab === 'Pending Payment' ? 'Pending' : tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTab" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" 
              />
            )}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-4">
        {filteredData.map((resident, index) => {
          const room = rooms.find(r => r.id === resident.roomId);
          return (
            <motion.div 
              key={resident.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-4 flex items-center shadow-sm border border-slate-100"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shrink-0 ${resident.color}`}>
                {resident.initials}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-bold text-slate-800 text-lg">{resident.name}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
                  Room {room?.number || 'N/A'} • {room?.type || 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  resident.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 
                  resident.paymentStatus === 'Pending Payment' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {resident.paymentStatus === 'Pending Payment' ? 'Pending' : resident.paymentStatus}
                </span>
                <p className={`text-xs font-bold mt-2 flex items-center justify-end gap-1 ${resident.paymentStatus !== 'Paid' ? 'text-rose-600' : 'text-slate-400'}`}>
                  {resident.paymentStatus !== 'Paid' ? (
                    <>
                      <IndianRupee className="w-3 h-3" />
                      {resident.rentAmount}
                    </>
                  ) : (
                    `Due: ${resident.rentDueDate}`
                  )}
                </p>
              </div>
            </motion.div>
          );
        })}
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 font-medium">No residents found.</p>
          </div>
        )}
      </div>

      <div className="sticky bottom-6 flex justify-end px-6 pointer-events-none z-30 mt-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddingResident(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200 flex items-center justify-center pointer-events-auto"
        >
          <Plus className="w-6 h-6" strokeWidth={3} />
        </motion.button>
      </div>

      <AnimatePresence>
        {isAddingResident && (
          <AddResidentModal onClose={() => setIsAddingResident(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
