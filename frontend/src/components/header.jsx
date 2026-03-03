import gabayLogo from '../assets/gabayLogo.png';

export default function Header() {
  const navItems = ['Home', 'Reservations', 'Help', 'Contact Us'];
  return (
      <header className="font-montserrat sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <img src={gabayLogo} alt="GABAY Logo" className="h-10 w-auto" />
      </div>

      <nav>
        <ul className="flex space-x-20">
          {navItems.map((item) => (
            <li key={item}>
              <a 
                href={`/${item.toLowerCase().replace(' ', '-')}`} 
                className="text-black font-semibold hover:text-gabay-blue transition-colors"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="flex gap-2 p-0.5 font-montserrat">
      <button className="bg-gabay-blue text-white px-5 py-2 text-sm font-medium hover:bg-gabay-navy transition-colors">
        Log In
      </button>

      <button className="border-2 border-gabay-blue text-gabay-blue px-5 py-2 text-sm font-medium bg-transparent hover:bg-blue-50 transition-colors">
        Sign Up
      </button>
      </div>
    </header>
  );
}