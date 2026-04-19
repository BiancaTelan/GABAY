import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle, Camera } from 'lucide-react';
import toast from 'react-hot-toast'; 
import Input from '../../components/input';
import ConfirmationModal from '../../components/confirmModal';
import ChangeModal from '../../components/changeModal';
import { emailPattern, namePattern, phonePattern, dobPattern } from '../../utils/constants';
import { AuthContext } from '../../authContext';

export default function PersonnelAccount() {
  const navigate = useNavigate();
  const { token, logout, userRole, userInfo } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  // Dynamic values based on role
  const apiBase = userRole === 'admin' ? '/api/admin' : '/api/staff';
  const displayRole = userRole === 'admin' ? 'Admin' : 'Staff';

  const [localUserInfo, setLocalUserInfo] = useState({
    firstname: "",
    surname: "",
    mi: "",
    suffix: "",
    role: userRole?.toUpperCase() || "STAFF",
    email: "",
    contactNumber: "",
    dob: "",
    gender: "Male",
    address: "",
    profilePhoto: null
  });

  const [tempUserInfo, setTempUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [changeModalType, setChangeModalType] = useState('password');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || token.split('.').length !== 3) {
        console.error("Invalid token");
        return;
      }
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userEmail = payload.sub;

        /* BACKEND API: Dynamic based on apiBase */
        const response = await fetch(`${apiBase}/profile/${userEmail}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setLocalUserInfo(data);
        }
      } catch (error) {
        console.error(`Failed to fetch ${displayRole} profile:`, error);
      }
    };
    fetchProfile();
  }, [token, apiBase, displayRole]);

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

  const handleImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
        toast.error("File is too large (Max 100MB)");
        return;
    }

    const formData = new FormData();
    formData.append('profile_photo', file);

    try {
        /* BACKEND API: Dynamic upload endpoint */
        const response = await fetch(`${apiBase}/upload-photo`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        setLocalUserInfo(prev => ({ ...prev, profilePhoto: data.photo_url }));
        toast.success("Photo updated!");
    } catch (error) {
        toast.error(error.message);
    }
  };

  const validate = () => {
    let newErrors = {};
    const today = new Date();

    if (!localUserInfo.firstname.trim()) newErrors.firstname = "First name is required";
    else if (!namePattern.test(localUserInfo.firstname)) newErrors.firstname = "No numbers/special characters";

    if (!localUserInfo.surname.trim()) newErrors.surname = "Last name is required";
    else if (!namePattern.test(localUserInfo.surname)) newErrors.surname = "No numbers/special characters";

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
      else if (age < 18) newErrors.dob = `${userRole.toUpperCase()} MUST BE AT LEAST 18 YEARS OLD`;
    }

    if (!localUserInfo.contactNumber.trim()) newErrors.contactNumber = "Required";
    else if (!/^\d{11}$/.test(localUserInfo.contactNumber)) newErrors.contactNumber = "Must be 11 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      try {
        /* BACKEND API: Dynamic update endpoint */
        const response = await fetch(`${apiBase}/update-profile`, {
          method: 'PUT',
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(localUserInfo)
        });
        if (!response.ok) throw new Error(`Failed to save ${userRole} profile.`);
        setIsEditing(false);
        toast.success('Profile Updated Successfully!');
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const openLogoutModal = () => {
    setModalConfig({
      isOpen: true,
      type: 'info',
      title: 'Log Out',
      message: 'Are you sure you want to log out?',
      onConfirm: () => { logout(); navigate('/admin/login'); }
    });
  };


  const getFullDisplayName = () => {
    const { firstname, mi, surname, suffix } = localUserInfo;
    const formattedMI = mi?.trim() ? `${mi.trim()}.` : '';
    return `${firstname} ${formattedMI} ${surname} ${suffix}`.replace(/\s+/g, ' ').trim();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 md:py-6 font-poppins relative text-left animate-in fade-in duration-500">
      
      <div className="flex flex-row items-center justify-between mb-10 gap-4 flex-nowrap">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-montserrat font-bold text-gabay-blue whitespace-nowrap">
              {isEditing ? "Account Information" : `My Account`}
            </h1>
            <div className="flex flex-row items-center gap-4 mt-1 flex-nowrap">
              <p className="text-gray-500 text-base">
                {isEditing ? "Edit your profile details here" : "View your profile information here"}
              </p>
              {!isEditing && (
                <button 
                  onClick={() => { setTempUserInfo({...localUserInfo}); setIsEditing(true); }} 
                  className="px-5 py-1 rounded-full text-sm font-medium border border-gabay-teal text-gabay-teal bg-white hover:bg-teal-50 transition-all whitespace-nowrap shrink-0"
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
            <h2 className="text-base font-bold text-gabay-teal mb-5 tracking-widest uppercase">Personal Information</h2>

            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-8 md:col-span-10">
                    <Input label="First Name" name="firstname" value={localUserInfo.firstname} onChange={handleInputChange} error={errors.firstname} isEditing={true} required />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <Input label="M.I." name="mi" value={localUserInfo.mi} onChange={handleInputChange} isEditing={true} maxLength={2} placeholder="A" />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-8 md:col-span-9">
                    <Input label="Last Name" name="surname" value={localUserInfo.surname} onChange={handleInputChange} error={errors.surname} isEditing={true} required />
                  </div>
                  <div className="col-span-4 md:col-span-3">
                    <label className="text-sm font-medium text-gabay-navy mb-1 block">Suffix</label>
                    <select name="suffix" value={localUserInfo.suffix} onChange={handleInputChange} className="w-full h-[42px] px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gabay-teal/20 focus:border-gabay-teal transition-all bg-white text-sm">
                      <option value="">None</option> <option value="Jr.">Jr.</option> <option value="Sr.">Sr.</option> <option value="I">I</option> 
                      <option value="II">II</option> <option value="III">III</option> <option value="IV">IV</option> <option value="V">V</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-x-6 pt-3">
                  <Input label="Role" value={localUserInfo.role} readOnly noHover className="bg-gray-100" />
                  <Input label="Date of Birth" name="dob" value={localUserInfo.dob} onChange={handleInputChange} onIconClick={handleCalendarChange} readOnly={!isEditing} isEditing={isEditing} placeholder="MM/DD/YYYY" maxLength={10} error={errors.dob} required />
                  <div className="flex flex-col md:col-span-2 lg:col-span-1">
                    <label className="text-sm font-medium text-gabay-navy mb-2 block">Gender</label>
                    <div className="flex gap-6 items-center h-10">
                      {["Female", "Male"].map((g) => (
                        <label key={g} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="gender" value={g} checked={localUserInfo.gender === g} onChange={handleInputChange} className="accent-gabay-blue w-4 h-4" />
                          <span className="text-base">{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <Input label="Full Name" value={getFullDisplayName()} readOnly noHover />
                  <Input label="Role" value={localUserInfo.role} readOnly noHover className="bg-gray-100" />
                  <Input label="Date of Birth" value={localUserInfo.dob} readOnly noHover />
                  <Input label="Gender" value={localUserInfo.gender} readOnly noHover />
                </div>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-base font-bold text-gabay-teal mb-5 tracking-widest uppercase">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <Input label="Email Address" value={localUserInfo.email} readOnly noHover className="bg-gray-50"/>
              <Input label="Contact Number" name="contactNumber" value={localUserInfo.contactNumber} onChange={handleInputChange} error={errors.contactNumber} readOnly={!isEditing} isEditing={isEditing} required maxLength={11} placeholder="09XXXXXXXXX" />
              <div className="md:col-span-2">
                <Input label="Home Address" name="address" value={localUserInfo.address} onChange={handleInputChange} readOnly={!isEditing} isEditing={isEditing} placeholder="Enter your home address" />
              </div>
            </div>
          </section>

          {isEditing && (
            <div className="flex gap-4 pt-2">
              <button onClick={() => { setLocalUserInfo(tempUserInfo); setIsEditing(false); setErrors({}); }} className="px-8 py-1 rounded-full border border-gabay-teal text-base text-gabay-teal font-poppins font-semibold hover:bg-teal-50 bg-white transition-all text-sm">CANCEL</button>
              <button onClick={handleSave} className="px-10 py-2 rounded-full bg-gabay-teal text-base text-white font-poppins font-semibold hover:bg-teal-600 transition-all shadow-md text-sm">SAVE CHANGES</button>
            </div>
          )}
        </div>

        <div className="w-full lg:w-72 flex flex-col items-center lg:items-start border-l border-gray-100 pl-0 lg:pl-12">
          <div className="flex flex-col items-center lg:items-start mb-8">
            <div className="relative group w-40 h-40" onClick={isEditing ? handleImageClick : null}>
              <div className={`w-40 h-40 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg transition-all ${isEditing ? 'cursor-pointer' : ''}`}>
                <img 
                  src={localUserInfo.profilePhoto || "/default-avatar.png"} 
                  alt="Profile Photo" 
                  className="w-full h-full object-cover" 
                />
                {isEditing && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Camera size={24} className="text-white mb-1" />
                    <span className="text-white text-[11px] font-bold font-montserrat text-center">Edit Image</span>
                  </div>
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-md text-gabay-blue hover:text-gabay-teal transition-colors z-10 border border-gray-100 pointer-events-none">
                  <Camera size={18} />
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            {isEditing && (
              <p className="text-[10px] text-gray-400 mt-4 text-center lg:text-left leading-relaxed">
                Must be in .jpg or .png format <br/> Maximum file size allowed: 100mb
              </p>
            )}
          </div>

          <div className="w-full flex flex-col items-center lg:items-start gap-4 pt-4 md:pt-0">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Account Settings</h3>
            {isEditing && (
              <div className="flex flex-col items-center lg:items-start gap-4 w-full">
                <button onClick={() => { setChangeModalType('email'); setIsChangeModalOpen(true); }} className="block text-gabay-blue hover:text-gabay-navy transition-colors hover:underline text-sm font-medium">Change Email</button>
                <button onClick={() => { setChangeModalType('password'); setIsChangeModalOpen(true); }} className="block text-gabay-blue hover:text-gabay-navy transition-colors hover:underline text-sm font-medium">Change Password</button>
                <div className="w-full border-t border-gray-100 pt-3"></div>
              </div>
            )}
            <button onClick={openLogoutModal} className="flex items-center gap-2 text-gabay-teal hover:underline transition-colors hover:text-gabay-teal2 text-sm font-bold">
              <LogOut size={18} /> Log Out
            </button>
          </div>
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