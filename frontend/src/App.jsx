import React, { useState } from 'react';
import Header from './components/header';
import Home from './pages/home';
import Reservations from './pages/Reservations';
import Help from './pages/Help';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Account from './pages/Account';
/*import apptHistory from './pages/apptHistory';
import Calendar from './pages/Calendar';
import Inbox from './pages/Inbox';*/


function App() { 
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const handleLogout = () => {
    setIsLoggedIn(false); 
    setCurrentPage('home');
  };
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
        <Login onNavigate={setCurrentPage} setIsLoggedIn={setIsLoggedIn} />)}
        {currentPage === 'signup' && (<SignUp onNavigate={setCurrentPage} />)}
        {currentPage === 'account' && (<Account onLogout={handleLogout} />)}
        {/*currentPage === 'appthistory' && <apptHistory />}
        {currentPage === 'calendar' && <Calendar />}
        {currentPage === 'inbox' && <Inbox />*/}
      </main>

    </div>
  );
}

export default App;