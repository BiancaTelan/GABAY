export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm">
      {/* Dark Blue H2 for the GABAY logo/title */}
      <h2 className="text-blue-900 text-2xl font-bold tracking-tight">
        GABAY
      </h2>
      
      {/* Teal Button for a Call to Action */}
      <button className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">
        Login
      </button>
    </header>
  );
}