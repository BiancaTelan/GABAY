import React, { useState } from 'react';
import Input from '../components/input';

export default function Account() {
  // 1. Local state for the user's data
  const [userInfo, setUserInfo] = useState({
    fullName: "Juan Dela Cruz",
    hospitalNumber: "26-154928",
    email: "juandelacruz@gmail.com",
    contactNumber: "09191234567",
    dob: "1989-12-28",
    gender: "Male"
  });

  // 2. State to toggle between view and edit modes
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // Logic to save to database would go here later
      console.log("Saving new data:", userInfo);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 font-poppins">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gabay-teal">My Account</h1>
          <p className="text-gray-500 text-sm">View your profile information here</p>
        </div>
        
        {/* Toggle Button */}
        <button 
          onClick={handleToggleEdit}
          className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all border
            ${isEditing 
              ? 'bg-gabay-teal text-white border-gabay-teal shadow-md' 
              : 'text-gabay-teal border-gabay-teal hover:bg-teal-50'}`}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="space-y-4">
        <Input 
          label="Full Name" 
          name="fullName"
          value={userInfo.fullName} 
          onChange={handleInputChange}
          readOnly={!isEditing} 
        />
        <Input 
          label="Hospital Number" 
          name="hospitalNumber"
          value={userInfo.hospitalNumber} 
          readOnly={true} // Usually, hospital IDs are permanent and not editable
        />
        <Input 
          label="Email Address" 
          name="email"
          type="email"
          value={userInfo.email} 
          onChange={handleInputChange}
          readOnly={!isEditing} 
        />
        <Input 
          label="Contact Number" 
          name="contactNumber"
          value={userInfo.contactNumber} 
          onChange={handleInputChange}
          readOnly={!isEditing} 
        />

        <div className="grid grid-cols-2 gap-6">
          <Input 
            label="Date of Birth" 
            name="dob"
            type="date" 
            value={userInfo.dob} 
            onChange={handleInputChange}
            readOnly={!isEditing} 
          />
          {isEditing ? (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gabay-navy mb-1">Gender</label>
    <select 
      name="gender"
      value={userInfo.gender}
      onChange={handleInputChange}
      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-gabay-teal"
    >
      <option value="Male">Male</option>
      <option value="Female">Female</option>
      <option value="Other">Other</option>
    </select>
  </div>
) : (
  <Input label="Gender" value={userInfo.gender} readOnly />
)}
        </div>
      </div>
    </div>
  );
}