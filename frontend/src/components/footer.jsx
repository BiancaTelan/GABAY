import { Link } from 'react-router-dom';
import { Facebook, MapPin } from 'lucide-react';
import { useState } from 'react';
import LegalModal from './legalModal';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('privacy');

   const openModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  return (
    <footer className="font-poppins bg-gabay-blue text-white py-8">
     <div className="px-4 md:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

        <div>
          <h3 className="text-white font-semibold text-lg mb-4">GABAY</h3>
          <p className="text-sm leading-relaxed">
            General to Specialty Appointment & Booking Assistant for You
          </p>
        </div>

        <div className="w-full sm:w-1/2 md:w-1/4 lg:w-auto ml-12 md:ml-16">
          <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:underline transition">Home</Link></li>
            <li><Link to="/departments" className="hover:underline transition">Departments</Link></li>
            <li><Link to="/help" className="hover:underline transition">Help</Link></li>
            <li><Link to="/contact" className="hover:underline transition">Contact Us</Link></li>
          </ul>
        </div>

        <div className="w-full sm:w-1/2 md:w-1/4 lg:w-auto ml-8 md:ml-12">
          <h3 className="text-white font-semibold text-lg mb-4">Services</h3>
          <ul className="space-y-2 text-sm">
            <li>General OPD</li>
            <li>Specialty OPD</li>
          </ul>
        </div>

        <div>
            <div className="flex items-start gap-2 mb-4 mt-10">
                <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                <address className="not-italic text-sm leading-relaxed">
                Municipal Compound, Brgy. Sto. Domingo, <br />
                Cainta, Rizal, 1900
                </address>
            </div>
            <a
                href="https://www.facebook.com/share/1HSB3oA9CA/?mibextid=wwXIfr"
                className="flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
            >
                <Facebook size={20} />
                <span className="text-sm hover:underline transition">Follow us on Facebook</span>
            </a>
        </div>
      </div>
    </div>

      <div className="border-t border-white mt-10 pt-6 text-center text-sm">
        © {currentYear} GABAY. All rights reserved.
        <span className="mx-2">|</span>
        <button
          onClick={() => openModal('privacy')}
          className="hover:underline transition"
        >
          Privacy Policy
        </button>
        <span className="mx-2">|</span>
        <button
          onClick={() => openModal('terms')}
          className="hover:underline transition"
        >
          Terms of Service
        </button>
      </div>
       <LegalModal isOpen={modalOpen} onClose={closeModal} type={modalType} />
    </footer>
  );
}