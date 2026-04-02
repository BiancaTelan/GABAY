import { useNavigate } from 'react-router-dom';
import caintaLanding from '../assets/caintaLanding.png';
import introimage1 from '../assets/intro1.png'; 
import introimage2 from '../assets/intro2.png';
import lists from '../assets/lists.png';
import send from '../assets/send.png';
import checkCircle from '../assets/checkCircle.png';
import plus from '../assets/plus.png';
import like from '../assets/like.png';
import calendarCheck from '../assets/calendarCheck.png';


export default function Home() {
  const navigate = useNavigate();

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
          
          <button 
            onClick={() => navigate('/departments')}
            className="font-poppins flex items-center text-gabay-blue font-semibold text-lg hover:underline group"
          >
            Head to Department List 
            <span className="ml-2 p-3 transform group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>

        <div className="flex-1 relative h-full">
          <img 
            src={caintaLanding} 
            alt="Cainta Municipal Hospital" 
            className="w-full h-full object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent hidden md:block" />
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-montserrat text-4xl lg:text-6xl font-bold text-gabay-blue leading-tight mb-4 mt-20 text-center">
            Introduction to GABAY
          </h2>
          <p className="font-poppins text-lg mt-6 mb-12 text-center text-gray-600">
            Here’s a background about General-to-Specialty Appointment & Booking Assistant for You
          </p>

          <div className="flex flex-col md:flex-row gap-8 items-start mb-16">
            <div className="font-poppins text-lg flex-1 space-y-8 indent-first">
              <p>
                Access to vital healthcare services in the Philippines, especially in the municipality of Cainta, is often hindered by traditional appointment booking methods.
              </p>
              <p>
                Traditionally, many Filipinos have felt the need to go to hospitals very early—sometimes even before sunrise—to line up for a check-up slot.
              </p>
            </div>
            <div className="flex-1">
              <img 
                src={introimage1} 
                alt="Traditional queuing" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 order-2 md:order-1">
              <img 
                src={introimage2} 
                alt="GABAY solution" 
                className="w-full h-full rounded-lg object-cover"
              />
            </div>
            <div className="font-poppins text-lg flex-1 space-y-8 order-1 md:order-2 indent-first">
              <p>
                Given the continuous growth of technology, researchers will need to implement new systems that simplify people’s lives, especially in healthcare. Researchers will value the citizens’ lives, which is why they will propose a clear solution to this major problem: the long queue.
              </p>
              <p>
                GABAY will address the queuing problem and use modern technology to save people valuable time, lessening their worries about missing their much-needed check-up.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-montserrat text-4xl lg:text-6xl font-bold text-gabay-blue leading-tight mb-4 mt-15 text-center">
            How to book a reservation?
          </h2>
          <p className="font-poppins text-gray-600 text-lg text-center max-w-4xl mx-auto mt-6 mb-20">
            Get started with your scheduled consultation at Cainta Municipal Hospital in three steps.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex-1 bg-white rounded-xl shadow-md p-8 border-2 border-gabay-blue">
              <h3 className="font-poppins text-xl font-semibold text-gabay-teal mb-3 text-left">
                Step One
              </h3>
              <p className="font-montserrat text-2xl text-gabay-navy font-bold mb-2 text-left">
                Choose a Department
              </p>
              <img src={lists} alt="Lists icon" className="w-20 h-20 mb-4 mt-12 mx-auto object-contain" />
              <p className="font-poppins text-gabay-navy text-left">
                Head to the Departments link in the navigation bar and select your designated choice
              </p>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-md p-8 border-2 border-gabay-blue">
              <h3 className="font-poppins text-xl font-semibold text-gabay-teal mb-3 text-left">
                Step Two
              </h3>
              <p className="font-montserrat text-2xl text-gabay-navy font-bold mb-2 text-left">
                Submit the Required Forms
              </p>
              <img src={send} alt="Send icon" className="w-20 h-20 mb-4 mt-4 mx-auto object-contain" />
              <p className="font-poppins text-gabay-navy text-left">
                Complete updating your account with valid details and fill up the reservation form
              </p>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-md p-8 border-2 border-gabay-blue">
              <h3 className="font-poppins text-xl font-semibold text-gabay-teal mb-3 text-left">
                Step Three
              </h3>
              <p className="font-montserrat text-2xl text-gabay-navy font-bold mb-2 text-left">
                Wait for Confirmation
              </p>
              <img src={checkCircle} alt="Check Circle icon" className="w-20 h-20 mb-4 mt-12 mx-auto object-contain" />
              <p className="font-poppins text-gabay-navy text-left">
                Ensure your contact information is correct and wait for the updates regarding your reservation
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white pb-32">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-montserrat text-4xl lg:text-6xl font-bold text-gabay-blue leading-tight mb-4 mt-15 text-center">
            Healthcare made simple.
          </h2>
          <p className="font-poppins text-gray-600 text-lg text-center max-w-4xl mx-auto mt-6 mb-20">
            GABAY is an alternative option to Cainta Municipal’s manual booking process.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex-1 bg-white rounded-xl shadow-md p-8 border-2 border-gabay-blue">
              <img src={plus} alt="Plus icon" className="w-20 h-20 mb-4 mt-4 mx-auto object-contain" />
              <p className="font-montserrat text-2xl text-gabay-navy text-center font-bold mt-12 mb-6">
                Assistive
              </p>
              <p className="font-poppins text-gabay-navy text-center">
                GABAY’s main objective is to make booking appointments easier
              </p>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-md p-8 border-2 border-gabay-blue">
              <img src={like} alt="Like icon" className="w-20 h-20 mb-4 mt-4 mx-auto object-contain" />
              <p className="font-montserrat text-2xl text-gabay-navy text-center font-bold mt-12 mb-6">
                User-Friendly
              </p>
              <p className="font-poppins text-gabay-navy text-center">
                With user experience in mind, page navigation is simplified
              </p>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-md p-8 border-2 border-gabay-blue">
              <img src={calendarCheck} alt="Calendar Check icon" className="w-20 h-20 mb-4 mt-4 mx-auto object-contain" />
              <p className="font-montserrat text-2xl text-gabay-navy text-center font-bold mt-12 mb-6">
                Transparent
              </p>
              <p className="font-poppins text-gabay-navy text-center">
                We’ll notify you of your reservation status as soon as possible
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}