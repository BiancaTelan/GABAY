import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactDOM from 'react-dom';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

const FormField = ({ label, name, type = "text", placeholder, value, onChange, error, children }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gabay-blue">{label} <span className="text-red-500">*</span></label>
    <div className="relative">
      {children ? children : (
        <input 
          name={name} 
          value={value} 
          onChange={onChange} 
          type={type} 
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full border-2 rounded-lg px-4 py-2 text-sm outline-none transition-all ${
            error ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-100 focus:border-gabay-teal'
          }`} 
        />
      )}
    </div>
    {error && <p className="text-[10px] text-red-500 font-semibold px-1">{error}</p>}
  </div>
);

export default function AddPersonnel({ isOpen, onClose, onSave, editData = null }) {
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
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({ ...initialState, ...editData, password: '', confirmPassword: '' });
    } else {
      setFormData(initialState);
      setErrors({});
    }
  }, [editData, isOpen]);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'firstName' || name === 'lastName') {
      finalValue = value.replace(/[^A-Za-z\s]/g, '');
    }

    if (name === 'contactNumber') {
      finalValue = value.replace(/\D/g, '').substring(0, 11);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "This field is required";
    if (!formData.lastName.trim()) newErrors.lastName = "This field is required";

    if (!formData.email.trim()) {
      newErrors.email = "This field is required";
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "This field is required";
    } else if (formData.contactNumber.length !== 11) {
      newErrors.contactNumber = "Must be exactly 11 digits";
    }

    if (!formData.department) newErrors.department = "Please select a department";


    if (!editData) {
      const hasNumber = /\d/.test(formData.password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<> ]/.test(formData.password);

      if (formData.password.length < PASSWORD_MIN_LENGTH) {
        newErrors.password = `Minimum ${PASSWORD_MIN_LENGTH} characters required`;
      } else if (!hasNumber || !hasSpecial) {
        newErrors.password = "Must contain 1 number & 1 special character";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = () => {
    /* BACKEND DEV: API: POST /api/admin/personnel/reset-password/${editData.id} */
    toast.success(`Password reset link sent to ${formData.email}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // //EDIT: Integrated onSave function to reflect changes dynamically (Requirement 5 & 6)
      // //INSTRUCTION FOR BACKEND: Once the API responds with success, 
      // the parent state is updated using this call.
      if (onSave) {
        onSave(formData);
      }

      if (editData) {
        /* BACKEND DEV: PUT /api/admin/personnel/${editData.id} */
        toast.success("Account updated successfully!");
      } else {
        /* BACKEND DEV: POST /api/admin/personnel/create */
        toast.success("Account created! Activation link sent via email.");
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

        <form onSubmit={handleSubmit} noValidate className="space-y-4 md:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} error={errors.firstName} placeholder="Juan" />
            <FormField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} error={errors.lastName} placeholder="Dela Cruz" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Role" name="role" error={errors.role}>
               <select name="role" value={formData.role} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-lg px-4 py-2 text-sm focus:border-gabay-teal outline-none bg-white">
                <option value="STAFF">STAFF</option>
                <option value="DOCTOR">DOCTOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </FormField>
            
            <FormField label="Department" name="department" error={errors.department}>
              <select name="department" value={formData.department} onChange={handleChange} className={`w-full border-2 rounded-lg px-4 py-2 text-sm outline-none bg-white transition-all ${errors.department ? 'border-red-500' : 'border-gray-100 focus:border-gabay-teal'}`}>
                <option value="">Select Department</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dentistry">Dentistry</option>
                <option value="Internal Medicine">Internal Medicine</option>
                <option value="Pediatrics">Pediatrics</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Email Address" name="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="juandelacruz@gmail.com" />
            <FormField label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} error={errors.contactNumber} placeholder="09XXXXXXXXX" />
          </div>

          {!editData ? (
            <div className="space-y-4 pt-2 animate-in slide-in-from-top-1">
              <div className="relative space-y-1">
                <label className="text-sm font-medium text-gabay-blue">Initial Password <span className="text-red-500">*</span></label>
                <div className="relative"> 
                  <input 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    type={showPassword ? "text" : "password"} 
                    className={`w-full border-2 rounded-lg px-4 py-2 text-sm outline-none transition-all hide-password-toggle ${errors.password ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-100 focus:border-gabay-teal'}`} 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gabay-teal transition-colors">
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-500 font-semibold px-1">{errors.password}</p>}
              </div>

              <div className="relative space-y-1">
                <label className="text-sm font-medium text-gabay-blue">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    type={showPassword ? "text" : "password"} 
                    className={`w-full border-2 rounded-lg px-4 py-2 text-sm outline-none transition-all hide-password-toggle ${errors.confirmPassword ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-100 focus:border-gabay-teal'}`} 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gabay-teal transition-colors">
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-[10px] text-red-500 font-semibold px-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          ) : (
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="text-gray-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs font-bold text-gabay-blue uppercase tracking-wider">Account Security</p>
                    <p className="text-[10px] text-gray-500 leading-tight">Only reset password when authorized to.</p>
                  </div>
                </div>
                <button type="button" onClick={handleResetPassword} className="w-full sm:w-auto px-4 py-1.5 bg-white border border-gabay-red text-gabay-red text-[10px] font-semibold rounded-lg hover:bg-red-50 transition-colors shadow-sm">
                  RESET PASSWORD
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4"> 
            <button type="button" onClick={onClose} className="order-2 sm:order-1 flex-1 py-2.5 border-2 rounded-full border-gabay-teal text-sm text-gabay-teal font-semibold hover:bg-teal-50 transition-all">
              CANCEL
            </button>
            <button type="submit" className="order-1 sm:order-2 flex-1 py-2.5 rounded-full bg-gabay-teal text-white text-sm font-semibold hover:bg-teal-600 shadow-lg transition-all">
              {editData ? 'UPDATE ACCOUNT' : 'CREATE ACCOUNT'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}