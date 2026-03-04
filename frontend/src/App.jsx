import React, { useState } from 'react';
import Header from './components/header';
import Home from './pages/home';
import Reservations from './pages/Reservations';
import Help from './pages/Help';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

function App() { 
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const showHeader = currentPage !== 'login' && currentPage !== 'signup';

  return (
    <div className="min-h-screen bg-white font-sans relative">
      {showHeader && (
        <Header 
          isLoggedIn={isLoggedIn} 
          onNavigate={setCurrentPage}
          currentPage={currentPage} 
        />
      )}

      <main className={showHeader ? "pt-0" : ""}>
        {currentPage === 'home' && <Home />}
        {currentPage === 'reservations' && <Reservations />}
        {currentPage === 'help' && <Help />}
        {currentPage === 'contact' && <ContactUs />}
        
        {currentPage === 'login' && (
          <Login 
            onNavigate={setCurrentPage} 
            setIsLoggedIn={setIsLoggedIn} 
          />
        )}
        
        {currentPage === 'signup' && (
          <SignUp onNavigate={setCurrentPage} />
        )}
      </main>

      {/* TEMPORARY BTN TO SEE HEADER CHANGE */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        <button 
          onClick={() => setIsLoggedIn(!isLoggedIn)}
          className="bg-gabay-blue text-white px-3 py-2 rounded-md text-xs font-bold shadow-lg hover:bg-gabay-navy transition-all"
        >
          STATUS: {isLoggedIn ? 'LOGGED IN' : 'LOGGED OUT'}
        </button>
      </div>

    </div>
  );
}

export default App;