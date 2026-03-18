import { Room } from '../types';

export const mockRooms: Room[] = [
  {
    id: '1', number: '101', floor: '1st Floor', type: 'Single', status: 'Occupied',
    beds: [{ id: 'b1', number: 1, status: 'Occupied', tenantId: 't1' }],
    reminders: [{ id: 'r1', type: 'rent', message: 'Rent due in 3 days for Rahul Sharma' }],
    rentPerBed: 8000, securityDeposit: 16000, maintenanceCharges: 500,
    facilities: ['Attached Bathroom', 'AC', 'WiFi', 'Cupboard']
  },
  {
    id: '2', number: '102', floor: '1st Floor', type: 'Single', status: 'Vacant',
    beds: [{ id: 'b2', number: 1, status: 'Available' }],
    reminders: [{ id: 'r2', type: 'vacancy', message: 'Room is ready for new allocation' }],
    rentPerBed: 7500, securityDeposit: 15000, maintenanceCharges: 500,
    facilities: ['Attached Bathroom', 'Non-AC', 'WiFi', 'Cupboard']
  },
  {
    id: '3', number: '103', floor: '1st Floor', type: 'Single', status: 'Maintenance',
    beds: [{ id: 'b3', number: 1, status: 'Available' }],
    reminders: [{ id: 'r3', type: 'maintenance', message: 'Leakage fix scheduled for tomorrow' }],
    rentPerBed: 7500, securityDeposit: 15000, maintenanceCharges: 500,
    facilities: ['Attached Bathroom', 'Non-AC', 'WiFi']
  },
  {
    id: '4', number: '201', floor: '2nd Floor', type: 'Double', status: 'Occupied',
    beds: [
      { id: 'b4', number: 1, status: 'Occupied', tenantId: 't4' },
      { id: 'b5', number: 2, status: 'Occupied', tenantId: 't5' }
    ],
    reminders: [],
    rentPerBed: 6000, securityDeposit: 12000, maintenanceCharges: 400,
    facilities: ['Attached Bathroom', 'AC', 'WiFi', 'Cupboard', 'Study Table']
  },
  {
    id: '5', number: '202', floor: '2nd Floor', type: 'Double', status: 'Partially Occupied',
    beds: [
      { id: 'b6', number: 1, status: 'Occupied', tenantId: 't2' },
      { id: 'b7', number: 2, status: 'Available' }
    ],
    reminders: [{ id: 'r5', type: 'vacancy', message: '1 bed available for allocation' }],
    rentPerBed: 6000, securityDeposit: 12000, maintenanceCharges: 400,
    facilities: ['Attached Bathroom', 'AC', 'WiFi', 'Cupboard']
  },
  {
    id: '6', number: '203', floor: '2nd Floor', type: 'Double', status: 'Vacant',
    beds: [
      { id: 'b8a', number: 1, status: 'Available' },
      { id: 'b8b', number: 2, status: 'Available' }
    ],
    reminders: [{ id: 'r6a', type: 'vacancy', message: '2 beds available' }],
    rentPerBed: 5500, securityDeposit: 11000, maintenanceCharges: 400,
    facilities: ['Non-AC', 'WiFi', 'Cupboard']
  },
  {
    id: '7', number: '301', floor: '3rd Floor', type: 'Triple', status: 'Partially Occupied',
    beds: [
      { id: 'b9', number: 1, status: 'Occupied', tenantId: 't3' },
      { id: 'b10', number: 2, status: 'Reserved' },
      { id: 'b11', number: 3, status: 'Available' }
    ],
    reminders: [
      { id: 'r6', type: 'rent', message: 'Rent overdue for Amit Verma' },
      { id: 'r7', type: 'repair', message: 'Bed 2 requires minor repair before allocation' }
    ],
    rentPerBed: 5000, securityDeposit: 10000, maintenanceCharges: 300,
    facilities: ['Non-AC', 'WiFi', 'Cupboard', 'Balcony']
  },
  {
    id: '8', number: '302', floor: '3rd Floor', type: 'Triple', status: 'Occupied',
    beds: [
      { id: 'b12', number: 1, status: 'Occupied', tenantId: 't6' },
      { id: 'b13', number: 2, status: 'Occupied', tenantId: 't7' },
      { id: 'b14', number: 3, status: 'Occupied', tenantId: 't8' }
    ],
    reminders: [],
    rentPerBed: 5000, securityDeposit: 10000, maintenanceCharges: 300,
    facilities: ['AC', 'WiFi', 'Cupboard', 'Balcony', 'Study Table']
  }
];
