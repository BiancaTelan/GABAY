import { Outlet } from 'react-router-dom';
import StaffHeader from './StaffHeader';

export default function StaffLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <StaffHeader />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}