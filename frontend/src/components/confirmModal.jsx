import React from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, LogOut, Info } from 'lucide-react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, type = "danger" }) {
  if (!isOpen) return null;

  const isDanger = type === 'danger';
  const isWarning = type === 'warning';
  const isInfo = type === 'info';

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 font-poppins px-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100"
      >
        <div className="flex flex-col items-center text-center">
          
          <div className={`p-4 rounded-full mb-4 ${
            (isDanger || isWarning) ? 'bg-red-50 text-gabay-red' : 'bg-teal-50 text-gabay-teal'
          }`}>
            {(isDanger || isWarning) ? <AlertTriangle size={36} /> : <LogOut size={36} />}
          </div>

          <h3 className={`text-xl font-bold mb-2 font-montserrat ${
            (isDanger || isWarning) ? 'text-gabay-red' : 'text-gabay-navy'
          }`}>
            {title}
          </h3>
          
          <p className="text-gray-500 text-sm mb-8 leading-relaxed px-2">
            {message}
          </p>
          
          <div className="flex gap-3 w-full">
            {!isWarning && (
              <button 
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all text-sm uppercase tracking-wide"
              >
                Cancel
              </button>
            )}
            
            <button 
              onClick={() => { onConfirm(); onClose(); }}
              className={`flex-1 py-2.5 rounded-xl text-white font-bold shadow-md transition-all text-sm uppercase tracking-wide ${
                (isDanger || isWarning) 
                  ? 'bg-gabay-red hover:bg-gabay-red2 shadow-red-200' 
                  : 'bg-gabay-teal hover:bg-teal-600 shadow-teal-200'
              }`}
            >
              {isWarning ? "Understood" : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}