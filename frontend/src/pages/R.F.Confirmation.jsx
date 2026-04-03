import { useNavigate } from 'react-router-dom';
import Logo from '../assets/caintaHospitalLogo.png';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../authContext';

export default function ReservationConfirmation() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  
  const [email, setEmail] = useState('');
  const [patientName, setPatientName] = useState('Loading...');

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!token) return;
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userEmail = payload.sub;
        setEmail(userEmail);

        const response = await fetch(`/api/patients/profile/${userEmail}`);
        if (response.ok) {
          const data = await response.json();
          setPatientName(`${data.firstname} ${data.surname}`);
        } else {
          setPatientName("Patient");
        }
      } catch (error) {
        console.error("Failed to fetch patient details:", error);
        setPatientName("Patient");
      }
    };

    fetchPatientDetails();
  }, [token]);

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12 bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl animate-in fade-in zoom-in duration-500">
        <div className="flex items-center justify-center gap-4 mb-16">
          <img src={Logo} alt="Hospital Logo" className="w-16 h-16 object-contain" />
          <div>
            <h1 className="font-montserrat font-bold text-2xl">
              CAINTA MUNICIPAL HOSPITAL
            </h1>
            <p className="font-poppins text-gray-600 text-sm mt-1">
              No. 73 A. Bonifacio Ave. Brgy. Sto. Domingo, Cainta, Rizal, 1900
            </p>
          </div>
        </div>
        
        <h2 className="font-montserrat font-bold text-4xl text-gabay-blue text-center mb-6">
          Submission Complete
        </h2>

        <div className="bg-teal-50 rounded-lg p-6 mb-8 text-center border border-teal-100">
          <p className="font-poppins text-gray-800 text-lg mb-2">
            <span className="font-bold text-gabay-navy">Patient Name:</span> {patientName}
          </p>
          <p className="font-poppins text-gray-800 text-lg">
            <span className="font-bold text-gabay-navy">Email Address:</span> {email}
          </p>
        </div>

        <p className="font-poppins text-lg text-center mb-10 leading-relaxed">
          Thank you for using GABAY! Kindly wait for your reserved schedule to be{' '}
          <span className="font-bold text-gabay-teal">APPROVED</span> by hospital staff.{' '}
          Further updates will be sent to your email address and inbox.
        </p>

        <div className="flex justify-end">
          <button
            onClick={() => navigate('/prevAppt')}
            className="font-poppins flex items-center text-gabay-blue font-bold text-lg hover:text-gabay-navy transition-colors group"
          >
            VIEW RESERVATION STATUS
            <span className="ml-2 transform group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}