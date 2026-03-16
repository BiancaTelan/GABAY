import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/input';
import Button from '../components/button';
import { phonePattern, dobPattern, minAgeRequirement } from '../utils/constants';


export default function RegisterHospitalNumber({ initialData, onFinalSubmit }) {
  const navigate = useNavigate(); 
  
  const [formData, setFormData] = useState({
    firstname: initialData?.firstname || "",
    surname: initialData?.surname || "",
    email: initialData?.email || "",
    hospital_num: "",
    contactNumber: "",
    dob: "",
    gender: "Female",
    address: ""
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    if (name === 'hospital_num') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 2) {
        value = digits;
      } else {
        value = `${digits.slice(0, 2)}-${digits.slice(2, 8)}`; 
      }
    }
    
    if (name === 'dob') {
      const cleanValue = value.replace(/\D/g, ''); 
      if (cleanValue.length <= 2) value = cleanValue;
      else if (cleanValue.length <= 4) value = `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`;
      else value = `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}/${cleanValue.slice(4, 8)}`;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCalendarChange = (e) => {
    const dateValue = e.target.value; 
    if (!dateValue) return;
    const [y, m, d] = dateValue.split('-');
    setFormData(prev => ({ ...prev, dob: `${m}/${d}/${y}` }));
    if (errors.dob) setErrors(prev => ({ ...prev, dob: null }));
  };

  const validate = () => {
    let newErrors = {};
    const today = new Date();

    if (!formData.hospital_num.trim()) {
      newErrors.hospital_num = "Hospital Number is required";
    } else if (formData.hospital_num.length < 9) {
      newErrors.hospital_num  = "Must be a valid hospital number format";
    }
    
    if (!formData.address.trim()) newErrors.address = "Home address is required";
    if (!phonePattern.test(formData.contactNumber)) newErrors.contactNumber = "Must be a valid 11-digit number";
    
    if (!formData.dob.trim() || formData.dob === "MM/DD/YYYY") {
      newErrors.dob = "Date of birth is required";
    } else if (!dobPattern.test(formData.dob)) {
      newErrors.dob = "Use MM/DD/YYYY format";
    } else {
      const [m, d, y] = formData.dob.split('/').map(Number);
      const birthDate = new Date(y, m - 1, d);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
      
      if (age < minAgeRequirement) newErrors.dob = `Must be at least ${minAgeRequirement} years old`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (validate()) {
      setIsSubmitting(true);
      
      try {
        const response = await fetch('/api/patients/update-profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to update profile");
        }

        onFinalSubmit(formData); 

      } catch (error) {
        console.error("Profile Update Error:", error);
        setServerError(error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div id="register-form" className="max-w-4xl mx-auto p-10 font-poppins text-left animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-gabay-teal mb-2 font-montserrat">Complete Your Profile</h1>
      <p className="text-gray-500 mb-10 text-sm">Please provide your hospital details to access GABAY services.</p>

      {serverError && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 text-sm text-center rounded-lg font-poppins font-semibold">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
        <Input label="Full Name" value={`${formData.firstname} ${formData.surname}`} readOnly noHover />
        <Input label="Email Address" value={formData.email} readOnly noHover />
        
        <Input 
          label="Hospital Number" 
          name="hospital_num" 
          value={formData.hospital_num} 
          onChange={handleInputChange} 
          placeholder="e.g. 26-123456" 
          maxLength={9} 
          error={errors.hospital_num} 
          required 
          isEditing={true} 
        />
        
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gabay-navy mb-1">Gender</label>
          <div className="flex gap-6 h-[40px] items-center">
            {['Female', 'Male'].map(g => (
              <label key={g} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="gender" 
                  value={g} 
                  checked={formData.gender === g} 
                  onChange={handleInputChange} 
                  className="accent-gabay-blue h-4 w-4" 
                />
                <span className="text-sm">{g}</span>
              </label>
            ))}
          </div>
        </div>

        <Input 
          label="Date of Birth" 
          name="dob" 
          value={formData.dob} 
          onChange={handleInputChange} 
          onIconClick={handleCalendarChange} 
          placeholder="MM/DD/YYYY" 
          maxLength={10} 
          error={errors.dob} 
          required 
          isEditing={true} 
        />

        <Input 
          label="Contact Number" 
          name="contactNumber" 
          value={formData.contactNumber} 
          onChange={handleInputChange} 
          placeholder="e.g. 09191234567" 
          error={errors.contactNumber} 
          required 
          isEditing={true} 
        />

        <div className="md:col-span-2">
          <Input 
            label="Home Address" 
            name="address" 
            value={formData.address} 
            onChange={handleInputChange} 
            error={errors.address} 
            required 
            isEditing={true} 
          />
        </div>

        <div className="md:col-span-2 flex justify-between items-center mt-6">

          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="text-gray-400 hover:text-gray-600 text-sm font-medium"
          >
            Cancel and Return Home
          </button>

          <Button variant="teal" type="submit" className="w-55 py-3 text-base font-semibold tracking-normal">
            UPDATE MY ACCOUNT
          </Button>
        </div>
      </form>
    </div>
  );
}