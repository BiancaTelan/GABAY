import { useNavigate } from 'react-router-dom';
import Logo from '../assets/caintaHospitalLogo.png';

export default function GeneratedHospitalNumber() {
  const navigate = useNavigate();

  const handleConfirm = () => {
    console.log('Confirm clicked');
    navigate('/account');
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

        <div className="mb-6">
          <p className="font-montserrat text-4xl text-[#2E5EB5] text-center font-bold">Hospital Number</p>
          <p className="font-montserrat font-bold text-3xl text-[#33AFAE] text-center mt-1">
            26-154928
          </p>
          <p className="font-poppins text-center mt-2 mb-10">
            For Patient: <span className="font-semibold">Juan Dela Cruz</span>
          </p>
        </div>

        <div className="bg-gray-100 border-l-4 border-gray-400 p-4 mb-8 text-sm text-gray-700 rounded-r">
          <p className="font-poppins font-bold text-[#33AFAE]">PAALALA:</p>
          <p className= "font-poppins">
            Ito na po ang inyong <strong className="font-bold">PERMANENTENG</strong> numero dito sa BCMH. Kailangan po na ito ay <strong className="font-bold">PALAGI NINYONG DALA</strong> sa tuwina ninyong pagpapakonsulta o pagpunta dito sa ospital.
          </p>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleConfirm}
            className="font-poppins flex items-center text-gabay-blue font-semibold text-lg hover:underline group"
          >
            CONFIRM
            <span className="ml-2 transform group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}