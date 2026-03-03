import gabayLogo from '../assets/gabayLogo.png';

export default function Header() {
  const navItems = ['Home', 'Reservations', 'Help', 'Contact Us'];
  return (
      <header className="sticky top-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
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
      
      <button className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">
        Login
      </button>
    </header>
  );
}