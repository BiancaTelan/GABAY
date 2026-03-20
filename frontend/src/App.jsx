import React, { useState, useContext } from 'react'; 
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthContext } from './authContext';
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
import Footer from './components/footer';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminSidebar from './components/AdminSidebar';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() { 
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useContext(AuthContext);

  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [registrationData, setRegistrationData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [formMode, setFormMode] = useState('fill');

  const isAdminPage = location.pathname.startsWith('/admin');


  const handleLogin = (userFromDb) => {
    setIsLoggedIn(true);
    if (userFromDb) setUserInfo(userFromDb);
    navigate('/home');
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

  const handleFormSubmission = async (data, appointmentType) => {
    try {
      const payloadToken = JSON.parse(atob(token.split('.')[1]));
      const userEmail = payloadToken.sub;

      const payload = new FormData();
      payload.append('email', userEmail);
      payload.append('department', data.department);
      payload.append('doctor_name', data.doctor || "NONE");

      const formatSafeDate = (dateObj) => {
        const d = new Date(dateObj);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().split('T')[0];
      };

      payload.append('preferredStartDate', formatSafeDate(data.startDate));
      if (data.endDate) {
        payload.append('preferredEndDate', formatSafeDate(data.endDate));
      }

      payload.append('reason', data.reason);
      payload.append('hasPreviousRecord', data.hasPreviousRecord);
      payload.append('appointment_type', appointmentType);

      if (data.referralImage) {
        payload.append('referral_file', data.referralImage);
      }

      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        body: payload
      });

      const textResponse = await response.text();
      let result;
      try {
        result = textResponse ? JSON.parse(textResponse) : {};
      } catch (err) {
        throw new Error("Server encountered an error. Check the Python backend terminal.");
      }

      if (!response.ok) {
        const errorMessage = Array.isArray(result.detail) 
          ? JSON.stringify(result.detail, null, 2) 
          : result.detail || "Failed to submit reservation.";
          
        throw new Error(errorMessage);
      }
      // ------------------------------

      setFormMode('fill');
      navigate('/reservation-confirmation'); 

    } catch (error) {
      console.error("Booking Error:", error);
      alert(error.message); 
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
      {showHeader && !isAdminPage && (
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

        {/* --- ADMIN ROUTES --- */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        {/* <Route path="users" element={<UserMgmt />} />
        <Route path="personnel" element={<PersonnelMgmt />} />
        <Route path="departments-mgmt" element={<DepartmentsMgmt />} />
        <Route path="appointments-mgmt" element={<AppointmentssMgmt />} /> 
        
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="system-logs" element={<SystemLogs />} />
        <Route path="reports" element={<Reports />} />
        
        <Route path="a-settings" element={<AdminSettings />} />
        <Route path="a-help" element={<AdminHelp />} />
        <Route path="a-account" element={<AdminAccount />} />
        <Route path="a-notifs" element={<AdminNotifications />} />
        <Route path="a-calendar" element={<AdminCalendar />} />
        <Route path="a-tools" element={<AdminTools />} />*/}
        
        </Route>


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
      {showHeader && !isAdminPage && <Footer />}
    </div>
  );
}

export default App;