import React, { useState } from 'react';
import Header from './components/Header';
import Home from './pages/home';
import Reservations from './pages/Reservations';
import Help from './pages/Help';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

function App() {
  // Use state to determine which page is active. 
  // Options: 'home', 'reservations', 'help', 'contact', 'login', 'signup'
  const [currentPage, setCurrentPage] = useState('home');

  // Logic to hide header: it will be true if currentPage is NOT login or signup
  const showHeader = currentPage !== 'login' && currentPage !== 'signup';

  return (
    <div className="min-h-screen bg-white font-sans">
      {showHeader && <Header onNavigate={setCurrentPage} />}

      <main className={showHeader ? "pt-0" : ""}>
        {currentPage === 'home' && <Home />}
        {currentPage === 'reservations' && <Reservations />}
        {currentPage === 'help' && <Help />}
        {currentPage === 'contact' && <ContactUs />}
        {currentPage === 'login' && <Login />}
        {currentPage === 'signup' && <SignUp />}
      </main>

    </div>
  );
}

export default App;
