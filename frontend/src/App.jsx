import React, { useState } from 'react';
import Header from './components/header';
import Home from './pages/home';
import Reservations from './pages/Reservations';
import Help from './pages/Help';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Account from './pages/Account'; 
import HospitalNumber from './pages/HospitalNumber';
import GeneratedHospitalNumber from './pages/GenerateHospitalNum';
import DepartmentList from './pages/DepartmentList';

function App() { 
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [intendedPage, setIntendedPage] = useState(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
    if (intendedPage) {
      setCurrentPage(intendedPage);
      setIntendedPage(null);
    } else {
      setCurrentPage('hospitalNumber');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false); 
    setCurrentPage('home');
  };

  const handleNavigate = (page) => {
    const protectedPages = [
      'departments',
      'reservations',
      'account',
      'hospitalNumber',
      'generatedNumber',
      'generalDepartments',
      'specialtyDepartments',
    ];

    if (protectedPages.includes(page) && !isLoggedIn) {
      setIntendedPage(page);
      setCurrentPage('login');
    } else {
      setCurrentPage(page);
    }
  };

  const showHeader = currentPage !== 'login' && currentPage !== 'signup';

  return (
    <div className="min-h-screen bg-white font-sans relative">
      {showHeader && (
        <Header 
          isLoggedIn={isLoggedIn} 
          onNavigate={handleNavigate}
          currentPage={currentPage} 
        />
      )}

      <main className={showHeader ? "pt-0" : ""}>
        {currentPage === 'home' && (
          <Home onNavigate={handleNavigate} />
        )}

        {currentPage === 'reservations' && <Reservations />}
        {currentPage === 'help' && <Help />}
        {currentPage === 'contact' && <ContactUs />}
        
        {currentPage === 'login' && (
          <Login onNavigate={setCurrentPage} setIsLoggedIn={handleLogin} />
        )}

        {currentPage === 'signup' && (
          <SignUp onNavigate={setCurrentPage} onLogin={handleLogin} />
        )}

        {currentPage === 'account' && (
          <Account onLogout={handleLogout} />
        )}

        {currentPage === 'hospitalNumber' && (
          <HospitalNumber onNavigate={handleNavigate} />
        )}

        {currentPage === 'generatedNumber' && (
          <GeneratedHospitalNumber onNavigate={handleNavigate} />
        )}

        {currentPage === 'departments' && (
          <DepartmentList onNavigate={handleNavigate} />
        )}
      </main>
    </div>
  );
}

export default App;