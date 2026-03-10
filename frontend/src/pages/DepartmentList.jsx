import generalbg from '../assets/generalbg.png';
import specialtybg from '../assets/specialtybg.png';

export default function DepartmentList({ onNavigate, onReserveGeneral, onReserveSpecialty }) {
  const handleReserveGeneral = () => {
    console.log('Reserve general appointment');
    onNavigate('generalDepartments');
  };

  const handleReserveSpecialty = () => {
    console.log('Reserve specialty appointment');
    onNavigate('specialtyDepartments');
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-[calc(100vh-64px)] px-4 py-12 bg-gray-50">
      <div className="w-full max-w-6xl">
        <h1 className="font-montserrat font-bold text-[40px] text-[#2E5EB5] text-center">
          Department List
        </h1>
        <p className="font-poppins text-center mt-2 text-lg">
          Choose from the available outpatient departments supported by GABAY.
        </p>

        <div className="flex flex-col md:flex-row gap-6 mt-12">
          <div
            className="flex-1 rounded-xl shadow-md overflow-hidden relative"
            style={{ backgroundImage: `url(${generalbg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="absolute inset-0 bg-black/50"></div>
            
            <div className="relative z-10 p-8 flex flex-col text-white">
              <h2 className="font-montserrat font-bold text-2xl text-white mb-8">
                General Departments
              </h2>
              <p className="font-poppins text-gray-100 text-sm leading-relaxed">
                Provides consultations for common
                <br />
                health concerns and illnesses
              </p>
              <div className="mt-4 mb-10">
                <p className="font-poppins text-white text-sm">
                  For <strong className="font-bold">FIRST TIME</strong> or <strong className="font-bold">FOLLOW UP</strong>
                </p>
              </div>
              <button 
                onClick={onReserveGeneral}
                className="font-poppins text-white font-semibold text-lg hover:underline group text-left">
                RESERVE A GENERAL APPOINTMENT
                <span className="ml-2 inline-block transform group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>

          <div
            className="flex-1 rounded-xl shadow-md overflow-hidden relative"
            style={{ backgroundImage: `url(${specialtybg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="absolute inset-0 bg-black/50"></div>

            <div className="relative z-10 p-8 flex flex-col text-white">
              <h2 className="font-montserrat font-bold text-2xl text-white mb-8">
                Specialty Departments
              </h2>
              <p className="font-poppins text-gray-100 text-sm leading-relaxed">
                Provides consultations for common
                <br />
                health concerns and illnesses
              </p>
              <div className="mt-4 mb-10">
                <p className="font-poppins text-white text-sm">
                  Strictly <strong className="font-bold">REFERRALS ONLY</strong>
                </p>
              </div>
              <button 
                onClick={onReserveSpecialty}
                className="font-poppins text-white font-semibold text-lg hover:underline group text-left">
                RESERVE A SPECIALTY APPOINTMENT
                <span className="ml-2 inline-block transform group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}