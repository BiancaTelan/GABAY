import gabayLogo from '../assets/gabayLogo.png';

export default function Header() {
  return (

      <header className="flex items-center p-4 bg-white border-b flex justify-between items-center shadow-sm">
      <img 
        src={gabayLogo} 
        alt="GABAY Logo" 
        className="h-10 w-auto"
      />
      
      <button className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">
        Login
      </button>
    </header>
  );
}