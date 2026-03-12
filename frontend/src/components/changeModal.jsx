import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const ChangeModal = ({ isOpen, onClose, type = "password" }) => {
  const isEmailType = type === "email";
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    currentEmail: 'juandelacruz@gmail.com', 
    newEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const validate = () => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (isEmailType) {
      if (!emailRegex.test(formData.newEmail)) {
        newErrors.newEmail = "Please enter a valid email address.";
      }
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Password is required to verify changes.";
      }
    } else {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Current password is required.";
      }
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = "Must be at least 8 characters.";
      } else if (!hasNumber.test(formData.newPassword)) {
        newErrors.newPassword = "Must contain at least one number.";
      } else if (!hasSpecialChar.test(formData.newPassword)) {
        newErrors.newPassword = "Must contain a special character.";
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log(`Submitting ${type} change...`, formData);
      // PUT BACKEND LOGIC HERE
      onClose();
    }
  };

  const inputStyle = "w-full px-4 py-3 rounded-md border outline-none transition-all font-poppins text-gray-600 focus:border-gabay-teal pr-12";
  const labelStyle = "block text-gabay-navy font-poppins font-medium mb-2 text-lg";
  const errorTextStyle = "text-red-500 text-xs font-poppins mt-1 block min-h-[16px]";

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <style>{`input::-ms-reveal, input::-ms-clear { display: none; }`}</style>
      
      <div className="bg-white w-full max-w-xl rounded-xl p-12 shadow-2xl border border-gray-300 relative animate-in fade-in zoom-in duration-300">
        
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-4xl font-montserrat font-bold text-gabay-teal">
            {isEmailType ? "Change Email" : "Change Password"}
          </h1>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-gabay-blue hover:underline font-poppins text-lg transition-all"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          
          {isEmailType ? (
            <>
              <div className="mb-6">
                <label className={labelStyle}>Current Email</label>
                <input 
                  type="text" 
                  value={formData.currentEmail} 
                  disabled 
                  className={`${inputStyle} bg-gray-50 border-gray-200 cursor-not-allowed`} 
                />
              </div>

              <div className="mb-6">
                <label className={labelStyle}>Enter New Email <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  name="newEmail" 
                  placeholder="delacruzjuan123@gmail.com"
                  className={`${inputStyle} ${errors.newEmail ? 'border-red-500' : 'border-gray-300'}`}
                  onChange={handleChange}
                />
                <span className={errorTextStyle}>{errors.newEmail}</span>
              </div>

              <div className="relative mb-10">
                <label className={labelStyle}>Enter Password to Confirm Changes <span className="text-red-500">*</span></label>
                <input 
                  type={showCurrent ? "text" : "password"} 
                  name="currentPassword" 
                  placeholder="********"
                  className={`${inputStyle} ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}
                  onChange={handleChange}
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrent(!showCurrent)} 
                  className="absolute right-4 top-[48px] text-gray-400 hover:text-gabay-teal transition-colors"
                >
                  {showCurrent ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
                <span className={errorTextStyle}>{errors.currentPassword}</span>
              </div>
            </>
          ) : (
            <>
              <div className="relative mb-6">
                <label className={labelStyle}>Current Password <span className="text-red-500">*</span></label>
                <input 
                  type={showCurrent ? "text" : "password"} 
                  name="currentPassword" 
                  placeholder="********"
                  className={`${inputStyle} ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}
                  onChange={handleChange}
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-[48px] text-gray-400">
                  {showCurrent ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
                <span className={errorTextStyle}>{errors.currentPassword}</span>
              </div>

              <div className="relative mb-6">
                <label className={labelStyle}>New Password <span className="text-red-500">*</span></label>
                <input 
                  type={showNew ? "text" : "password"} 
                  name="newPassword" 
                  placeholder="********"
                  className={`${inputStyle} ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
                  onChange={handleChange}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-[48px] text-gray-400">
                  {showNew ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
                <span className={errorTextStyle}>{errors.newPassword}</span>
              </div>

              <div className="relative mb-10">
                <label className={labelStyle}>Confirm New Password <span className="text-red-500">*</span></label>
                <input 
                  type={showConfirm ? "text" : "password"} 
                  name="confirmPassword" 
                  placeholder="********"
                  className={`${inputStyle} ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                  onChange={handleChange}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-[48px] text-gray-400">
                  {showConfirm ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
                <span className={errorTextStyle}>{errors.confirmPassword}</span>
              </div>
            </>
          )}

          <div className="flex justify-center">
            <button 
              type="submit" 
              className="bg-gabay-teal hover:bg-gabay-teal2 text-white font-montserrat font-bold py-3 px-12 rounded-full transition-all shadow-md uppercase tracking-wide"
            >
              {isEmailType ? "Change Email" : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeModal;