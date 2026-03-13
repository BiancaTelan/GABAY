import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

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
import RescheduleForm from './pages/RescheduleForm';
import ReservationConfirmation from './pages/R.F.Confirmation';
import AppointmentConfirmed from './pages/ApptConfirmed';
import AppointmentCancelled from './pages/ApptCancelled';
import ForgotPassword from './pages/ForgotPassword';

function App() { 
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [registrationData, setRegistrationData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [formMode, setFormMode] = useState('fill');

  const handleLogin = (userFromDb) => {
    setIsLoggedIn(true);
    if (userFromDb) setUserInfo(userFromDb);
    
    const origin = location.state?.from?.pathname || '/';
    navigate(origin);
  };

  const handleCompleteSignUp = (data) => {
    setIsLoggedIn(true); 
    setRegistrationData(data); 
    navigate('/hospital-number'); 
  };

  const handleFinalRegistration = (finalData) => {
    setUserInfo({ ...registrationData, ...finalData }); 
    setRegistrationData(null); 
    navigate('/account'); 
  };

  const handleLogout = () => {
    setIsLoggedIn(false); 
    setUserInfo(null);
    setRegistrationData(null);
    navigate('/');
  };

  const handleFormSubmission = (data, nextStep) => {
    if (nextStep === "confirm") {
      setFormMode('confirm');
    } else if (nextStep === "fill") {
      setFormMode('fill');
    } else if (nextStep === "submit") {
      console.log("Saving Appointment:", data);
      setFormMode('fill');
      navigate('/reservation-confirmation'); 
    }
  };

  const handleNavigation = (destination, data = null) => {
    if (destination === 'registerNumber') navigate('/register-number');
    if (destination === 'generatedNumber') navigate('/generated-number', { state: data });
    if (destination === 'account') navigate('/account');
  };

  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
  };

  const showHeader = location.pathname !== '/login' && location.pathname !== '/signup';

  return (
    <div className="min-h-screen bg-white font-sans relative">
      {showHeader && (
        <Header 
          isLoggedIn={isLoggedIn} 
          currentPage={location.pathname} 
        />
      )}

      <main className={showHeader ? "pt-0" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home onReserveGeneral={() => navigate('/general-form')} />} />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/login" element={<Login setIsLoggedIn={handleLogin} />} />
          <Route path="/signup" element={<SignUp onCompleteSignup={handleCompleteSignUp} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Protected Routes */}
          <Route path="/departments" element={<ProtectedRoute><DepartmentList onReserveGeneral={() => { setFormMode('fill'); navigate('/general-form'); }} onReserveSpecialty={() => { setFormMode('fill'); navigate('/specialty-form'); }} /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account userInfo={userInfo} onLogout={handleLogout} onUpdateProfile={setUserInfo} /></ProtectedRoute>} />
          <Route path="/hospital-number" element={<ProtectedRoute><HospitalNumber onNavigate={handleNavigation} /></ProtectedRoute>} />
          <Route path="/register-number" element={<ProtectedRoute><RegisterHospitalNumber initialData={registrationData} onFinalSubmit={handleFinalRegistration} /></ProtectedRoute>} />
          <Route path="/generated-number" element={<ProtectedRoute><GeneratedHospitalNumber onNavigate={handleNavigation} /></ProtectedRoute>} />
          <Route path="/prevAppt" element={<ProtectedRoute><AppointmentHistory /></ProtectedRoute>} />
          <Route path="/inbox" element={<ProtectedRoute><Inbox userInfo={userInfo} /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/appointment-confirmed" element={<ProtectedRoute><AppointmentConfirmed /></ProtectedRoute>} />
          <Route path="/appointment-cancelled" element={<ProtectedRoute><AppointmentCancelled /></ProtectedRoute>} />

          <Route path="/reschedule/:appointmentId" element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
                <RescheduleForm userInfo={userInfo} />
            </ProtectedRoute>
          } />
          
          <Route path="/general-form" element={
            <ProtectedRoute>
              <GeneralForm userInfo={userInfo} mode={formMode} onConfirm={handleFormSubmission} />
            </ProtectedRoute>
          } />

          <Route path="/specialty-form" element={
            <ProtectedRoute>
              <SpecialtyForm userInfo={userInfo} mode={formMode} onConfirm={handleFormSubmission} />
            </ProtectedRoute>
          } />

          <Route path="/reservation-confirmation" element={
            <ProtectedRoute>
              <ReservationConfirmation userInfo={userInfo} />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

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