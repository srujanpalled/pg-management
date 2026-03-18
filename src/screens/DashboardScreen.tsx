import { motion } from 'motion/react';
import { Users, Home, IndianRupee, Plus, ArrowRight, CheckCircle2, UserPlus, Wrench, Briefcase } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import WorkersModal from '../components/WorkersModal';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface DashboardProps {
  onNavigate: (screen: string) => void;
  key?: string;
}

export default function DashboardScreen({ onNavigate }: DashboardProps) {
  const { rooms, residents, transactions, complaints, fetchData } = useAppContext();
  const [showWorkers, setShowWorkers] = useState(false);
  const [updatingComplaintId, setUpdatingComplaintId] = useState<string | null>(null);

  const handleResolveComplaint = async (id: string) => {
    try {
      setUpdatingComplaintId(id);
      await api.put(`/maintenance/${id}`, { status: 'Resolved' });
      await fetchData();
      toast.success('Complaint marked as resolved');
    } catch (err) {
      console.error('Failed to resolve complaint', err);
      toast.error('Failed to resolve complaint');
    } finally {
      setUpdatingComplaintId(null);
    }
  };

  // Calculate metrics
  const totalBeds = rooms.reduce((acc, room) => acc + room.beds.length, 0);
  const occupiedBeds = residents.length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const vacantBeds = totalBeds - occupiedBeds;

  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const monthlyCollection = transactions
    .filter(tx => tx.type === 'Income' && tx.date.startsWith(currentMonth))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const pendingResidents = residents.filter(r => r.paymentStatus !== 'Paid');
  const totalPendingAmount = pendingResidents.reduce((sum, r) => sum + r.rentAmount, 0);

  const activeComplaints = complaints.filter(c => c.status !== 'Resolved').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.95 }}
      className="pb-6"
    >
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
        
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PG Manager</h1>
            <p className="text-blue-100 text-sm font-medium mt-1">Welcome back, Admin</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
            <span className="font-bold text-lg">AD</span>
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 flex justify-between items-center border border-white/20 shadow-sm relative z-10">
          <div className="text-center flex-1">
            <p className="text-xs uppercase tracking-wider text-blue-100 font-semibold mb-1">Collection</p>
            <p className="text-2xl font-bold">₹{monthlyCollection.toLocaleString()}</p>
          </div>
          <div className="w-px h-10 bg-white/20"></div>
          <div className="text-center flex-1">
            <p className="text-xs uppercase tracking-wider text-blue-100 font-semibold mb-1">Occupancy</p>
            <p className="text-2xl font-bold">{occupancyRate}%</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-20 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div variants={itemVariants} onClick={() => onNavigate('residents')} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Residents</p>
            <p className="text-3xl font-black text-slate-800">{occupiedBeds}</p>
          </motion.div>
          
          <motion.div variants={itemVariants} onClick={() => onNavigate('rooms')} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3">
              <Home className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Vacant Beds</p>
            <p className="text-3xl font-black text-slate-800">{vacantBeds}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 col-span-2 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('payments')}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pending Payments</p>
                <p className="text-xl font-bold text-slate-800">{pendingResidents.length} Residents</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-rose-600 font-bold text-lg">₹{totalPendingAmount.toLocaleString()}</p>
              <div className="flex items-center text-blue-600 text-xs font-bold mt-1 justify-end">
                View List <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('residents')}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-700">Add Resident</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('payments')}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-700">Collect Rent</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowWorkers(true)}
              className="col-span-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-700">Workers Directory</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Active Complaints */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Active Complaints</h2>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{activeComplaints} Open</span>
          </div>
          <div className="space-y-3">
            {complaints.filter(c => c.status !== 'Resolved').map((complaint) => {
              const resident = residents.find(r => r.id === complaint.tenantId);
              const room = rooms.find(r => r.id === complaint.roomId);
              return (
                <div key={complaint.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{complaint.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{complaint.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-semibold text-slate-400">Room {room?.number || 'N/A'}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-xs font-semibold text-slate-400">{resident?.name || 'Unknown'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleResolveComplaint(complaint.id)}
                    disabled={updatingComplaintId === complaint.id}
                    className="self-center shrink-0 p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1.5 hidden sm:flex disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold">Mark Done</span>
                  </button>
                </div>
              );
            })}
            {activeComplaints === 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="font-bold text-slate-700">All caught up!</p>
                <p className="text-sm text-slate-500 mt-1">No active complaints right now.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showWorkers && <WorkersModal onClose={() => setShowWorkers(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
