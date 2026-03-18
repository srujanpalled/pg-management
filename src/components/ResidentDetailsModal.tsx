import { motion } from 'motion/react';
import { X, Phone, IndianRupee, MapPin, Calendar, MessageCircle, Copy, AlertCircle, AlertTriangle } from 'lucide-react';
import { Tenant, Room } from '../types';
import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Props {
  resident: Tenant;
  room?: Room;
  onClose: () => void;
}

export default function ResidentDetailsModal({ resident, room, onClose }: Props) {
  const { fetchData } = useAppContext();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use the backend dueAmount, fallback to rentAmount if dueAmount is undefined
  const dueAmount = resident.dueAmount !== undefined ? resident.dueAmount : resident.rentAmount;

  const handleWhatsAppReminder = () => {
    const phone = resident.phone.replace(/[^0-9]/g, ''); // strip non-digits
    const msg = `Reminder: Your PG rent is due. Please pay as soon as possible.
Resident: ${resident.name}
Room: ${room?.number || 'N/A'}
Due Amount: ₹${dueAmount}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleRemoveResident = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/tenants/${resident.id}`);
      await fetchData(); // refresh data
      toast.success(`${resident.name} removed successfully.`);
      onClose();
    } catch (err) {
      console.error('Failed to remove resident', err);
      toast.error('Failed to remove resident.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-0"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {showConfirmDelete ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Remove Resident?</h3>
            <p className="text-slate-500 mb-6 px-4">This will permanently remove {resident.name} and free up their bed. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleRemoveResident}
                className="flex-1 py-3 text-white font-bold bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors flex items-center justify-center"
                disabled={isDeleting}
              >
                {isDeleting ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6 pt-2">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl shrink-0 ${resident.color}`}>
                {resident.initials}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 pr-8">{resident.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    resident.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {resident.paymentStatus}
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    Room {room?.number || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Phone Number</p>
                  <p className="text-sm font-bold text-slate-700">{resident.phone}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Check-in Date</p>
                  <p className="text-sm font-bold text-slate-700">{resident.checkInDate}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                  <IndianRupee className="w-5 h-5 text-rose-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Due Amount</p>
                  <p className="text-sm font-bold text-rose-600">₹{dueAmount}</p>
                </div>
                {dueAmount > 0 && (
                  <button 
                    onClick={handleWhatsAppReminder}
                    className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                    title="Send WhatsApp Reminder"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmDelete(true)}
                className="flex-1 py-3.5 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors flex justify-center items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Remove Resident
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
