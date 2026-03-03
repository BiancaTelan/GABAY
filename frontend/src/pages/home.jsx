import caintaLanding from '../assets/caintaLanding.png';

export default function Home() {
  return (
    <div className="bg-white font-sans">
      <section className="flex flex-col md:flex-row h-[800px] overflow-hidden">
        
        <div className="flex-1 flex flex-col justify-center px-10 lg:px-20 py-8">
          <h1 className="font-montserrat text-4xl lg:text-6xl font-bold text-gabay-blue leading-tight mb-4">
            General to Specialty <br />
            Appointment & <br />
            Booking Assistant for You
          </h1>
          
          <h2 className="font-montserrat text-2xl lg:text-3xl font-bold text-gabay-navy mb-8">
            Your health, our priority.
          </h2>
          
          <p className="font-poppins text-gray-600 text-lg lg:text-xl max-w-lg mb-10 leading-relaxed">
            With GABAY, we will guide you in scheduling an appointment from 
            Cainta Municipal Hospital's outpatient departments (OPD). 
            Click the link below to get started!
          </p>
          
          <button className="font-poppins flex items-center text-gabay-blue font-semibold text-lg hover:underline group">
            Head to Department List 
            <span className="ml-2 transform group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>

        <div className="flex-1 relative">
          <img 
            src={caintaLanding} 
            alt="Cainta Municipal Hospital" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent hidden md:block" />
        </div>
      </section>

      {/* PLACE L.P. SECTIONS 1, 2, & 3 HERE */}
    </div>
  );
}