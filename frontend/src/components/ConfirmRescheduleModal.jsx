import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Button from './button';

export default function ConfirmRescheduleModal({
  isOpen,
  onClose,
  patientName,
  dateTime,
  reason,
  onConfirm,
  loading = false,
}) {
  if (!isOpen) return null;

  const handleConfirmAction = async () => {
    try {
      await onConfirm();
      toast.success('Appointment Rescheduled Successfully!', {
        duration: 2000,
        position: 'top-center',
        style: {
          fontFamily: 'Poppins, sans-serif',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
      onClose();
    } catch (error) {
      toast.error('Failed to reschedule. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-150">
        <h3 className="font-montserrat text-2xl font-bold text-gabay-blue text-center mb-6">
          Confirm Rescheduling
        </h3>
        
        <div className="text-center space-y-2">
          <p className="font-poppins text-gabay-navy">
            You are rescheduling <span className="font-semibold text-gabay-navy">{patientName}</span> for:
          </p>
          <p className="font-poppins text-gabay-navy font-bold text-xl">
            {dateTime}
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mt-6">
          <p className="font-poppins text-sm text-gabay-navy">
            <span className="font-semibold uppercase text-lg text-gabay-navy text-center block mb-1">Reason:</span> 
          </p>
          <p className="font-poppins text-center text-gabay-navy leading-relaxed text-md">
            {reason || "No reason provided."}
          </p>
        </div>
        
        <p className="font-poppins text-md text-gray-500 italic mt-8 text-center">
          An automated alert will be sent via Email.
        </p>

        <div className="flex gap-3 mt-4">
          <Button 
            variant="teal" 
            onClick={handleConfirmAction} 
            disabled={loading} 
            className="flex-1 py-2 font-poppins"
          >
            {loading ? 'Processing...' : 'Confirm & Notify'}
          </Button>
          <Button 
            variant="teal-outline" 
            onClick={onClose} 
            disabled={loading}
            className="flex-1 py-2 font-poppins"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}