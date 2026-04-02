// src/components/StaffHeader.jsx
import { Bell, Calendar, UserCircle } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../authContext';
import gabayLogo from '../assets/gabayLogo.png';

export default function StaffHeader() {
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="font-poppins sticky top-0 z-50 bg-white border-b border-gray-200 py-3">
      <div className="flex items-center justify-between w-full px-5">
        {/* Left: Logo and nav links */}
        <div className="flex items-center gap-12">
          <div className="cursor-pointer shrink-0" onClick={() => navigate('/staff/dashboard')}>
            <img src={gabayLogo} alt="GABAY Logo" className="h-10" />
          </div>

          <nav className="hidden md:flex gap-8 font-medium">
            {[
              { name: 'Dashboard', path: '/staff/dashboard' },
              { name: 'Appointments', path: '/staff/appointments' },
              { name: 'Doctors', path: '/staff/doctors' }
            ].map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `transition-all duration-200 border-b-2 pb-1 ${
                    isActive
                      ? 'text-gabay-blue border-gabay-blue'
                      : 'text-gray-600 border-transparent hover:text-gabay-blue hover:border-gabay-blue/30'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right: Icons and user menu */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <button
              className="p-2 rounded-xl transition-all text-gray-400 hover:bg-blue-50 hover:text-gabay-blue"
              title="Calendar"
            >
              <Calendar size={24} />
            </button>
            <button
              className="p-2 rounded-xl transition-all text-gray-400 hover:bg-blue-50 hover:text-gabay-blue relative"
              title="Notifications"
            >
              <Bell size={24} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 rounded-full transition-all text-gray-400 hover:bg-gray-100 hover:text-gabay-blue"
                title="Account"
              >
                <UserCircle size={24} />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    {userInfo?.email || 'Staff'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}