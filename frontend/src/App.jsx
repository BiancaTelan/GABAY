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
import ConfirmationModal from './components/confirmModal';
import AppointmentHistory from './pages/AppointmentHistory';
import Inbox from './pages/Inbox';
import Calendar from './pages/Calendar';
import GeneralForm from './pages/GeneralForm';
import SpecialtyForm from './pages/SpecialtyForm';

function App() { 
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [intendedPage, setIntendedPage] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [formMode, setFormMode] = useState('fill');

  const handleLogin = (userFromDb) => {
    setIsLoggedIn(true);
    if (userFromDb) setUserInfo(userFromDb);
    if (intendedPage) {
      setCurrentPage(intendedPage);
      setIntendedPage(null);
    } else {
      setCurrentPage('home'); 
    }
  };

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
  };

  const handleLogout = () => {
    setIsLoggedIn(false); 
    setUserInfo(null);
    setRegistrationData(null);
    setCurrentPage('home');
  };

  const handleReserveGeneral = () => {
    handleNavigate('generalForm');
    setFormMode('fill');
  };

  const handleReserveSpecialty = () => {
    handleNavigate('specialtyForm'); 
    setFormMode('fill');
  };

  const handleFormSubmission = (data, nextStep) => {
    if (nextStep === "confirm") {
      setFormMode('confirm');
    } else if (nextStep === "fill") {
      setFormMode('fill');
    } else if (nextStep === "submit") {
      console.log("Saving Appointment:", data);
      setFormMode('fill');
      setCurrentPage('prevAppt'); 
    }
  };

  const handleNavigate = (page) => {
    const isRegistering = currentPage === 'registerNumber';
    const isProfileIncomplete = isLoggedIn && !userInfo?.hospitalNumber;

    if (isRegistering && isProfileIncomplete && page !== 'registerNumber') {
      const formElement = document.getElementById('register-form');
      if (formElement) {
        formElement.classList.add('animate-shake');
        setTimeout(() => formElement.classList.remove('animate-shake'), 500);
      }
      setShowBlockerModal(true);
      return;
    }

    const protectedPages = [
      'departments', 'account', 'hospitalNumber', 'registerNumber', 
      'generatedNumber', 'generalForm', 'specialtyForm',
      'prevAppt', 'inbox', 'calendar'
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
          <Home onNavigate={handleNavigate} onReserveGeneral={handleReserveGeneral} />
        )}
        
        {currentPage === 'departments' && (
          <DepartmentList 
            onNavigate={handleNavigate} 
            onReserveGeneral={handleReserveGeneral} 
            onReserveSpecialty={handleReserveSpecialty} 
          />
        )}

        {currentPage === 'generalForm' && (
          <GeneralForm 
            userInfo={userInfo} 
            mode={formMode} 
            onConfirm={handleFormSubmission} 
          />
        )}

        {currentPage === 'specialtyForm' && (
          <SpecialtyForm userInfo={userInfo} 
          mode={formMode} 
          onConfirm={handleFormSubmission} />
        )}

        {currentPage === 'help' && <Help />}
        {currentPage === 'contact' && <ContactUs />}
        {currentPage === 'login' && <Login onNavigate={setCurrentPage} setIsLoggedIn={handleLogin} />}
        {currentPage === 'signup' && <SignUp onNavigate={setCurrentPage} onCompleteSignup={handleCompleteSignUp} />}
        {currentPage === 'account' && <Account userInfo={userInfo} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} />}
        {currentPage === 'hospitalNumber' && <HospitalNumber onNavigate={handleNavigate} />}
        {currentPage === 'registerNumber' && <RegisterHospitalNumber initialData={registrationData} onFinalSubmit={handleFinalRegistration} />}
        {currentPage === 'generatedNumber' && <GeneratedHospitalNumber onNavigate={handleNavigate} />}
        {currentPage === 'prevAppt' && <AppointmentHistory onNavigate={handleNavigate} />}
        {currentPage === 'inbox' && <Inbox onNavigate={handleNavigate} />}
        {currentPage === 'calendar' && <Calendar onNavigate={handleNavigate} />}

        <ConfirmationModal 
          isOpen={showBlockerModal}
          onClose={() => setShowBlockerModal(false)}
          onConfirm={() => setShowBlockerModal(false)}
          title="Registration Incomplete"
          message="Please finish registering your hospital number before accessing other pages."
          type="warning"
        />
      </main>
    </div>
  );
}

export default App;