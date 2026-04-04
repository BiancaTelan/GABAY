import { Bell, Calendar } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../authContext';
import gabayLogo from '../assets/gabayLogo.png';

export default function StaffHeader() {
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

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

        {/* Right: Icons and Direct Account Link */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/staff/doctor-schedule')}
              className="p-2 rounded-xl transition-all text-gray-400 hover:bg-blue-50 hover:text-gabay-blue"
              title="Calendar"
            >
              <Calendar size={24} />
            </button>
            <button
              onClick={() => navigate('/staff/s-notifs')}
              className="p-2 rounded-xl transition-all text-gray-400 hover:bg-blue-50 hover:text-gabay-blue relative"
              title="Notifications"
            >
              <Bell size={24} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
    
            <button
              onClick={() => navigate('/staff/s-account')}
              className="flex items-center justify-center p-0.5 rounded-full border-2 border-transparent hover:border-gabay-blue transition-all overflow-hidden"
            >
                <img 
                  src={userInfo?.profilePhoto || "/default-avatar.png"} 
                  alt="Staff" 
                  className="h-9 w-9 rounded-full object-cover bg-gray-100" 
                />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}