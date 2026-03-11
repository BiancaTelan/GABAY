import { useNavigate } from 'react-router-dom';
import Logo from '../assets/caintaHospitalLogo.png';

export default function ReservationConfirmation({ userInfo }) {
  const navigate = useNavigate();
  const email = userInfo?.email || 'juandelacruz@gmail.com';

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
       
        <h2 className="font-montserrat font-bold text-4xl text-gabay-blue text-center mb-6">
          Submission Complete
        </h2>

        <p className="font-poppins text-center text-gray-700 mb-10">
          <span className="font-semibold">Email Address:</span> {email}
        </p>

        <p className="font-poppins text-lg text-center mb-10">
          Thank you for using GABAY! Kindly wait for your reserved schedule to be{' '}
          <span className="font-bold text-gabay-teal">APPROVED</span> by hospital staff.{' '}
          Further updates will be sent to your email address and inbox.
        </p>

        <div className="flex justify-end">
          <button
            onClick={() => navigate('/prevAppt')}
            className="font-poppins flex items-center text-gabay-blue font-medium text-lg hover:underline group"
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