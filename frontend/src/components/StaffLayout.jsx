import { Outlet } from 'react-router-dom';
import StaffHeader from './StaffHeader';

const mockDoctors = [
  { id: 1, name: 'Dela Cruz, Juan', role: 'Doctor', schedule: 'M, W, F', timePeriod: '8:00 AM – 2:00 PM', department: 'Internal Medicine', availability: 'Not Available' },
  { id: 2, name: 'Trinidad, Sarah', role: 'Doctor', schedule: 'M, W, F', timePeriod: '8:00 AM – 2:00 PM', department: 'Internal Medicine', availability: 'Available' },
  { id: 3, name: 'Santos, Julio', role: 'Doctor', schedule: 'T, TH', timePeriod: '8:00 AM – 2:00 PM', department: 'Internal Medicine', availability: 'Available' },
];

export default function StaffLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <StaffHeader />
      <main className="p-6">
        <Outlet context={{ doctors: mockDoctors }} />
      </main>
    </div>
  );
}