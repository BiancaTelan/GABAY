import caintaBg from '../assets/caintaBg.png';

export default function SignUp({ onNavigate }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center font-sans">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${caintaBg})` }}
      />

      <div className="absolute inset-0 z-10 bg-black opacity-50" />

      <div className="relative z-20 flex flex-col md:flex-row w-full max-w-5xl bg-white shadow-2xl overflow-hidden md:rounded-2sm mx-4">
        
        <div className="hidden md:flex flex-1 bg-gabay-blue p-12 flex-col justify-center text-white">
          <h1 className="font-montserrat text-4xl font-bold leading-tight mb-6">
            General to Specialty Appointment & Booking Assistant for You
          </h1>
          <h2 className="font-montserrat text-xl font-semibold mb-6">Your health, our priority.</h2>
          <p className="font-poppins">
            A helpful guide to book your appointments in Cainta Municipal Hospital.
          </p>
        </div>


        <div className="flex-1 p-8 md:p-12 bg-white">
          <h3 className="font-montserrat text-3xl font-bold text-gabay-blue text-center mb-2">Sign Up</h3>
          <p className="font-poppins text-gray-500 text-center text-sm mb-8">Accomplish the form below to create an account</p>
          
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-poppins block text-sm font-medium text-gabay-navy mb-1">First Name</label>
                <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gabay-teal outline-none" placeholder="Juan" />
              </div>
              <div>
                <label className="font-poppins block text-sm font-medium text-gabay-navy mb-1">Last Name</label>
                <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gabay-teal outline-none" placeholder="Dela Cruz" />
              </div>
            </div>
            
            <button className="font-poppins w-full bg-gabay-teal text-white font-bold py-3 rounded-full mt-6 hover:bg-opacity-90 transition">
              SUBMIT
            </button>
          </form>

          <p className="text-center mt-4">
      Already have an account? 
      <button 
        onClick={() => onNavigate('login')} 
        className="text-gabay-blue font-bold ml-1 hover:underline"
      >
        Log In
      </button>
    </p>
        </div>
      </div>
    </div>
  );
}