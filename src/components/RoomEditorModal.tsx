import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Check, Save, BedDouble, AlertTriangle } from 'lucide-react';
import { Room } from '../types';

interface RoomEditorModalProps {
  room?: Room | null;
  onClose: () => void;
  onSave: (room: Partial<Room>) => void;
  onDelete?: (roomId: string) => void;
}

const FACILITIES_LIST = ['Attached Bathroom', 'AC', 'Non-AC', 'WiFi', 'Cupboard', 'Balcony', 'Study Table'];

export default function RoomEditorModal({ room, onClose, onSave, onDelete }: RoomEditorModalProps) {
  const isEditing = !!room;
  
  const [formData, setFormData] = useState<Partial<Room>>({
    number: '',
    floor: '1st Floor',
    type: 'Single',
    beds: [{ id: `b${Date.now()}`, number: 1, status: 'Available' }],
    rentPerBed: 5000,
    securityDeposit: 10000,
    maintenanceCharges: 500,
    facilities: ['WiFi', 'Cupboard'],
    status: 'Active',
    tenants: [],
    reminders: [],
    ...room
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => {
      onSave(formData as Room);
      setShowSuccess(false);
    }, 1000);
  };

  const toggleFacility = (facility: string) => {
    const current = formData.facilities || [];
    if (current.includes(facility)) {
      setFormData({ ...formData, facilities: current.filter(f => f !== facility) });
    } else {
      setFormData({ ...formData, facilities: [...current, facility] });
    }
  };

  const addBed = () => {
    const newBeds = [...(formData.beds || [])];
    newBeds.push({
      id: `b${Date.now()}`,
      number: newBeds.length + 1,
      status: 'Available'
    });
    setFormData({ ...formData, beds: newBeds });
  };

  const removeBed = (id: string) => {
    setFormData({
      ...formData,
      beds: (formData.beds || []).filter(b => b.id !== id)
    });
  };

  const updateBedLabel = (id: string, label: string) => {
    setFormData({
      ...formData,
      beds: (formData.beds || []).map(b => b.id === id ? { ...b, label } : b)
    });
  };

  const handleTypeChange = (type: string) => {
    let targetBeds = formData.beds?.length || 1;
    if (type === 'Single') targetBeds = 1;
    if (type === 'Double') targetBeds = 2;
    if (type === 'Triple') targetBeds = 3;

    let newBeds = [...(formData.beds || [])];
    
    // Add beds if needed
    while (newBeds.length < targetBeds) {
      newBeds.push({
        id: `b${Date.now()}_${newBeds.length}`,
        number: newBeds.length + 1,
        status: 'Available'
      });
    }
    
    // Remove beds if needed (only if they are available)
    if (newBeds.length > targetBeds) {
      const availableBeds = newBeds.filter(b => b.status === 'Available');
      const occupiedBeds = newBeds.filter(b => b.status !== 'Available');
      
      // Keep all occupied beds, and only enough available beds to reach target
      const bedsToKeep = targetBeds - occupiedBeds.length;
      if (bedsToKeep > 0) {
        newBeds = [...occupiedBeds, ...availableBeds.slice(0, bedsToKeep)];
      } else {
        newBeds = occupiedBeds; // Can't remove occupied beds, so we might end up with more than target
      }
      
      // Re-number beds
      newBeds.forEach((bed, idx) => {
        bed.number = idx + 1;
      });
    }

    setFormData({ ...formData, type: type as any, beds: newBeds });
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-[60] bg-slate-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 flex items-center justify-between border-b border-slate-100 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-800" />
          </button>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {isEditing ? 'Edit Room' : 'Add New Room'}
          </h2>
        </div>
        {isEditing && (
          <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-full transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32 no-scrollbar">
        {/* Basic Details */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Basic Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Room Number</label>
              <input 
                type="text" 
                value={formData.number}
                onChange={e => setFormData({...formData, number: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 101"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Floor</label>
              <select 
                value={formData.floor}
                onChange={e => setFormData({...formData, floor: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              >
                <option>Ground Floor</option>
                <option>1st Floor</option>
                <option>2nd Floor</option>
                <option>3rd Floor</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Room Type</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {['Single', 'Double', 'Triple', 'Custom'].map(type => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                    formData.type === type ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Pricing (Per Bed)</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                <span className="font-bold text-slate-400">₹</span>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Rent</label>
                <input 
                  type="number" 
                  value={formData.rentPerBed}
                  onChange={e => setFormData({...formData, rentPerBed: Number(e.target.value)})}
                  className="w-full bg-transparent text-lg font-black text-slate-800 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deposit</label>
                <input 
                  type="number" 
                  value={formData.securityDeposit}
                  onChange={e => setFormData({...formData, securityDeposit: Number(e.target.value)})}
                  className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none"
                />
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Maintenance</label>
                <input 
                  type="number" 
                  value={formData.maintenanceCharges}
                  onChange={e => setFormData({...formData, maintenanceCharges: Number(e.target.value)})}
                  className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Facilities */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Facilities</h3>
          <div className="flex flex-wrap gap-2">
            {FACILITIES_LIST.map(facility => {
              const isSelected = formData.facilities?.includes(facility);
              return (
                <button
                  key={facility}
                  onClick={() => toggleFacility(facility)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    isSelected ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {facility}
                </button>
              );
            })}
          </div>
        </section>

        {/* Bed Management */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Bed Management</h3>
            <button onClick={addBed} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add Bed
            </button>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {formData.beds?.map((bed, index) => {
                const tenant = formData.tenants?.find(t => t.id === bed.tenantId);
                return (
                  <motion.div 
                    key={bed.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between overflow-hidden"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                        <BedDouble className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="text"
                            value={bed.label || `Bed ${bed.number}`}
                            onChange={(e) => updateBedLabel(bed.id, e.target.value)}
                            className="font-bold text-slate-800 text-sm bg-transparent outline-none border-b border-transparent focus:border-blue-500 transition-colors w-24"
                          />
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            bed.status === 'Occupied' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {bed.status}
                          </span>
                        </div>
                        {tenant && <p className="text-xs text-slate-500 font-medium mt-0.5">{tenant.name}</p>}
                      </div>
                    </div>
                    {bed.status !== 'Occupied' && (
                      <button onClick={() => removeBed(bed.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>

        {/* Room Status */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Room Status</h3>
          <div className="grid grid-cols-3 gap-2">
            {['Active', 'Maintenance', 'Temporarily Closed'].map(status => (
              <button
                key={status}
                onClick={() => setFormData({...formData, status: status as any})}
                className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                  formData.status === status 
                    ? status === 'Active' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' 
                      : status === 'Maintenance' ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                      : 'bg-rose-500 text-white shadow-md shadow-rose-200'
                    : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                {status === 'Temporarily Closed' ? 'Closed' : status}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-[2] py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 flex items-center justify-center gap-2 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {showSuccess ? (
                <motion.div key="success" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-2">
                  <Check className="w-5 h-5" /> Saved
                </motion.div>
              ) : (
                <motion.div key="save" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-2">
                  <Save className="w-5 h-5" /> Save Room
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Room?</h3>
              <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete Room {formData.number}? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button onClick={() => {
                  if (onDelete && room?.id) onDelete(room.id);
                  setShowDeleteConfirm(false);
                  onClose();
                }} className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-200 hover:bg-rose-700 transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
