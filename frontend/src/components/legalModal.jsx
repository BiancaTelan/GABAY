import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function LegalModal({ isOpen, onClose, type }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = {
    privacy: {
      title: 'Privacy Policy',
      text: (
        <>
          <p>At GABAY, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our appointment booking platform.</p>
          <h3 className="font-semibold text-gabay-teal mt-4">Information We Collect</h3>
          <p>We may collect personal information such as your name, email address, hospital number, and appointment details when you register or make a reservation.</p>
          <h3 className="font-semibold text-gabay-teal mt-4">How We Use Your Information</h3>
          <p>We use the information to process your appointments, communicate with you, improve our services, and comply with legal obligations.</p>
          <h3 className="font-semibold text-gabay-teal mt-4">Data Security</h3>
          <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
          <h3 className="font-semibold text-gabay-teal mt-4">Changes to This Policy</h3>
          <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.</p>
        </>
      ),
    },
    terms: {
      title: 'Terms of Service',
      text: (
        <>
          <p>Welcome to GABAY! By using our platform, you agree to comply with and be bound by the following terms and conditions.</p>
          <h3 className="font-semibold text-gabay-teal mt-4">Use of Our Service</h3>
          <p>You agree to use GABAY only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use of the service.</p>
          <h3 className="font-semibold text-gabay-teal mt-4">Appointment Reservations</h3>
          <p>Appointment slots are subject to availability. We reserve the right to cancel or reschedule appointments due to unforeseen circumstances.</p>
          <h3 className="font-semibold text-gabay-teal mt-4">User Accounts</h3>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          <h3 className="font-semibold text-gabay-teal mt-4">Limitation of Liability</h3>
          <p>GABAY is not liable for any damages arising from the use of our service, including but not limited to direct, indirect, incidental, or consequential damages.</p>
          <h3 className="font-semibold text-gabay-teal mt-4">Changes to Terms</h3>
          <p>We may modify these Terms of Service at any time. Continued use of the platform constitutes acceptance of the revised terms.</p>
        </>
      ),
    },
  };

  const current = content[type];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="font-montserrat text-2xl font-bold text-gabay-blue text-center flex-1">{current.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-2 text-gray-700">{current.text}</div>
      </div>
    </div>
  );
}