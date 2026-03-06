import React, { useState, useRef } from 'react';
import Input from '../components/input';
import { LogOut, Trash2 } from 'lucide-react';
import { emailPattern, namePattern, phonePattern, dobPattern, minAgeRequirement } from '../utils/constants';

export default function Account({ onLogout }) {
  const dateInputRef = useRef(null);

  const [userInfo, setUserInfo] = useState({
    firstName: "Juan",
    lastName: "Dela Cruz",
    hospitalNumber: "26-154928",
    email: "juandelacruz@gmail.com",
    contactNumber: "09191234567",
    dob: "",
    gender: "Male",
    homeAddress: "910 Plaza Miranda, Quezon City",
    emergencyContact: "Maria Dela Cruz",
    emergencyContactNum: "09198765432",
    emergencyEmail: "mariadelacruz@gmail.com"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    if (name === 'dob' && isEditing) {
      const cleanValue = value.replace(/\D/g, ''); 
      if (cleanValue.length <= 2) {
        value = cleanValue;
      } else if (cleanValue.length <= 4) {
        value = `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`;
      } else {
        value = `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}/${cleanValue.slice(4, 8)}`;
      }
    }

    setUserInfo(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCalendarChange = (e) => {
    const dateValue = e.target.value; 
    if (!dateValue) return;

    const [y, m, d] = dateValue.split('-');
    const formattedDate = `${m}/${d}/${y}`; 
    
    setUserInfo(prev => ({ ...prev, dob: formattedDate }));
    if (errors.dob) setErrors(prev => ({ ...prev, dob: null }));
  };

  const validate = () => {
    let newErrors = {};
    const today = new Date(); 

    // PERSONAL INFORMATION SECTION
    if (!userInfo.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!namePattern.test(userInfo.firstName)) {
      newErrors.firstName = "Name cannot contain numbers";
    }

    if (!userInfo.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!namePattern.test(userInfo.lastName)) {
      newErrors.lastName = "Name cannot contain numbers";
    }

    if (!userInfo.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailPattern.test(userInfo.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!userInfo.dob.trim() || userInfo.dob === "MM/DD/YYYY") {
      newErrors.dob = "Date of birth is required";
    } else if (!dobPattern.test(userInfo.dob)) {
      newErrors.dob = "Please use MM/DD/YYYY format";
    } else {
      const [m, d, y] = userInfo.dob.split('/').map(Number);
      const birthDate = new Date(y, m - 1, d);
      
      if (birthDate > today) {
        newErrors.dob = "Invalid date of birth";
      } else {
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < minAgeRequirement) {
          newErrors.dob = `USER MUST BE ATLEAST ${minAgeRequirement} YEARS OLD`;
        }
      }
    }

    if (!userInfo.homeAddress.trim()) {
      newErrors.homeAddress = "Home address is required";
    }

    if (!userInfo.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!phonePattern.test(userInfo.contactNumber)) {
      newErrors.contactNumber = "Must be a valid 11-digit number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      console.log("Saving validated data:", userInfo);
      setIsEditing(false);
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr || dateStr.includes('/')) return dateStr;
    const [y, m, d] = dateStr.split('-');
    return `${m}/${d}/${y}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 font-poppins transition-all">
      <input
        type="date"
        ref={dateInputRef}
        onChange={handleCalendarChange}
        max={new Date().toISOString().split("T")[0]}
        className="sr-only invisible absolute"
      />

      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-montserrat font-bold text-gabay-teal">
              {isEditing ? "Account Information" : "My Account"}
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-gray-500 text-base">
                {isEditing ? "Edit your profile details here" : "View your profile information here"}
              </p>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-1 rounded-full text-sm font-medium border border-gabay-teal text-gabay-teal hover:bg-teal-50 transition-all"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        <div className="flex-1 space-y-10">

          <section>
            <h2 className="text-base font-semibold text-gabay-blue mb-6 tracking-wider uppercase">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {isEditing ? (
                <>
                  <Input label="First Name" name="firstName" value={userInfo.firstName} onChange={handleInputChange} error={errors.firstName} isEditing={isEditing} required />
                  <Input label="Last Name" name="lastName" value={userInfo.lastName} onChange={handleInputChange} error={errors.lastName} isEditing={isEditing} required />
                </>
              ) : (
                <Input label="Full Name" value={`${userInfo.firstName} ${userInfo.lastName}`} readOnly noHover />
              )}
              
              <Input label="Hospital Number" value={userInfo.hospitalNumber} readOnly noHover />
              <Input label="Email Address" name="email" value={userInfo.email} onChange={handleInputChange} readOnly={!isEditing} noHover={!isEditing} error={errors.email} isEditing={isEditing} required />
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gabay-navy mb-1">Gender</label>
                {isEditing ? (
                  <div className="flex items-center gap-6 h-[40px]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gender" value="Female" checked={userInfo.gender === "Female"} onChange={handleInputChange} className="accent-gabay-blue h-4 w-4" />
                      <span className="text-base">Female</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gender" value="Male" checked={userInfo.gender === "Male"} onChange={handleInputChange} className="accent-gabay-blue h-4 w-4" />
                      <span className="text-base">Male</span>
                    </label>
                  </div>
                ) : (
                  <Input value={userInfo.gender} readOnly noHover />
                )}
              </div>

              <Input 
                label="Date of Birth" 
                name="dob" 
                type="text" 
                value={isEditing ? userInfo.dob : formatDisplayDate(userInfo.dob)} 
                onChange={handleInputChange} 
                onIconClick={() => dateInputRef.current.showPicker()}
                readOnly={!isEditing} 
                noHover={!isEditing}
                isEditing={isEditing}
                required
                placeholder="MM/DD/YYYY"
                maxLength={10}
                error={errors.dob}
              />

              <div className="md:col-span-1">
                <Input label="Home Address" name="homeAddress" value={userInfo.homeAddress} onChange={handleInputChange} readOnly={!isEditing} noHover={!isEditing} isEditing={isEditing} required error={errors.homeAddress} />
              </div>
              <Input label="Contact Number" name="contactNumber" value={userInfo.contactNumber} onChange={handleInputChange} readOnly={!isEditing} noHover={!isEditing} isEditing={isEditing} required error={errors.contactNumber} />
            </div>
          </section>


          <section>
            <h2 className="text-base font-semibold text-gabay-blue mb-6 tracking-wider uppercase">Emergency Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <Input label="Emergency Contact" name="emergencyContact" value={userInfo.emergencyContact} onChange={handleInputChange} readOnly={!isEditing} noHover={!isEditing} isEditing={isEditing} error={errors.emergencyContact} />
              <Input label="Emergency Contact Number" name="emergencyContactNum" value={userInfo.emergencyContactNum} onChange={handleInputChange} readOnly={!isEditing} noHover={!isEditing} isEditing={isEditing} error={errors.emergencyContactNum} />
              <div className="md:col-span-1">
                <Input label="Emergency Email Address" name="emergencyEmail" value={userInfo.emergencyEmail} onChange={handleInputChange} readOnly={!isEditing} noHover={!isEditing} isEditing={isEditing} error={errors.emergencyEmail} />
              </div>
            </div>
          </section>

          {isEditing && (
            <div className="flex gap-3.5 pt-1">
              <button onClick={() => { setIsEditing(false); setErrors({}); }} className="px-8 py-1.5 rounded-full border border-gabay-teal text-sm text-gabay-teal font-medium hover:bg-teal-50 transition-all">Cancel</button>
              <button onClick={handleSave} className="px-8 py-1.5 rounded-full bg-gabay-teal text-sm text-white font-medium hover:bg-teal-600 shadow-md transition-all">Save</button>
            </div>
          )}
        </div>


        <div className="w-full md:w-64 flex flex-col items-start gap-4 border-l border-gray-100 pl-8 pt-10">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Account Settings</h3>
          <button onClick={onLogout} className="flex items-center gap-2 text-gabay-teal hover:text-gabay-teal2 transition-colors hover:underline text-sm font-semibold">
            <LogOut size={18} /> Log Out
          </button>
          {isEditing && (
            <>
              <button className="text-gabay-blue hover:text-gabay-navy transition-colors hover:underline text-sm font-medium">Change Email</button>
              <button className="text-gabay-blue hover:text-gabay-navy transition-colors hover:underline text-sm font-medium">Change Password</button>
              <button className="text-red-500 hover:text-red-700 text-sm font-semibold mt-10 underline w-full flex gap-2">
                <Trash2 size={16} /> Delete Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}