import { Bell, Calendar, UserCircle, Menu } from 'lucide-react';
import gabayLogo from '../assets/gabayLogo.png';

import { useNavigate, useLocation } from 'react-router-dom'; 

export default function AdminHeader({ isCollapsed, setIsCollapsed, isLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  const handleNav = (path) => {
    navigate(path);
    // Mobile Menu state [isMenuOpen, setIsMenuOpen] = useState(false).
  };

  return (
    <header className="h-full px-4 md:px-8 flex items-center justify-between bg-white border-b border-gray-200 transition-all">
      <div className="flex items-center gap-4">
        {/* Burger Menu */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg md:hidden text-gray-600 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu size={24} />
        </button>

        <img src={gabayLogo} alt="GABAY" className="h-8 md:h-10 w-auto object-contain" />
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Placeholder / Spacer */}
        <div className="w-10 h-10 bg-gray-100 rounded-md hidden md:block"></div>
        
        <button className="p-2 text-gabay-blue hover:bg-blue-50 rounded-lg transition">
          <Calendar size={23} />
        </button>
        
        <button className="p-2 text-gabay-blue hover:bg-blue-50 rounded-lg transition relative">
          <Bell size={23} />
          {/* Notification Dot */}
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="h-8 w-[1px] bg-gray-200 mx-1 md:mx-2"></div>

        {/* Account Button */}
        <button 
          onClick={() => handleNav('/admin/a-account')} 
          className={`p-2 rounded-lg flex items-center gap-2 group transition-all ${
            isActive('/a-account') 
              ? 'bg-gabay-blue text-white shadow-md' 
              : 'text-gray-400 hover:bg-blue-50 hover:text-gabay-blue'
          }`}
          title="Admin Account"
        >
          <UserCircle size={32} />
        </button>
      </div>
    </header>
  );
}