import { Bell, Calendar, UserCircle, Menu } from 'lucide-react';
import gabayLogo from '../assets/gabayLogo.png';
import { useContext } from 'react';
import { AuthContext } from '../authContext';
import { useNavigate, useLocation } from 'react-router-dom'; 

export default function AdminHeader({ isCollapsed, setIsCollapsed, isLoggedIn }) {
  const { userInfo } = useContext(AuthContext);
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
        
        <button onClick={() => navigate('/admin/a-calendar')} 
        className="p-2 text-gabay-blue hover:bg-blue-50 rounded-lg transition">
          <Calendar size={23} />
        </button>
        
        <button onClick={() => navigate('/admin/a-notifs')} 
        className="p-2 text-gabay-blue hover:bg-blue-50 rounded-lg transition relative">
          <Bell size={23} />
          {/* Notification Dot */}
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="h-8 w-[1px] bg-gray-200 mx-1 md:mx-2"></div>

        {/* Account Button */}
        <button 
          onClick={() => navigate('/admin/a-account')} 
          className="flex items-center justify-center p-0.5 rounded-full border-2 border-transparent hover:border-gabay-blue transition-all overflow-hidden"
        >
          <img 
            src={userInfo?.profilePhoto || "/default-avatar.png"} 
            alt="Admin" 
            className="h-9 w-9 rounded-full object-cover bg-gray-100" 
          />
        </button>
      </div>
    </header>
  );
}