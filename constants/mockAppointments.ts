export type Appointment = {
  id: string;
  customerName: string;
  date: string;
  time: string;
  type: 'solar' | 'roofing' | 'both';
  address: string;
  phone: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
};

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    customerName: 'John Smith',
    date: '2025-07-15',
    time: '10:00 AM',
    type: 'solar',
    address: '123 Main St, Anytown, CA',
    phone: '(555) 123-4567',
    notes: 'Interested in full home solar system with battery backup',
    status: 'confirmed',
  },
  {
    id: '2',
    customerName: 'Sarah Johnson',
    date: '2025-07-16',
    time: '2:30 PM',
    type: 'roofing',
    address: '456 Oak Ave, Somewhere, CA',
    phone: '(555) 987-6543',
    notes: 'Needs roof inspection, considering solar installation afterward',
    status: 'pending',
  },
  {
    id: '3',
    customerName: 'Michael Williams',
    date: '2025-07-17',
    time: '9:00 AM',
    type: 'both',
    address: '789 Pine Rd, Nowhere, CA',
    phone: '(555) 456-7890',
    status: 'confirmed',
  },
  {
    id: '4',
    customerName: 'Jennifer Brown',
    date: '2025-07-18',
    time: '1:00 PM',
    type: 'solar',
    address: '321 Elm St, Anytown, CA',
    phone: '(555) 234-5678',
    notes: 'Commercial property, interested in cost savings',
    status: 'confirmed',
  },
  {
    id: '5',
    customerName: 'Robert Davis',
    date: '2025-07-19',
    time: '11:30 AM',
    type: 'roofing',
    address: '654 Maple Dr, Somewhere, CA',
    phone: '(555) 876-5432',
    status: 'pending',
  },
  {
    id: '6',
    customerName: 'Lisa Miller',
    date: '2025-07-20',
    time: '3:00 PM',
    type: 'both',
    address: '987 Cedar Ln, Nowhere, CA',
    phone: '(555) 345-6789',
    notes: 'Needs full roof replacement, interested in adding solar',
    status: 'confirmed',
  },
];