import React, { useState } from 'react';
import Input from '../components/input';
import { LogOut } from 'lucide-react';

export default function Account() {
  const [userInfo, setUserInfo] = useState({
    firstName: "Juan",
    lastName: "Dela Cruz",
    hospitalNumber: "26-154928",
    email: "juandelacruz@gmail.com",
    contactNumber: "09191234567",
    dob: "1989-12-28",
    gender: "Male",
    homeAddress: "910 Plaza Miranda, Quezon City",
    emergencyContact: "Maria Dela Cruz",
    emergencyContactNum: "09198765432",
    emergencyEmail: "mariadelacruz@gmail.com"
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // PUT BACK END LOGIC HERE 
      console.log("Saving new data:", userInfo);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 font-poppins transition-all">
      {/* HEADER SECTION */}
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
              {/* Edit Profile Btn - Now beside the subtext */}
              {!isEditing && (
                <button 
                  onClick={handleToggleEdit}
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
        {/* MAIN FORM AREA: Sections 1 & 2 */}
        <div className="flex-1 space-y-10">
          
          {/* SECTION 1: PERSONAL INFORMATION */}
          <section>
            <h2 className="text-base font-semibold text-gabay-blue mb-6 tracking-wider uppercase">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <Input label="First Name" name="firstName" value={userInfo.firstName} onChange={handleInputChange} readOnly={!isEditing} noHover={!isEditing} />
              <Input label="Last Name" name="lastName" value={userInfo.lastName} onChange={handleInputChange} readOnly={!isEditing} noHover={!isEditing} />
              <Input label="Hospital Number" name="hospitalNumber" value={userInfo.hospitalNumber} readOnly={true} noHover={true} />
              <Input label="Email Address" name="email" value={userInfo.email} onChange={handleInputChange} readOnly={!isEditing} noHover={!isEditing} />
              
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
                  <Input value={userInfo.gender} readOnly={true} noHover={true} />
                )}
              </div>

              {/* isEditing prop passed to handle calendar icon visibility */}
              <Input 
                label="Date of Birth" 
                name="dob" 
                type={isEditing ? "date" : "text"} 
                value={userInfo.dob} 
                onChange={handleInputChange} 
                readOnly={!isEditing} 
                noHover={!isEditing}
                isEditing={isEditing} 
              />

              <div className="md:col-span-1">
                <Input label="Home Address" name="homeAddress" value={userInfo.homeAddress} onChange={handleInputChange} readOnly={!isEditing} noHover={!isEditing} />
              </div>
              <Input label="Contact Number" name="contactNumber" value={userInfo.contactNumber} onChange={handleInputChange} readOnly={!isEditing} noHover={!isEditing} />

            </div>
          </section>

          {/* SECTION 2: EMERGENCY CONTACT INFORMATION */}
          <section>
            <h2 className="text-base font-semibold text-gabay-blue mb-6 tracking-wider uppercase">Emergency Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <Input 
                  label="Emergency Contact" 
                  name="emergencyContact" 
                  value={userInfo.emergencyContact} 
                  onChange={handleInputChange} 
                  readOnly={!isEditing} 
                  noHover={!isEditing}
                />
                <Input 
                  label="Emergency Contact Number" 
                  name="emergencyContactNum" 
                  value={userInfo.emergencyContactNum} 
                  onChange={handleInputChange} 
                  readOnly={!isEditing} 
                  noHover={!isEditing}
                />
                <div className="md:col-span-1">
                  <Input 
                    label="Emergency Email Address" 
                    name="emergencyEmail" 
                    value={userInfo.emergencyEmail} 
                    onChange={handleInputChange} 
                    readOnly={!isEditing} 
                    noHover={!isEditing}
                  />
                </div>
            </div>
          </section>

          {/* FORM ACTIONS (Save/Cancel) */}
          {isEditing && (
            <div className="flex gap-3.5  pt-1">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-8 py-1.5 rounded-full border border-gabay-teal text-sm text-gabay-teal font-medium hover:bg-teal-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleToggleEdit}
                className="px-8 py-1.5 rounded-full bg-gabay-teal text-sm text-white font-medium hover:bg-teal-600 shadow-md transition-all"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* SECTION 3: ACCOUNT ACTIONS SIDEBAR */}
        {isEditing && (
          <div className="w-full md:w-64 flex flex-col items-start gap-4 border-l border-gray-100 pl-8 pt-10">
            <button className="text-gabay-blue hover:underline text-sm font-medium">Change Email</button>
            <button className="text-gabay-blue hover:underline text-sm font-medium">Change Password</button>
            <button className="flex items-center gap-2 text-gabay-teal hover:underline text-sm font-medium">
              <LogOut size={16} /> Log Out
            </button>
            
            <button className="text-red-500 hover:text-red-700 text-sm font-semibold mt-10 underline">
              Delete Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}