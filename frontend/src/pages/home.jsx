import caintaHeader from '../assets/caintaHeader.png';

export default function Home() {
  return (
    <div className="bg-white font-sans">
      <section className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
        
        <div className="flex-1 flex flex-col justify-center px-10 lg:px-20 py-12">
          <h1 className="text-4xl lg:text-6xl font-bold text-gabay-blue leading-tight mb-4">
            General to Specialty <br />
            Appointment & <br />
            Booking Assistant for You
          </h1>
          
          <h2 className="text-2xl lg:text-3xl font-semibold text-gabay-navy mb-8">
            Your health, our priority.
          </h2>
          
          <p className="text-gray-600 text-lg lg:text-xl max-w-lg mb-10 leading-relaxed">
            With GABAY, we will guide you in scheduling an appointment from 
            Cainta Municipal Hospital's outpatient departments (OPD). 
            Click the link below to get started!
          </p>
          
          <button className="flex items-center text-gabay-blue font-bold text-lg hover:underline group">
            Head to Department List 
            <span className="ml-2 transform group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <img 
            src={caintaHeader} 
            alt="Cainta Municipal Hospital" 
            className="w-full h-full object-cover"
          />
          {/* Subtle white gradient overlay to blend with the left side */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent hidden md:block" />
        </div>
      </section>

      {/* Additional sections (Departments, etc.) can go here */}
    </div>
  );
}