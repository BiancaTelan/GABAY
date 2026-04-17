import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactDOM from 'react-dom';

export default function AddPersonnel({ isOpen, onClose, editData = null }) {
  const modalRef = useRef();

  const initialState = {
    firstName: '',
    lastName: '',
    role: 'STAFF',
    department: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({ ...initialState, ...editData, password: '', confirmPassword: '' });
    } else {
      setFormData(initialState);
    }
  }, [editData, isOpen]);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResetPassword = () => {
    toast.success(`Password reset link sent to ${formData.email}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editData && formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    try {
      if (editData) {
        toast.success("Account updated successfully!");
      } else {
        toast.success("Account created! Activation email sent.");
      }
      onClose();
    } catch (err) {
      toast.error("Failed to process request.");
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[10000] h-screen w-screen flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative font-poppins text-left"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>

        <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-gabay-teal text-center mb-6 md:mb-8 text-gabay-teal">
          {editData ? 'Edit Account' : 'Account Information'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gabay-blue">First Name <span className="text-red-500">*</span></label>
              <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="w-full border-2 border-gray-100 rounded-lg px-4 py-2 text-sm focus:border-gabay-teal outline-none transition-colors" placeholder="Juan" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gabay-blue">Last Name <span className="text-red-500">*</span></label>
              <input required name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="w-full border-2 border-gray-100 rounded-lg px-4 py-2 text-sm focus:border-gabay-teal outline-none transition-colors" placeholder="Dela Cruz" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gabay-blue">Role <span className="text-red-500">*</span></label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-lg px-4 py-2 text-sm focus:border-gabay-teal outline-none bg-white">
                <option value="STAFF">STAFF</option>
                <option value="DOCTOR">DOCTOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gabay-blue">Department <span className="text-red-500">*</span></label>
              <select required name="department" value={formData.department} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-lg px-4 py-2 text-sm focus:border-gabay-teal outline-none bg-white">
                <option value="">Select Department</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dentistry">Dentistry</option>
                <option value="Internal Medicine">Internal Medicine</option>
                <option value="Pediatrics">Pediatrics</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gabay-blue">Email Address <span className="text-red-500">*</span></label>
              <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full border-2 border-gray-100 rounded-lg px-4 py-2 text-sm focus:border-gabay-teal outline-none" placeholder="juan@email.com" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gabay-blue">Contact Number <span className="text-red-500">*</span></label>
              <input required name="contactNumber" value={formData.contactNumber} onChange={handleChange} type="tel" className="w-full border-2 border-gray-100 rounded-lg px-4 py-2 text-sm focus:border-gabay-teal outline-none" placeholder="09123456789" />
            </div>
          </div>

          {!editData ? (
            <div className="space-y-4 pt-2 animate-in slide-in-from-top-1">

            <div className="relative space-y-1">
                <label className="text-sm font-medium text-gabay-blue">Initial Password <span className="text-red-500">*</span></label>
                <div className="relative"> 
                <input 
                    required 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    type={showPassword ? "text" : "password"} 
                    className="w-full border-2 border-gray-100 rounded-lg px-4 py-2 text-sm focus:border-gabay-teal outline-none hide-password-toggle" 
                />
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gabay-teal transition-colors"
                >
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
                </div>
            </div>

            <div className="relative space-y-1">
                <label className="text-sm font-medium text-gabay-blue">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative">
                <input 
                    required 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    type={showPassword ? "text" : "password"} 
                    className="w-full border-2 border-gray-100 rounded-lg px-4 py-2 text-sm focus:border-gabay-teal outline-none hide-password-toggle" 
                />
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gabay-teal transition-colors"
                >
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
                </div>
            </div>
            </div>
          ) : (
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="text-gray-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs font-bold text-gabay-blue uppercase tracking-wider">Account Security</p>
                    <p className="text-[10px] text-gray-500 leading-tight">Admin cannot edit passwords directly.</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={handleResetPassword}
                  className="w-full sm:w-auto px-4 py-1.5 bg-white border border-gabay-teal text-gabay-teal text-[10px] font-bold rounded-lg hover:bg-teal-50 transition-colors shadow-sm"
                >
                  RESET PASSWORD
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4"> 
            <button type="button" onClick={onClose} className="order-2 sm:order-1 flex-1 py-2 border rounded-full border-gabay-teal text-sm text-gabay-teal font-semibold hover:bg-teal-50 transition-all">
              CANCEL
            </button>
            <button type="submit" className="order-1 sm:order-2 flex-1 py-2 rounded-full bg-gabay-teal text-white text-sm font-semibold hover:bg-teal-600 shadow-lg shadow-teal-100 transition-all">
              {editData ? 'UPDATE ACCOUNT' : 'CREATE ACCOUNT'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}