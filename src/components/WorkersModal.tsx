import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, User, MessageCircle, Wrench, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
}

export default function WorkersModal({ onClose }: Props) {
  const { workers, fetchData } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', phone: '', workType: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleWhatsApp = (phone: string, name: string, workType: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msg = `Hi ${name}, we have a new ${workType} maintenance request at the PG. Please let us know when you can attend to it.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleAddWorker = async () => {
    try {
      if (!newWorker.name || !newWorker.phone || !newWorker.workType) return;
      setIsSaving(true);
      await api.post('/workers', newWorker);
      await fetchData();
      setIsAdding(false);
      setNewWorker({ name: '', phone: '', workType: '' });
      toast.success('Worker added successfully!');
    } catch (err) {
      console.error('Failed to add worker', err);
      toast.error('Failed to add worker.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorker = async (id: string) => {
    try {
      await api.delete(`/workers/${id}`);
      await fetchData();
      toast.success('Worker removed.');
    } catch (err) {
      console.error('Failed to delete worker', err);
      toast.error('Failed to remove worker.');
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
        className="bg-slate-50 w-full max-w-md rounded-[2rem] flex flex-col shadow-2xl overflow-hidden max-h-[85vh]"
      >
        <div className="bg-white px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              Worker Contacts
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Maintenance staff directory</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-4 overflow-hidden"
              >
                <h3 className="text-sm font-bold text-slate-800 mb-3">Add New Worker</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newWorker.name}
                    onChange={e => setNewWorker({ ...newWorker, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={newWorker.phone}
                    onChange={e => setNewWorker({ ...newWorker, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Work Type (e.g. Plumber, Electrician)"
                    value={newWorker.workType}
                    onChange={e => setNewWorker({ ...newWorker, workType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setIsAdding(false)}
                      className="flex-1 py-2 text-slate-600 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddWorker}
                      disabled={isSaving}
                      className="flex-1 py-2 text-white font-bold bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors text-sm"
                    >
                      {isSaving ? 'Saving...' : 'Save Worker'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {workers.map((worker) => (
            <div key={worker.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">{worker.name}</h3>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mt-0.5">{worker.workType}</p>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3" /> {worker.phone}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleWhatsApp(worker.phone, worker.name, worker.workType)}
                  className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteWorker(worker.id)}
                  className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          ))}

          {workers.length === 0 && !isAdding && (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 border-dashed">
              <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No workers added yet.</p>
            </div>
          )}
        </div>

        <div className="bg-white p-4 border-t border-slate-100 shrink-0">
          <button
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-200"
          >
            <Plus className="w-5 h-5" />
            Add Worker
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
