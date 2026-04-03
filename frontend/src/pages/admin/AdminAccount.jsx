import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle, Camera } from 'lucide-react';
import Input from '../../components/input';
import ConfirmationModal from '../../components/confirmModal';
import ChangeModal from '../../components/changeModal';
import { emailPattern, namePattern, phonePattern, dobPattern } from '../../utils/constants';
import { AuthContext } from '../../authContext';

export default function AdminAccount() {
  const navigate = useNavigate();
  const { token, onLogout } = useContext(AuthContext);

  const [localUserInfo, setLocalUserInfo] = useState({
    firstname: "",
    surname: "",
    mi: "",
    suffix: "",
    role: "ADMIN",
    email: "",
    contactNumber: "",
    dob: "",
    gender: "Male",
    address: "",
    emergencyContact: "",
    emergencyContactNum: "",
    profilePhoto: null
  });

  const [tempUserInfo, setTempUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [changeModalType, setChangeModalType] = useState('password');

  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!token) return;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userEmail = payload.sub;

        const response = await fetch(`/api/admin/profile/${userEmail}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setLocalUserInfo(data);
        }
      } catch (error) {
        console.error("Failed to fetch admin profile:", error);
      }
    };
    fetchAdminProfile();
  }, [token]);

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === 'dob') {
      const cleanValue = value.replace(/\D/g, ''); 
      if (cleanValue.length <= 2) value = cleanValue;
      else if (cleanValue.length <= 4) value = `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`;
      else value = `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}/${cleanValue.slice(4, 8)}`;
    }
    setLocalUserInfo(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCalendarChange = (e) => {
    const dateValue = e.target.value; 
    if (!dateValue) return;
    const [y, m, d] = dateValue.split('-');
    setLocalUserInfo(prev => ({ ...prev, dob: `${m}/${d}/${y}` }));
  };

  const validate = () => {
    let newErrors = {};
    const today = new Date();

    if (!localUserInfo.firstname.trim()) newErrors.firstname = "First name is required";
    else if (!namePattern.test(localUserInfo.firstname)) newErrors.firstname = "No numbers/special characters";

    if (!localUserInfo.surname.trim()) newErrors.surname = "Last name is required";
    else if (!namePattern.test(localUserInfo.surname)) newErrors.surname = "No numbers/special characters";

    if (localUserInfo.emergencyContact && !namePattern.test(localUserInfo.emergencyContact)) {
        newErrors.emergencyContact = "No numbers/special characters";
    }

    if (!localUserInfo.dob.trim()) {
      newErrors.dob = "Date of birth is required";
    } else if (!dobPattern.test(localUserInfo.dob)) {
      newErrors.dob = "Use MM/DD/YYYY format";
    } else {
      const [m, d, y] = localUserInfo.dob.split('/').map(Number);
      const birthDate = new Date(y, m - 1, d);
      let age = today.getFullYear() - birthDate.getFullYear();
      const mDiff = today.getMonth() - birthDate.getMonth();
      if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) age--;
      
      if (birthDate > today) newErrors.dob = "Date cannot be in the future";
      else if (age < 18) newErrors.dob = "ADMIN MUST BE AT LEAST 18 YEARS OLD";
    }

    if (!localUserInfo.contactNumber.trim()) newErrors.contactNumber = "Required";
    else if (!/^\d{11}$/.test(localUserInfo.contactNumber)) newErrors.contactNumber = "Must be 11 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      try {
        const response = await fetch('/api/admin/update-profile', {
          method: 'PUT',
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(localUserInfo)
        });
        if (!response.ok) throw new Error("Failed to save admin profile.");
        setIsEditing(false);
        setShowToast(true);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const openLogoutModal = () => {
    setModalConfig({
      isOpen: true,
      type: 'info',
      title: 'Log Out',
      message: 'Are you sure you want to log out?',
      onConfirm: () => { onLogout(); navigate('/'); }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 font-poppins relative text-left animate-in fade-in duration-500">
      
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100]">
          <div className="bg-gabay-teal text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
            <CheckCircle size={20} />
            <span className="text-sm font-medium">Profile Updated Successfully!</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-montserrat font-bold text-gabay-teal">
              {isEditing ? "Account Information" : "My Admin Account"}
            </h1>
            <div className="flex flex-row items-center gap-4 mt-1 flex-nowrap">
              <p className="text-gray-500 text-base">
                {isEditing ? "Edit your profile details here" : "View your profile information here"}
              </p>
              {!isEditing && (
                <button 
                  onClick={() => { setTempUserInfo({...localUserInfo}); setIsEditing(true); }} 
                  className="px-5 py-1 rounded-full text-sm font-medium border border-gabay-teal text-gabay-teal hover:bg-teal-50 transition-all whitespace-nowrap shrink-0"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        <div className="flex-1 space-y-12">
          <section>
            <h2 className="text-sm font-bold text-gabay-blue mb-6 tracking-widest uppercase">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {isEditing ? (
                <>
                  <div className="md:col-span-2"><Input label="First Name *" name="firstname" value={localUserInfo.firstname} onChange={handleInputChange} error={errors.firstname} isEditing={true} /></div>
                  <div className="md:col-span-1"><Input label="M.I." name="mi" value={localUserInfo.mi} onChange={handleInputChange} isEditing={true} maxLength={2} /></div>
                  <div className="md:col-span-1"><Input label="Last Name *" name="surname" value={localUserInfo.surname} onChange={handleInputChange} error={errors.surname} isEditing={true} /></div>
                  <div className="md:col-span-1"><Input label="Suffix" name="suffix" value={localUserInfo.suffix} onChange={handleInputChange} isEditing={true} /></div>
                </>
              ) : (
                <div className="md:col-span-4">
                   <Input label="Full Name" value={`${localUserInfo.firstname} ${localUserInfo.mi} ${localUserInfo.surname} ${localUserInfo.suffix}`.replace(/\s+/g, ' ')} readOnly noHover />
                </div>
              )}
              
              <div className="md:col-span-2"><Input label="Role" value={localUserInfo.role} readOnly noHover className="bg-gray-100" /></div>
              
              <div className="md:col-span-2">
                <Input 
                  label="Date of Birth *" 
                  name="dob" 
                  value={localUserInfo.dob} 
                  onChange={handleInputChange} 
                  onIconClick={handleCalendarChange}
                  readOnly={!isEditing} 
                  isEditing={isEditing}
                  placeholder="MM/DD/YYYY"
                  maxLength={10}
                  error={errors.dob}
                />
              </div>

              <div className="md:col-span-4">
                <label className="text-sm font-medium text-gabay-navy mb-2 block">Gender *</label>
                {isEditing ? (
                  <div className="flex gap-6 items-center h-10">
                    {["Female", "Male"].map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" value={g} checked={localUserInfo.gender === g} onChange={handleInputChange} className="accent-gabay-teal w-4 h-4" />
                        <span>{g}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <Input value={localUserInfo.gender} readOnly noHover />
                )}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-gabay-blue mb-6 tracking-widest uppercase">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <Input label="Email Address *" value={localUserInfo.email} readOnly noHover className="bg-gray-50" />
              <Input label="Contact Number *" name="contactNumber" value={localUserInfo.contactNumber} onChange={handleInputChange} error={errors.contactNumber} readOnly={!isEditing} isEditing={isEditing} />
              
              <div className="md:col-span-2">
                <Input label="Home Address" name="address" value={localUserInfo.address} onChange={handleInputChange} readOnly={!isEditing} isEditing={isEditing} />
              </div>

              <Input label="Emergency Contact" name="emergencyContact" value={localUserInfo.emergencyContact} onChange={handleInputChange} error={errors.emergencyContact} readOnly={!isEditing} isEditing={isEditing} />
              <Input label="Emergency Contact Number" name="emergencyContactNum" value={localUserInfo.emergencyContactNum} onChange={handleInputChange} error={errors.emergencyContactNum} readOnly={!isEditing} isEditing={isEditing} />
            </div>
          </section>

          {isEditing && (
            <div className="flex gap-4">
              <button onClick={() => { setLocalUserInfo(tempUserInfo); setIsEditing(false); }} className="px-10 py-2 rounded-full border border-gabay-teal text-gabay-teal font-bold hover:bg-teal-50 transition-all">CANCEL</button>
              <button onClick={handleSave} className="px-10 py-2 rounded-full bg-gabay-teal text-white font-bold hover:bg-teal-600 transition-all shadow-md">SAVE</button>
            </div>
          )}
        </div>

        <div className="w-full lg:w-72 flex flex-col items-center lg:items-start border-l border-gray-100 pl-0 lg:pl-12">
          <div className="relative mb-8 group">
            <div className="w-40 h-40 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg">
                <img src={localUserInfo.profilePhoto || "/default-avatar.png"} alt="Profile" className="w-full h-full object-cover" />
            </div>
            {isEditing && (
                <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md text-gabay-blue hover:text-gabay-teal transition-colors">
                    <Camera size={20} />
                </button>
            )}
          </div>

          <div className="space-y-4 w-full">
            {isEditing && (
              <>
                <button onClick={() => { setChangeModalType('email'); setIsChangeModalOpen(true); }} className="block text-gabay-blue hover:underline text-sm font-medium">Change Email</button>
                <button onClick={() => { setChangeModalType('password'); setIsChangeModalOpen(true); }} className="block text-gabay-blue hover:underline text-sm font-medium">Change Password</button>
                <button className="block text-gabay-blue hover:underline text-sm font-medium">Edit Profile Photo</button>
                <div className="pt-4"></div>
              </>
            )}
            
            <button onClick={openLogoutModal} className="flex items-center gap-2 text-gabay-teal hover:underline text-sm font-bold">
              <LogOut size={18} /> Log Out
            </button>
          </div>
          
          {isEditing && (
              <p className="text-[10px] text-gray-400 mt-6 text-center lg:text-left">
                  Must be in .jpg or .png format <br/> Maximum file size allowed: 100mb
              </p>
          )}
        </div>
      </div>

      <ConfirmationModal {...modalConfig} onClose={() => setModalConfig({...modalConfig, isOpen: false})} />
      <ChangeModal 
        isOpen={isChangeModalOpen} 
        onClose={() => setIsChangeModalOpen(false)} 
        type={changeModalType} 
        currentEmail={localUserInfo.email} 
      />
    </div>
  );
}