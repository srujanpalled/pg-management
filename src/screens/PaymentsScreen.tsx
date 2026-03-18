import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import RecordPaymentModal from '../components/RecordPaymentModal';

export default function PaymentsScreen() {
  const { residents, transactions, rooms } = useAppContext();
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Payments');

  // Calculate metrics
  const totalCollected = transactions
    .filter(t => t.type === 'Payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPending = residents
    .filter(r => r.paymentStatus !== 'Paid')
    .reduce((sum, r) => sum + r.rentAmount, 0);

  const pendingResidents = residents.filter(r => r.paymentStatus !== 'Paid');

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    if (activeFilter === 'All Payments') return true;
    if (activeFilter === 'Paid') return t.type === 'Payment';
    if (activeFilter === 'Unpaid') return t.type !== 'Payment'; // Assuming other types are not payments
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-full bg-slate-50 pb-24"
    >
      <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-20 border-b border-slate-100 px-6 pt-12 pb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payments</h1>
          <button className="text-blue-600 font-bold text-sm">History</button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-600 p-5 rounded-3xl text-white shadow-lg shadow-blue-200 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <p className="text-[10px] opacity-80 mb-2 uppercase tracking-widest font-bold">Collected</p>
            <p className="text-2xl font-black">₹{totalCollected.toLocaleString()}</p>
          </div>
          <div className="bg-rose-500 p-5 rounded-3xl text-white shadow-lg shadow-rose-200 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <p className="text-[10px] opacity-80 mb-2 uppercase tracking-widest font-bold">Pending</p>
            <p className="text-2xl font-black">₹{totalPending.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
          {['All Payments', 'Paid', 'Unpaid', 'Overdue'].map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                activeFilter === filter 
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-200' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Pending Action */}
        {pendingResidents.length > 0 && (
          <section>
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Pending Action</h2>
            <div className="space-y-4">
              {pendingResidents.map(resident => {
                const room = rooms.find(r => r.id === resident.roomId);
                return (
                  <div key={resident.id} className="bg-white p-5 rounded-3xl shadow-sm border border-rose-100 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${resident.color}`}>
                        {resident.initials}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-lg">{resident.name}</p>
                        <p className="text-xs text-rose-500 font-semibold mt-0.5">
                          {resident.paymentStatus === 'Overdue' ? 'Overdue' : 'Due'} • Room {room?.number || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 text-lg">₹{resident.rentAmount.toLocaleString()}</p>
                      <button className="text-xs text-blue-600 font-bold underline mt-1">Remind</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent Transactions */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Recent Transactions</h2>
            <button className="text-xs text-blue-600 font-bold">View All</button>
          </div>
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx, i) => {
                const resident = residents.find(r => r.id === tx.residentId);
                const room = rooms.find(r => r.id === resident?.roomId);
                const isPayment = tx.type === 'Payment';
                
                return (
                  <div key={tx.id} className={`p-5 flex items-center justify-between ${i !== filteredTransactions.length - 1 ? 'border-b border-slate-50' : ''}`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${isPayment ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                        {isPayment ? (
                          <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-rose-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-800">{resident?.name || 'Unknown'}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • Room {room?.number || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-base font-black ${isPayment ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isPayment ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium italic mt-0.5">{tx.method}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500 font-medium">
                No transactions found.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Floating Action Button at Bottom */}
      <div className="sticky bottom-6 left-0 right-0 px-6 z-30 pointer-events-none mt-6">
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsRecordingPayment(true)}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-xl shadow-blue-200 pointer-events-auto"
        >
          <Plus className="w-5 h-5" strokeWidth={3} />
          <span className="text-lg">Record Payment</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isRecordingPayment && (
          <RecordPaymentModal onClose={() => setIsRecordingPayment(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
