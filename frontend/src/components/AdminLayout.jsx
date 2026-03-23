import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`grid ${isCollapsed ? 'grid-cols-[80px_1fr]' : 'grid-cols-[260px_1fr]'} grid-rows-[70px_1fr] h-screen w-full transition-all duration-300`}>
      <div className="row-span-2 bg-white border-r border-gray-200">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>
      <div className="bg-white">
        <AdminHeader />
      </div>
      <main className="bg-[#F4F7F9] overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}