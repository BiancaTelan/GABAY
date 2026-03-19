import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom'; 

const ChangeModal = ({ isOpen, onClose, type = "password", setShowToast, currentEmail }) => {
  const navigate = useNavigate();
  const isEmailType = type === "email";
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isSuccess, setIsSuccess] = useState(false); 
  
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      
      try {
        let endpoint = '';
        let payload = {};

        if (isEmailType) {
          endpoint = '/api/auth/change-email';
          payload = {
            current_email: currentEmail,
            new_email: formData.newEmail,
            password: formData.currentPassword
          };
        } else {
          endpoint = '/api/auth/change-password';
          payload = {
            email: currentEmail,
            current_password: formData.currentPassword,
            new_password: formData.newPassword
          };
        }

        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to update account.");
        }

        if (isEmailType) {
          setIsSuccess(true);
        } else {
          if (setShowToast) setShowToast(true);
          onClose();
        }

      } catch (err) {
        setErrors({ server: err.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const inputStyle = "w-full px-4 py-3 rounded-md border outline-none transition-all font-poppins text-gray-600 focus:border-gabay-teal pr-12";
  const labelStyle = "block text-gabay-navy font-poppins font-medium mb-2 text-lg";
  const errorTextStyle = "text-red-500 text-xs font-poppins mt-1 block min-h-[16px]";

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-md rounded-xl p-10 shadow-2xl border border-gray-300 relative text-center animate-in zoom-in duration-300">
          <CheckCircle size={70} className="text-gabay-teal mx-auto mb-6" />
          <h2 className="text-2xl font-montserrat font-bold text-gabay-teal mb-4">
            Email Updated!
          </h2>
          <p className="text-gray-500 font-poppins text-sm mb-8 leading-relaxed">
            Your email has been successfully changed. For security reasons, your active session has ended. Please log in again using your new email address.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-gabay-teal hover:bg-teal-600 text-white font-montserrat font-bold py-3 px-6 rounded-full transition-all shadow-md uppercase tracking-wide"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <style>{`input::-ms-reveal, input::-ms-clear { display: none; }`}</style>
      
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-2xl border border-gray-300 relative animate-in fade-in zoom-in duration-300">
        
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-gabay-teal">
            {isEmailType ? "Change Email" : "Change Password"}
          </h1>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isLoading}
            className="text-gabay-blue hover:underline font-poppins text-base transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {errors.server && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">{errors.server}</p>}

          {isEmailType ? (
            <>
              <div className="mb-6">
                <label className={labelStyle}>Current Email</label>
                <input 
                  type="text" 
                  value={currentEmail} 
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
              {/* --- PASSWORD CHANGE INPUTS --- */}
              <div className="relative mb-3">
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

              <div className="relative mb-3">
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

              <div className="relative mb-3">
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
              disabled={isLoading}
              className={`bg-gabay-teal hover:bg-teal-600 text-white font-montserrat font-bold py-3 px-8 rounded-full transition-all shadow-md uppercase tracking-wide flex items-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                isEmailType ? "Change Email" : "Change Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeModal;