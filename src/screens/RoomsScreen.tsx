import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Plus, BedDouble, User, Phone, Calendar, IndianRupee, AlertCircle, Wrench, CheckCircle2, ChevronDown, ChevronUp, BellRing } from 'lucide-react';
import RoomEditorModal from '../components/RoomEditorModal';
import { useAppContext } from '../context/AppContext';
import { Room, BedStatus, Tenant, PaymentStatus, Reminder } from '../types';
import toast from 'react-hot-toast';

export default function RoomsScreen() {
  const { rooms, setRooms, residents } = useAppContext();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const groupedRooms = rooms.reduce((acc, room) => {
    if (!acc[room.floor]) acc[room.floor] = [];
    acc[room.floor].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  const handleSaveRoom = (roomData: Partial<Room>) => {
    if (editingRoom) {
      setRooms(rooms.map(r => r.id === editingRoom.id ? { ...r, ...roomData } as Room : r));
      if (selectedRoom?.id === editingRoom.id) {
        setSelectedRoom({ ...selectedRoom, ...roomData } as Room);
      }
    } else {
      const newRoom: Room = {
        ...roomData,
        id: Math.random().toString(36).substr(2, 9),
        reminders: [],
      } as Room;
      setRooms([...rooms, newRoom]);
    }
    setEditingRoom(null);
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms(rooms.filter(r => r.id !== roomId));
    setEditingRoom(null);
    if (selectedRoom?.id === roomId) {
      setSelectedRoom(null);
    }
  };

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'Available': return 'bg-emerald-100 text-emerald-700';
      case 'Active': return 'bg-emerald-100 text-emerald-700';
      case 'Occupied': return 'bg-rose-100 text-rose-700';
      case 'Maintenance': return 'bg-amber-100 text-amber-700';
      case 'Temporarily Closed': return 'bg-slate-200 text-slate-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-full bg-slate-50 pb-24 relative"
    >
      <div className="bg-white sticky top-0 z-20 border-b border-slate-100">
        <div className="px-6 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6 text-slate-800" />
            </button>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Room Management</h1>
          </div>
        </div>

        <div className="flex overflow-x-auto px-6 pb-4 gap-4 no-scrollbar">
          <div className="shrink-0 bg-white border border-slate-200 rounded-2xl p-4 min-w-[100px] text-center shadow-sm">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Total</p>
            <p className="text-2xl font-black text-slate-800">{rooms.length}</p>
          </div>
          <div className="shrink-0 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 min-w-[100px] text-center shadow-sm">
            <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider mb-1">Available</p>
            <p className="text-2xl font-black text-emerald-700">{rooms.filter(r => r.status === 'Available').length}</p>
          </div>
          <div className="shrink-0 bg-rose-50 border border-rose-100 rounded-2xl p-4 min-w-[100px] text-center shadow-sm">
            <p className="text-[10px] text-rose-600 uppercase font-bold tracking-wider mb-1">Occupied</p>
            <p className="text-2xl font-black text-rose-700">{rooms.filter(r => r.status === 'Occupied').length}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {Object.entries(groupedRooms).map(([floor, floorRooms]) => (
          <section key={floor}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                {floor} <span className="text-sm font-medium text-slate-400 ml-2">({(floorRooms as Room[])[0]?.type} Sharing)</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(floorRooms as Room[]).map((room) => {
                const roomResidents = residents.filter(r => r.roomId === room.id);
                return (
                  <motion.div 
                    key={room.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRoom(room)}
                    className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-3xl font-black text-slate-800">{room.number}</span>
                      <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${getStatusColor(room.status)}`}>
                        {room.status}
                      </span>
                    </div>
                    <div>
                      {roomResidents.length > 0 ? (
                        <>
                          <p className="text-sm text-slate-700 font-bold truncate">{roomResidents[0].name}</p>
                          {roomResidents.length > 1 && <p className="text-[11px] text-slate-400 font-medium mt-1">+{roomResidents.length - 1} more</p>}
                          {room.beds.filter(b => b.status === 'Available').length > 0 && (
                            <p className="text-[11px] text-emerald-600 font-bold mt-1">{room.beds.filter(b => b.status === 'Available').length} Slot Left</p>
                          )}
                        </>
                      ) : room.status === 'Maintenance' ? (
                        <>
                          <p className="text-sm text-slate-700 font-bold">Under Maintenance</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-slate-400 font-medium italic mb-3">{room.beds.length} Slots Empty</p>
                          <button className="w-full py-2 text-xs bg-blue-50 text-blue-600 rounded-xl font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors">Assign</button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <AnimatePresence>
        {selectedRoom && (
          <RoomDetailsModal 
            room={selectedRoom} 
            onClose={() => setSelectedRoom(null)} 
            onEdit={() => setEditingRoom(selectedRoom)}
          />
        )}
        {editingRoom && (
          <RoomEditorModal
            room={editingRoom}
            onClose={() => setEditingRoom(null)}
            onSave={handleSaveRoom}
            onDelete={handleDeleteRoom}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RoomDetailsModal({ room, onClose, onEdit }: { room: Room; onClose: () => void; onEdit: () => void }) {
  const { residents, fetchData } = useAppContext();
  const [expandedTenantId, setExpandedTenantId] = useState<string | null>(null);
  const [isAddingBed, setIsAddingBed] = useState(false);

  const handleAddBed = async () => {
    try {
      setIsAddingBed(true);
      const api = (await import('../utils/api')).default;
      await api.put(`/rooms/${room.id}/add-bed`);
      await fetchData(); // Refresh data to instantly reflect
      toast.success(`Bed added to Room ${room.number}`);
    } catch (err) {
      console.error('Failed to add bed', err);
      toast.error('Failed to add bed. Please try again.');
    } finally {
      setIsAddingBed(false);
    }
  };

  const roomResidents = residents.filter(r => r.roomId === room.id);
  const availableBeds = room.beds.filter(b => b.status === 'Available').length;
  const occupiedBeds = room.beds.filter(b => b.status === 'Occupied').length;

  const getBedStatusColor = (status: BedStatus) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500';
      case 'Occupied': return 'bg-rose-500';
      case 'Reserved': return 'bg-amber-500';
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Paid': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Paid</span>;
      case 'Pending Payment': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Pending</span>;
      case 'Overdue': return <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Overdue</span>;
    }
  };

  const getReminderIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'maintenance': return <Wrench className="w-5 h-5 text-amber-600" />;
      case 'repair': return <Wrench className="w-5 h-5 text-amber-600" />;
      case 'rent': return <AlertCircle className="w-5 h-5 text-rose-600" />;
      case 'vacancy': return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-slate-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 flex items-center justify-between border-b border-slate-100 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-800" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Room {room.number}</h2>
            <p className="text-xs text-slate-500 font-medium">{room.floor} • {room.type} Sharing</p>
          </div>
        </div>
        <button 
          onClick={onEdit}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
        >
          Edit
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32 no-scrollbar">
        {/* Room Information Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Total Beds</p>
            <p className="text-2xl font-black text-slate-800">{room.beds.length}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm text-center">
            <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider mb-1">Available</p>
            <p className="text-2xl font-black text-emerald-700">{availableBeds}</p>
          </div>
          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 shadow-sm text-center">
            <p className="text-[10px] text-rose-600 uppercase font-bold tracking-wider mb-1">Occupied</p>
            <p className="text-2xl font-black text-rose-700">{occupiedBeds}</p>
          </div>
        </motion.div>

        {/* Reminders Section */}
        {room.reminders.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-500" />
              Alerts & Reminders
            </h3>
            <div className="space-y-2">
              {room.reminders.map((reminder, idx) => (
                <motion.div 
                  key={reminder.id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (idx * 0.1) }}
                  className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3"
                >
                  <div className={`p-2 rounded-lg shrink-0 ${
                    reminder.type === 'rent' ? 'bg-rose-50' : 
                    reminder.type === 'vacancy' ? 'bg-emerald-50' : 'bg-amber-50'
                  }`}>
                    {getReminderIcon(reminder.type)}
                  </div>
                  <p className="text-sm text-slate-700 font-medium leading-snug pt-1">{reminder.message}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bed Allocation Panel */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800">Bed Allocation</h3>
            <button 
              onClick={handleAddBed}
              disabled={isAddingBed}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> {isAddingBed ? 'Adding...' : 'Add Bed'}
            </button>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-2">
            {room.beds.map((bed, idx) => {
              const tenant = roomResidents.find(r => r.bedId === bed.id);
              return (
                <div key={bed.id} className={`p-4 flex items-center justify-between ${idx !== room.beds.length - 1 ? 'border-b border-slate-50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                        <BedDouble className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${getBedStatusColor(bed.status)}`} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{bed.label || `Bed ${bed.number}`}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {bed.status} {tenant ? `• ${tenant.name}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {bed.status === 'Available' ? (
                      <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">Allocate Bed</button>
                    ) : (
                      <>
                        <button className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors">Change Bed</button>
                        {tenant && (
                          <button className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors">Remove Tenant</button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Tenant Details */}
        {roomResidents.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h3 className="text-sm font-bold text-slate-800 mb-3">Current Tenants</h3>
            <div className="space-y-3">
              {roomResidents.map((tenant) => {
                const isExpanded = expandedTenantId === tenant.id;
                const bed = room.beds.find(b => b.id === tenant.bedId);
                return (
                  <motion.div 
                    key={tenant.id}
                    layout
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                  >
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => setExpandedTenantId(isExpanded ? null : tenant.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${tenant.color}`}>
                          {tenant.initials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{tenant.name}</p>
                          <p className="text-xs text-slate-500 font-medium">Bed {bed?.number || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getPaymentBadge(tenant.paymentStatus)}
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 pt-2 border-t border-slate-50 bg-slate-50/50"
                        >
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="flex items-start gap-2">
                              <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                                <p className="text-sm font-semibold text-slate-700">{tenant.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-in</p>
                                <p className="text-sm font-semibold text-slate-700">{tenant.checkInDate}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <IndianRupee className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rent Due</p>
                                <p className="text-sm font-semibold text-slate-700">{tenant.rentDueDate}</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <button className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">View Profile</button>
                            <button className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors">Remove</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Fixed Bottom Quick Actions */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="grid grid-cols-2 gap-3">
          <motion.button whileTap={{ scale: 0.98 }} className="py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 flex items-center justify-center gap-2">
            <User className="w-4 h-4" /> Add Tenant
          </motion.button>
          <motion.button whileTap={{ scale: 0.98 }} className="py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50">
            <Wrench className="w-4 h-4" /> Maintenance
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
