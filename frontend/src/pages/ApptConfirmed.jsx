import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../assets/caintaHospitalLogo.png';

export default function AppointmentConfirmed() {
  const navigate = useNavigate();
  const location = useLocation();
 
  const { patientName, department, date, doctor } = location.state || {
    patientName: 'Juan Dela Cruz',
    department: 'Internal Medicine',
    date: '03/16/2026',
    doctor: 'Dr. Ritchie Cruz',
  };

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12 bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <div className="flex items-center justify-center gap-4 mb-20">
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

        <h2 className="font-montserrat font-bold text-3xl text-green-500 text-center mb-6">
          Appointment Confirmed
        </h2>
        <p className="font-poppins text-center text-lg text-gabay-navy mb-10">
          For Patient: <span className="font-semibold">{patientName}</span>
        </p>
        <p className="font-poppins text-center text-lg mb-10">
          Thank you for confirming! Please attend your {department} consultation on the scheduled appointment date{' '}
          <span className="font-semibold text-gabay-teal">{date}</span> with <span className="font-semibold text-gabay-teal">{doctor}</span>.
        </p>

        <div className="flex justify-end">
          <button
            onClick={() => navigate('/')}
            className="font-poppins flex items-center text-gabay-blue font-medium text-lg hover:underline group"
          >
            RETURN TO HOMEPAGE
            <span className="ml-2 transform group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}