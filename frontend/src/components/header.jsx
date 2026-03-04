import gabayLogo from '../assets/gabayLogo.png';
import Button from '../components/button';
import { Calendar, Mail, User, ClipboardClock } from 'lucide-react';

export default function Header({ isLoggedIn, onNavigate, currentPage }) {
  return (
      <header className="font-poppins sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="cursor-pointer" onClick={() => onNavigate('home')}>
        <img src={gabayLogo} alt="GABAY Logo" className="h-10" />
      </div>

      <nav className="hidden md:flex gap-8 font-medium">
        <button onClick={() => onNavigate('home')} 
        className={`transition-colors ${currentPage === 'home' 
        ? 'text-gabay-teal2' : 'text-gray-500 hover:text-gabay-teal'}`}>
        Home
        </button>
        
        <button onClick={() => onNavigate('reservations')} 
        className={`transition-colors ${currentPage === 'reservations' 
        ? 'text-gabay-teal2' : 'text-gray-500 hover:text-gabay-teal'}`}>
        Reservations
        </button>

        <button onClick={() => onNavigate('help')} 
        className={`transition-colors ${currentPage === 'help' 
        ? 'text-gabay-teal2' : 'text-gray-500 hover:text-gabay-teal'}`}>
        Help
        </button>

        <button onClick={() => onNavigate('contact')} 
        className={`transition-colors ${currentPage === 'contact' 
        ? 'text-gabay-teal2' : 'text-gray-500 hover:text-gabay-teal'}`}>
        Contact Us
        </button>
      </nav>

      <div className="flex items-center gap-3 font-poppins">
        {isLoggedIn ? (
          //LOGGED IN
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('prevAppt')} 
            className={`p-2 rounded-full transition-all ${currentPage === 'prevAppt' 
            ? 'bg-teal-100 text-gabay-teal2 shadow-sm' : 'text-gray-500 hover:text-gabay-teal hover:bg-teal-50'}`}
            title="Appointment History">
            <ClipboardClock size={22} />
            </button>

            <button onClick={() => onNavigate('calendar')}
            className={`p-2 rounded-full transition-all ${currentPage === 'calendar' 
            ? 'bg-teal-100 text-gabay-teal2 shadow-sm' : 'text-gray-500 hover:text-gabay-teal hover:bg-teal-50'}`}
            title="Calendar">
            <Calendar size={22} />
            </button>

            <button onClick={() => onNavigate('inbox')}
            className={`p-2 rounded-full transition-all ${currentPage === 'inbox' 
            ? 'bg-teal-100 text-gabay-teal2 shadow-sm' : 'text-gray-500 hover:text-gabay-teal hover:bg-teal-50'}`}
            title="Inbox">
            <Mail size={22} />
            </button>

            <button onClick={() => onNavigate('account')}
            className={`p-2 ml-2 rounded-full transition-all ${currentPage === 'account' 
            ? 'bg-gabay-teal2 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gabay-teal hover:text-white'}`}
            title="Account">
            <User size={22} />
            </button>
      </div>

          ) : (
          // LOGGED OUT
        <div className="flex gap-2 p-0.5 font-poppins">
        <Button variant="solid" onClick={() => onNavigate('login')} >
          Log In
        </Button>

        <Button variant="outline" onClick={() => onNavigate('signup')} >
          Sign Up
        </Button>
        </div>
        )}
      </div>

    </header>
  );
}