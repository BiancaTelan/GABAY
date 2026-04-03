import Button from '../components/button';
import { X } from 'lucide-react';

export default function AppointmentDetailsModal({ isOpen, onClose, patient, onAddToQueue, onNoShow }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <div className="relative mb-4">
          <h3 className="font-montserrat text-2xl font-bold text-gabay-blue text-center">
            Appointment Details
          </h3>
          <button
            onClick={onClose}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="mb-6 space-y-2">
          <p className="font-poppins text-center">
            <span className="font-semibold">Hospital #:</span> {patient.hospitalNumber}
          </p>
          <p className="font-poppins text-center">
            <span className="font-semibold">Patient Name:</span> {patient.name}
          </p>
          <p className="font-poppins text-center">
            <span className="font-semibold">Reason:</span> {patient.reason}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="teal"
            onClick={() => onAddToQueue(patient)}
            className="flex-1 py-2 px-4"
          >
            ADD TO QUEUE
          </Button>
          <Button
            variant="red"
            onClick={() => onNoShow(patient)}
            className="flex-1 py-2 px-4"
          >
            NO-SHOW
          </Button>
        </div>
      </div>
    </div>
  );
}