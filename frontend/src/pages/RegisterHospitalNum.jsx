import React, { useState } from 'react';
import Input from '../components/input';
import Button from '../components/button';
import { phonePattern, dobPattern, minAgeRequirement, namePattern } from '../utils/constants';

export default function RegisterHospitalNumber({ initialData, onFinalSubmit }) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    hospitalNumber: "",
    contactNumber: "",
    dob: "",
    gender: "Male",
    homeAddress: ""
  });

  const [errors, setErrors] = useState({});

  // Fix 1 & 2: Calendar sync + Auto-slashing
  const handleInputChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'dob') {
      const cleanValue = value.replace(/\D/g, ''); 
      if (cleanValue.length <= 2) value = cleanValue;
      else if (cleanValue.length <= 4) value = `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`;
      else value = `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}/${cleanValue.slice(4, 8)}`;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  // Fix 1: Calendar Picker Handler
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

    if (!formData.hospitalNumber.trim()) newErrors.hospitalNumber = "Hospital Number is required";
    if (!formData.homeAddress.trim()) newErrors.homeAddress = "Home address is required";
    
    if (!phonePattern.test(formData.contactNumber)) newErrors.contactNumber = "Must be a valid 11-digit number";

    // Fix 3: DOB & Age Validation
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Fix 4: This sends the data to App.jsx to be saved
      onFinalSubmit(formData); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-10 font-poppins text-left">
      <h1 className="text-3xl font-bold text-gabay-teal mb-2 font-montserrat">Complete Your Profile</h1>
      <p className="text-gray-500 mb-10 text-sm">Please provide your hospital details to access GABAY services.</p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
        <Input label="Full Name" value={`${formData.firstName} ${formData.lastName}`} readOnly noHover />
        <Input label="Email Address" value={formData.email} readOnly noHover />

        <Input label="Hospital Number" name="hospitalNumber" value={formData.hospitalNumber} onChange={handleInputChange} error={errors.hospitalNumber} required isEditing={true} />
        
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gabay-navy mb-1">Gender</label>
          <div className="flex gap-6 h-[40px] items-center">
            {['Female', 'Male'].map(g => (
              <label key={g} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleInputChange} className="accent-gabay-teal h-4 w-4" />
                <span className="text-sm">{g}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Updated DOB Input to handle both calendar and manual typing */}
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

        <Input label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} error={errors.contactNumber} required isEditing={true} />

        <div className="md:col-span-2">
          <Input label="Home Address" name="homeAddress" value={formData.homeAddress} onChange={handleInputChange} error={errors.homeAddress} required isEditing={true} />
        </div>

        <div className="md:col-span-2 flex justify-end mt-6">
          <Button variant="teal" type="submit" className="w-64 py-3 text-base font-bold tracking-widest">
            REGISTER MY HOSPITAL NUMBER
          </Button>
        </div>
      </form>
    </div>
  );
}