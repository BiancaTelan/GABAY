import gabayLogo from '../assets/gabayLogo.png';
import Button from '../components/button';

export default function Header({ onNavigate }) {
  const navItems = ['Home', 'Reservations', 'Help', 'Contact Us'];
  return (
      <header className="font-poppins sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="cursor-pointer" onClick={() => onNavigate('home')}>
        <img src={gabayLogo} alt="GABAY Logo" className="h-10" />
      </div>

      <nav className="hidden md:flex gap-8 text-gray-600 font-medium">
        <button onClick={() => onNavigate('home')} className="hover:text-gabay-blue">About GABAY</button>
        <button onClick={() => onNavigate('reservations')} className="hover:text-gabay-blue">Reservations</button>
        <button onClick={() => onNavigate('help')} className="hover:text-gabay-blue">Help</button>
        <button onClick={() => onNavigate('contact')} className="hover:text-gabay-blue">Contact Us</button>
      </nav>
      
      <div className="flex gap-2 p-0.5 font-poppins">
      <Button variant="solid" onClick={() => onNavigate('login')} >
        Log In
      </Button>

      <Button variant="outline" onClick={() => onNavigate('signup')} >
        Sign Up
      </Button>
      </div>
    </header>
  );
}