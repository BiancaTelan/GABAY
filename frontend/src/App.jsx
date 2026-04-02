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

import StaffLayout from './components/StaffLayout';
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffAppointments from './pages/staff/StaffAppointments';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import Personnel from './pages/admin/Personnel';
import Departments from './pages/admin/Departments';
import Appointments from './pages/admin/Appointments';
import AuditLogs from './pages/admin/AuditLogs';
import SystemLogs from './pages/admin/SystemLogs';


function App() { 
  const navigate = useNavigate();
  const location = useLocation();
  const { token, userRole, userInfo, logout } = useContext(AuthContext);
  
  const [registrationData, setRegistrationData] = useState(null);
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [formMode, setFormMode] = useState('fill');

  const isAdminPage = location.pathname.startsWith('/admin');
  const isLoggedIn = !!token;
  const isPatient = userRole === 'patient';
  const isStaff = userRole === 'staff';
  const isAdmin = userRole === 'admin';

  const handleCompleteSignUp = (data) => {
    setRegistrationData(data); 
    navigate('/hospital-number'); 
  };

  const handleFinalRegistration = (finalData) => {
    setRegistrationData(null); 
    navigate('/account'); 
  };

  const handleLogout = () => {
    logout();
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

  const PatientRoute = ({ children }) => {
    if (!isLoggedIn || !isPatient) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
  };

  const StaffRoute = ({ children }) => {
  if (!isLoggedIn || !isStaff) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
  };

   const AdminRoute = ({ children }) => {
    if (!isLoggedIn || !isAdmin) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return children;
  };

   const isLoginPage = ['/login', '/signup', '/admin/login'].includes(location.pathname);
   
   const isStaffPage = location.pathname.startsWith('/staff');
   const showHeader = !isLoginPage && !isAdminPage && !isStaffPage;   

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
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          {/* Protected Routes */}
          <Route element={<PatientRoute />}>
          <Route path="/departments" element={<DepartmentList onReserveGeneral={() => { setFormMode('fill'); navigate('/general-form'); }} onReserveSpecialty={() => { setFormMode('fill'); navigate('/specialty-form'); }} />} />
          <Route path="/account" element={<Account userInfo={userInfo} onLogout={handleLogout} onUpdateProfile={() => {}} />} />
          <Route path="/hospital-number" element={<HospitalNumber onNavigate={handleNavigation} />} />
          <Route path="/register-number" element={<RegisterHospitalNumber initialData={registrationData} onFinalSubmit={handleFinalRegistration} />} />
          <Route path="/generated-number" element={<GeneratedHospitalNumber onNavigate={handleNavigation} />} />
          <Route path="/prevAppt" element={<AppointmentHistory />} />
          <Route path="/inbox" element={<Inbox userInfo={userInfo} />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/appointment-confirmed" element={<AppointmentConfirmed />} />
          <Route path="/appointment-cancelled" element={<AppointmentCancelled />} />

          <Route path="/reschedule/:appointmentId" element={
                <RescheduleForm userInfo={userInfo} />
          } />
          
          <Route path="/general-form" element={
              <GeneralForm userInfo={userInfo} mode={formMode} onConfirm={handleFormSubmission} />
          } />

          <Route path="/specialty-form" element={
            <SpecialtyForm userInfo={userInfo} mode={formMode} onConfirm={handleFormSubmission} />
          } />

          <Route path="/reservation-confirmation" element={  
              <ReservationConfirmation userInfo={userInfo} />
          } />
        </Route>
          
        {/* STAFF ROUTES */}
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<StaffDashboard />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="appointments" element={<StaffAppointments />} />
        </Route>

        {/* ADMIN ROUTES */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="personnel" element={<Personnel />} />
            <Route path="departments" element={<Departments />} />
            <Route path="appointments" element={<Appointments />} /> 
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="system-logs" element={<SystemLogs />} />
            {/*<Route path="reports" element={<Reports />} />
            
            <Route path="a-settings" element={<AdminSettings />} />
            <Route path="a-help" element={<AdminHelp />} />
            <Route path="a-account" element={<AdminAccount />} />
            <Route path="a-notifs" element={<AdminNotifications />} />
            <Route path="a-calendar" element={<AdminCalendar />} />
            <Route path="a-tools" element={<AdminTools />} />*/}
          </Route>  
        
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
      {showHeader && !isAdminPage && !isStaffPage && <Footer />}
    </div>
  );
}

export default App;