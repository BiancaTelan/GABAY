import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './button';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, doctorName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 font-poppins">
        <div className="p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-gabay-blue mb-2">Remove Doctor?</h3>
          <p className="text-sm text-gray-500 mb-6">
            Are you sure you want to remove <span className="font-bold text-gabay-navy">Dr. {doctorName}</span>? This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <Button 
              variant="teal-outline"
              onClick={onClose}
              className="flex-1 px-4 py-2.5"
            >
              CANCEL
            </Button>
            <Button 
              variant='red'
              type='submit'
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5"
            >
              DELETE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};