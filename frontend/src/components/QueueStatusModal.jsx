import Button from '../components/button';
import { X } from 'lucide-react';

export default function QueueStatusModal({ isOpen, onClose, patient, onUpdate }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <div className="relative mb-4">
          <h3 className="font-montserrat text-2xl font-bold text-gabay-blue text-center">Update Status</h3>
          <button onClick={onClose} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="mb-6">
          <p className="font-poppins text-center">
            <span className="font-semibold text-md">Patient:</span> {patient.name}
          </p>
          <p className="font-poppins text-center">
            <span className="font-semibold text-md">Hospital #:</span> {patient.hospitalNumber}
          </p>
        </div>
        <div className="flex justify-center gap-3 ">
          <Button
            variant="teal"
            onClick={() => onUpdate(patient, 'completed')}
          >
            COMPLETED
          </Button>
          <Button
            variant="outline"
            onClick={() => onUpdate(patient, 'serving')}
            className="px-8 py-1.5 rounded-full border border-gabay-teal text-sm text-gabay-teal font-semibold hover:bg-teal-50 transition-all"
          >
            CURRENTLY SERVING
          </Button>
        </div>
      </div>
    </div>
  );
}