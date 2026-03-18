import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, IndianRupee, Calendar, User, FileText, Save } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface RecordPaymentModalProps {
  onClose: () => void;
}

export default function RecordPaymentModal({ onClose }: RecordPaymentModalProps) {
  const { residents, recordPayment } = useAppContext();
  
  const [formData, setFormData] = useState({
    residentId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'UPI' as 'UPI' | 'Cash' | 'Bank Transfer',
    reference: ''
  });

  // Only show residents with pending payments
  const pendingResidents = residents.filter(r => r.paymentStatus !== 'Paid');
  
  const selectedResident = residents.find(r => r.id === formData.residentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.residentId || !formData.amount) return;

    recordPayment(
      formData.residentId,
      Number(formData.amount),
      formData.method,
      formData.reference
    );
    
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-white w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-800">Record Payment</h2>
          <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="record-payment-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Resident Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Resident *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select 
                  required
                  value={formData.residentId}
                  onChange={e => {
                    const resident = residents.find(r => r.id === e.target.value);
                    setFormData({
                      ...formData, 
                      residentId: e.target.value,
                      amount: resident?.rentAmount?.toString() || ''
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium appearance-none"
                >
                  <option value="">Select Resident</option>
                  {pendingResidents.map(resident => (
                    <option key={resident.id} value={resident.id}>
                      {resident.name} (Due: ₹{resident.rentAmount})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount *</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="number" 
                    required
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment Method *</label>
              <div className="grid grid-cols-3 gap-3">
                {['UPI', 'Cash', 'Bank Transfer'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFormData({...formData, method: method as any})}
                    className={`py-3 px-2 rounded-xl text-sm font-bold border transition-all ${
                      formData.method === method 
                        ? 'bg-blue-50 border-blue-600 text-blue-600' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reference / Notes</label>
              <div className="relative">
                <FileText className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
                <textarea 
                  value={formData.reference}
                  onChange={e => setFormData({...formData, reference: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium min-h-[100px] resize-none"
                  placeholder="Transaction ID, notes, etc."
                />
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white pb-safe">
          <button 
            type="submit"
            form="record-payment-form"
            disabled={!formData.residentId || !formData.amount}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            Record Payment
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
