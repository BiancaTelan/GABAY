import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#F4F7F9] overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden" 
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`bg-white border-r border-gray-200 z-50 overflow-hidden transition-all duration-300 ease-in-out
        
        /* Mobile Setting */
        fixed inset-y-0 left-0 transform md:relative md:translate-x-0
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        
        /* Desktop Setting */
        md:block
        ${isCollapsed ? 'md:w-[80px]' : 'md:w-[260px]'}
      `}>
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* RIGHT SECTION */}
      <div className="flex-1 flex flex-col min-w-0"> 
        {/* HEADER */}
      <div className="h-[70px] bg-white border-b border-gray-200">
        <AdminHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

        {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Outlet />
        </main>
      </div>
    </div>
  );
}