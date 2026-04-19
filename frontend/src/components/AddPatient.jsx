import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, ShieldAlert, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactDOM from 'react-dom';
import { emailPattern, namePattern } from '../utils/constants';

const HOSPITAL_NO_REGEX = /^\d{2}-\d{6}$/; 
const PASSWORD_MIN_LENGTH = 8;
const DOB_REGEX = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/; 

const FormField = ({ label, name, type = "text", placeholder, value, onChange, error }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gabay-blue">{label} <span className="text-red-500">*</span></label>
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
    {error && <p className="text-[10px] text-red-500 font-semibold px-1">{error}</p>}
  </div>
);

export default function AddPatient({ isOpen, onClose, editData = null }) {
  const modalRef = useRef();
  const dateInputRef = useRef(null); 
  
  const initialState = {
    firstName: '',
    lastName: '',
    hospitalNumber: '',
    dob: '',
    role: 'PATIENT',
    contactNumber: '',
    email: '',
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

  useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }
  
  return () => {
    document.body.style.overflow = 'unset';
  };
  }, [isOpen]);

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

    if (name === 'hospitalNumber') {
      let digits = value.replace(/\D/g, '').substring(0, 8);
      if (digits.length > 2) {
        finalValue = digits.substring(0, 2) + '-' + digits.substring(2);
      } else {
        finalValue = digits;
      }
    }

    if (name === 'dob') {
      let digits = value.replace(/\D/g, '').substring(0, 8);
      if (digits.length > 4) {
        finalValue = digits.substring(0, 2) + '/' + digits.substring(2, 4) + '/' + digits.substring(4);
      } else if (digits.length > 2) {
        finalValue = digits.substring(0, 2) + '/' + digits.substring(2);
      } else {
        finalValue = digits;
      }
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "This field is required";
    } else if (!namePattern.test(formData.firstName)) {
      newErrors.firstName = "Alphabetical characters only";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "This field is required";
    } else if (!namePattern.test(formData.lastName)) {
      newErrors.lastName = "Alphabetical characters only";
    }
    
    if (!HOSPITAL_NO_REGEX.test(formData.hospitalNumber)) newErrors.hospitalNumber = "Invalid Hospital Number";
    
    if (!DOB_REGEX.test(formData.dob)) {
      newErrors.dob = "Invalid Date of Birth";
    } else {
      const [m, d, y] = formData.dob.split('/').map(Number);
      const birthDate = new Date(y, m - 1, d);
      const today = new Date();
      
      if (birthDate > today) {
        newErrors.dob = "Birth date cannot be in the future";
      } else {
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 13) newErrors.dob = "User must be at least 13 years old";
      }
    }

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

    if (!editData) {
      const hasNumber = /\d/.test(formData.password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<> ]/.test(formData.password);
      
      if (formData.password.length < PASSWORD_MIN_LENGTH) {
        newErrors.password = `Minimum ${PASSWORD_MIN_LENGTH} characters`;
      } else if (!hasNumber || !hasSpecial) {
        newErrors.password = "Requires 1 number & 1 special char";
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    onClose();
    toast.success(editData ? "Updated!" : "Account Created! Activation link sent via email.");
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] overflow-x-hidden flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4" onClick={handleOverlayClick}>
      <div ref={modalRef} className="bg-white rounded-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative font-poppins text-left">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>

        <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-gabay-teal text-center mb-6 md:mb-8 uppercase tracking-tight">
          {editData ? 'Edit Patient' : 'Account Information'}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} error={errors.firstName} placeholder="Juan" />
            <FormField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} error={errors.lastName} placeholder="Dela Cruz" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Hospital Number" name="hospitalNumber" value={formData.hospitalNumber} onChange={handleChange} error={errors.hospitalNumber} placeholder="26-XXXXXX" />
            
            {/* Custom DOB with Picker */}
            <div className="space-y-1 relative">
              <label className="text-sm font-medium text-gabay-blue">Date of Birth <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  name="dob" 
                  value={formData.dob} 
                  onChange={handleChange} 
                  placeholder="MM/DD/YYYY"
                  className={`w-full border-2 rounded-lg pl-4 pr-10 py-2 text-sm outline-none transition-all ${
                    errors.dob ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-100 focus:border-gabay-teal'
                  }`} 
                />
                <button 
                  type="button" 
                  onClick={() => dateInputRef.current.showPicker()} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gabay-teal"
                >
                  <Calendar size={18} />
                </button>
                {/* Hidden Native Picker */}
                <input 
                  ref={dateInputRef} 
                  type="date" 
                  max={new Date().toISOString().split("T")[0]} 
                  onChange={(e) => {
                    const [y, m, d] = e.target.value.split('-');
                    setFormData(prev => ({...prev, dob: `${m}/${d}/${y}`}));
                    if (errors.dob) setErrors(prev => ({ ...prev, dob: null }));
                  }} 
                  className="absolute invisible pointer-events-none" 
                />
              </div>
              {errors.dob && <p className="text-[10px] text-red-500 font-semibold px-1">{errors.dob}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gabay-blue">Role <span className="text-red-500">*</span></label>
              <input readOnly value="PATIENT" className="w-full border-2 border-gray-50 bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-400 cursor-not-allowed" />
            </div>
            <FormField label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} error={errors.contactNumber} placeholder="09XXXXXXXXX" />
          </div>

          <FormField label="Email Address" name="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="juandelacruz@gmail.com" />

          {!editData ? (
            <div className="space-y-4 pt-2">
              {/* Password */}
              <div className="relative space-y-1">
                <label className="text-sm font-medium text-gabay-blue">Initial Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input name="password" value={formData.password} onChange={handleChange} type={showPassword ? "text" : "password"} className={`w-full border-2 rounded-lg px-4 py-2 text-sm outline-none transition-all hide-password-toggle ${errors.password ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-100 focus:border-gabay-teal'}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gabay-teal">
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-500 font-semibold px-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="relative space-y-1">
                <label className="text-sm font-medium text-gabay-blue">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type={showPassword ? "text" : "password"} className={`w-full border-2 rounded-lg px-4 py-2 text-sm outline-none transition-all hide-password-toggle ${errors.confirmPassword ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-100 focus:border-gabay-teal'}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gabay-teal">
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-[10px] text-red-500 font-semibold px-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs font-bold text-gabay-blue uppercase tracking-wider">Security</p>
                    <p className="text-[10px] text-gray-500">Admin cannot edit passwords directly.</p>
                  </div>
                </div>
                <button type="button" className="px-4 py-1.5 bg-white border border-gabay-teal text-gabay-teal text-[10px] font-bold rounded-lg uppercase transition-colors hover:bg-teal-50">Reset</button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4"> 
            <button type="button" onClick={onClose} className="order-2 sm:order-1 flex-1 py-2.5 border rounded-full border-gabay-teal text-sm text-gabay-teal font-semibold hover:bg-teal-50 transition-all">CANCEL</button>
            <button type="submit" className="order-1 sm:order-2 flex-1 py-2.5 rounded-full bg-gabay-teal text-white text-sm font-semibold hover:bg-teal-600 shadow-lg shadow-teal-100 transition-all">
              {editData ? 'UPDATE ACCOUNT' : 'CREATE ACCOUNT'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}