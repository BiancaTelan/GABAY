import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gabayLogo from '../assets/gabayLogo.png';
import Button from '../components/button';
import { AuthContext } from '../authContext';
import { Calendar, Mail, User, ClipboardClock, Menu, X } from 'lucide-react';

export default function Header({ isLoggedIn }) {
  const { unreadCount } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleNav = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <header className="font-poppins sticky top-0 z-50 bg-white border-b border-gray-200 py-3">
      <div className="flex items-center justify-between w-full px-5">
        
        <div className="flex items-center gap-12">
          <div className="cursor-pointer shrink-0" onClick={() => handleNav('/')}>
            <img src={gabayLogo} alt="GABAY Logo" className="h-10" />
          </div>

          <nav className="hidden md:flex gap-8 font-medium">
            {[
              { name: 'home', path: '/' },
              { name: 'departments', path: '/departments' },
              { name: 'help', path: '/help' },
              { name: 'contact', path: '/contact' }
            ].map((item) => (
              <button 
                key={item.name} 
                onClick={() => handleNav(item.path)}
                className={`transition-all duration-200 border-b-2 pb-1 ${isActive(item.path)
                  ? 'text-gabay-blue border-gabay-blue'
                  : 'text-gray-600 border-transparent hover:text-gabay-blue hover:border-gabay-blue/30'}`}
              >
                {item.name === 'contact' ? 'Contact Us' : item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* MENU ICONS AND BURGER */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/prevAppt')} 
                  className={`p-2 rounded-xl transition-all ${isActive('/prevAppt') 
                  ? 'bg-gabay-blue text-white shadow-md' : 'bg-transparent text-gray-400 hover:bg-blue-50 hover:text-gabay-blue'}`}
                  title="Appointment History">
                  <ClipboardClock size={24} />
                </button>

                <button onClick={() => navigate('/calendar')}
                  className={`p-2 rounded-xl transition-all ${isActive('/calendar') 
                  ? 'bg-gabay-blue text-white shadow-md' : 'bg-transparent text-gray-400 hover:bg-blue-50 hover:text-gabay-blue'}`}
                  title="Calendar">
                  <Calendar size={24} />
                </button>

                <button onClick={() => navigate('/inbox')}
                  className={`relative p-2 rounded-xl transition-all ${isActive('/inbox') 
                  ? 'bg-gabay-blue text-white shadow-md' : 'bg-transparent text-gray-400 hover:bg-blue-50 hover:text-gabay-blue'}`}
                  title="Inbox">
                  <Mail size={24} />
                  {/* The Red Badge */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button onClick={() => navigate('/account')}
                  className={`p-2 ml-2 rounded-full transition-all ${isActive('/account') 
                  ? 'bg-gabay-blue text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gabay-blue hover:text-white'}`}
                  title="Account">
                  <User size={24} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 p-0.5">
                <Button variant="solid" className="font-montserrat" onClick={() => handleNav('/login')}>Log In</Button>
                <Button variant="outline" className="font-montserrat" onClick={() => handleNav('/signup')}>Sign Up</Button>
              </div>
            )}
          </div>

          <button className={`md:hidden p-3 transition-all duration-200 rounded-lg group ${isMenuOpen 
            ? 'bg-blue-50 text-gabay-blue' : 'text-gray-600 hover:bg-gray-100 hover:text-gabay-blue'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu">
            {isMenuOpen ? <X size={28} className="transition-transform duration-200 rotate-90 group-hover:rotate-0" /> 
            : <Menu size={28} className="transition-transform duration-200 group-hover:scale-110" />}
          </button>
        </div>
      </div>

      {/* MOBILE NAV LINKS */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-4">
            {[
              { name: 'home', path: '/' },
              { name: 'departments', path: '/departments' },
              { name: 'help', path: '/help' },
              { name: 'contact', path: '/contact' }
            ].map((item) => (
              <button key={item.name} onClick={() => handleNav(item.path)} 
                className={`text-left font-medium text-lg ${isActive(item.path) ? 'text-gabay-blue' : 'text-gray-600'}`}>
                {item.name === 'contact' ? 'Contact Us' : item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </button>
            ))}
          </nav>
          
          <hr className="border-gray-100" />

          <div className="flex flex-col gap-3">
            {isLoggedIn ? (
              <div className="grid grid-cols-4 gap-2">
                <button onClick={() => handleNav('/prevAppt')} 
                  className={`p-3 rounded-lg flex justify-center transition-all ${isActive('/prevAppt') 
                  ? 'bg-gabay-blue text-white shadow-md' : 'bg-transparent text-gray-400 hover:bg-blue-50 hover:text-gabay-blue'}`}>
                  <ClipboardClock size={24} />
                </button>

                <button onClick={() => handleNav('/calendar')} 
                  className={`p-3 rounded-lg flex justify-center transition-all ${isActive('/calendar') 
                  ? 'bg-gabay-blue text-white shadow-md' : 'bg-transparent text-gray-400 hover:bg-blue-50 hover:text-gabay-blue'}`}>
                  <Calendar size={24} />
                </button>

                {/* MOBILE INBOX BUTTON WITH BADGE */}
                <button onClick={() => handleNav('/inbox')} 
                  className={`relative p-3 rounded-lg flex justify-center transition-all ${isActive('/inbox') 
                  ? 'bg-gabay-blue text-white shadow-md' 
                  : 'bg-transparent text-gray-400 hover:bg-blue-50 hover:text-gabay-blue'}`}>
                  <Mail size={24} />
                  {/* The Red Badge */}
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button onClick={() => handleNav('/account')} 
                  className={`p-3 rounded-lg flex justify-center transition-all ${isActive('/account') 
                  ? 'bg-gabay-blue text-white shadow-md' : 'bg-transparent text-gray-400 hover:bg-blue-50 hover:text-gabay-blue'}`}>
                  <User size={24} />
                </button>
              </div>
            ) : (
              <>
                <Button variant="solid" className="w-full font-lg" onClick={() => handleNav('/login')}>Log In</Button>
                <Button variant="outline" className="w-full font-sm" onClick={() => handleNav('/signup')}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}