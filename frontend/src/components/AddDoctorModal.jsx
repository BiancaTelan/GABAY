import React, { useState } from 'react';
import { X, User, Save } from 'lucide-react';
import Button from './button';

export default function AddDoctorModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    role: 'Doctor'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ name: '', role: 'Doctor' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm font-poppins">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 text-left">
        
        <div className="p-5 flex items-center border-b border-gray-50">
          <div className="w-10"></div> {/* Left Spacer */}
          <h3 className="flex-1 text-center font-montserrat font-bold uppercase tracking-wide text-lg text-gabay-blue">
            Register New Doctor
          </h3>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <User size={18} className="text-gabay-teal" /> Full Name
            </label>
            <input 
              required
              type="text" 
              placeholder="e.g. Dela Cruz, Juan"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gabay-navy outline-none focus:ring-2 focus:ring-gabay-teal/20 focus:border-gabay-teal transition-all"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              variant="teal-outline"
              type="button" 
              onClick={onClose}
              className="flex-1 py-3"
            >
              Cancel
            </Button>
            <Button 
              variant="teal" 
              type="submit" 
              className="flex-1 py-3 flex items-center justify-center gap-2"
            >
              <Save size={18} /> SAVE DOCTOR
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};