import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, AlertCircle, AlertTriangle } from 'lucide-react';

export default function DisableModal({ isOpen, onClose, onConfirm, title, message, placeholder = "Enter reason here..." }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Please provide a reason for this action.");
      return;
    }
    onConfirm(reason); 
    setReason('');
    setError('');
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative font-poppins animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-red-50 text-red-500 rounded-full mb-4">
            <AlertTriangle size={30} />
          </div>
          <h2 className="text-xl font-bold text-gabay-navy font-montserrat">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{message}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gabay-blue uppercase tracking-wider">Reason for Action <span className="text-red-500">*</span></label>
          <textarea 
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(''); }}
            placeholder={placeholder}
            rows="4"
            className={`w-full border-2 rounded-xl p-3 text-sm outline-none transition-all resize-none ${
              error ? 'border-red-500 bg-red-50/30' : 'border-gray-100 focus:border-gabay-teal'
            }`}
          />
          {error && <p className="text-[10px] text-red-500 font-semibold">{error}</p>}
        </div>

        <div className="flex gap-3 pt-6">
          <button onClick={onClose} className="flex-1 py-2.5 border-2 rounded-full border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition-all text-sm uppercase">Cancel</button>
          <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-semibold hover:bg-gabay-red shadow-lg transition-all text-sm uppercase">Disable</button>
        </div>
      </div>
    </div>,
    document.body
  );
}