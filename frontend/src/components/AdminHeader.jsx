import { Bell, Calendar, UserCircle } from 'lucide-react';
import gabayLogo from '../assets/gabayLogo.png';

export default function AdminHeader() {
  return (
    <header className="h-full px-8 flex items-center justify-between bg-white border-b border-gray-200 transition-all">
      {/* Logo Container - Safely in the Header */}
      <div className="flex items-center">
        <img src={gabayLogo} alt="GABAY" className="h-10 w-auto object-contain" />
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-4">
        {/* Search/Placeholder box from your design */}
        <div className="w-10 h-10 bg-gray-100 rounded-md hidden md:block"></div>
        
        <button className="p-2 text-[#3B82F6] hover:bg-blue-50 rounded-lg transition">
          <Calendar size={22} />
        </button>
        
        <button className="p-2 text-[#3B82F6] hover:bg-blue-50 rounded-lg transition relative">
          <Bell size={22} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

        <button className="flex items-center gap-2 group">
          <UserCircle size={32} className="text-[#14B8A6] group-hover:text-[#3B82F6] transition" />
        </button>
      </div>
    </header>
  );
}