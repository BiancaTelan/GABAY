import React, { useState } from 'react';
import Header from './components/header';
import Home from './pages/home';
import Help from './pages/Help';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Account from './pages/Account'; 
import HospitalNumber from './pages/HospitalNumber';
import GeneratedHospitalNumber from './pages/GenerateHospitalNum';
import RegisterHospitalNumber from './pages/RegisterHospitalNum';
import DepartmentList from './pages/DepartmentList';

function App() { 
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [intendedPage, setIntendedPage] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // EXISTING USERS
  const handleLogin = () => {
    setIsLoggedIn(true);
    if (intendedPage) {
      setCurrentPage(intendedPage);
      setIntendedPage(null);
    } else {
      setCurrentPage('home'); 
    }
  };

// NEW USERS
  const handleCompleteSignUp = (data) => {
    setIsLoggedIn(true); 
    setRegistrationData(data); 
    setCurrentPage('hospitalNumber'); 
  };

  const handleFinalRegistration = (finalData) => {
    setUserInfo({ ...registrationData, ...finalData }); 
    setRegistrationData(null); 
    setCurrentPage('account'); 
  };

  const handleUpdateProfile = (updatedData) => {
    setUserInfo(updatedData);
    console.log("Global profile data updated!", updatedData);
  };

  const handleLogout = () => {
    setIsLoggedIn(false); 
    setUserInfo(null);
    setRegistrationData(null);
    setCurrentPage('home');
  };

  const handleNavigate = (page) => {
    const protectedPages = [
      'departments',
      'account',
      'hospitalNumber',
      'registerNumber',
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

        {currentPage === 'departments' && <DepartmentList />}
        {currentPage === 'help' && <Help />}
        {currentPage === 'contact' && <ContactUs />}
        
        {currentPage === 'login' && (
          <Login onNavigate={setCurrentPage} setIsLoggedIn={handleLogin} />
        )}

        {currentPage === 'signup' && (
          <SignUp onNavigate={setCurrentPage} onCompleteSignup={handleCompleteSignUp} />
        )}

        {currentPage === 'account' && (
          <Account userInfo={userInfo} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} />
        )}

        {currentPage === 'hospitalNumber' && (
          <HospitalNumber onNavigate={handleNavigate} />
        )}

        {currentPage === 'registerNumber' && (
          <RegisterHospitalNumber initialData={registrationData} onFinalSubmit={handleFinalRegistration} />
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