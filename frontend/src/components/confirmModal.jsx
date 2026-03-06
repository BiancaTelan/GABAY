import React from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, type = "danger" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 font-poppins px-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-down">
        <div className="flex flex-col items-center text-center">
          <div className={`p-3 rounded-full mb-4 ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-teal-50 text-gabay-teal'}`}>
            {type === 'danger' ? <AlertTriangle size={32} /> : <LogOut size={32} />}
          </div>
          <h3 className="text-xl font-bold text-gabay-navy mb-2 font-montserrat">{title}</h3>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">{message}</p>
          
          <div className="flex gap-3 w-full">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-xl text-white font-semibold shadow-md transition-all text-sm ${
                type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-gabay-teal hover:bg-teal-600'
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}