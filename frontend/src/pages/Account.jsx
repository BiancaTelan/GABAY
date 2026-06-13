import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/input';
import { LogOut, Trash2, CheckCircle } from 'lucide-react';
import { emailPattern, namePattern, phonePattern, dobPattern, minAgeRequirement } from '../utils/constants';
import ConfirmationModal from '../components/confirmModal';
import ChangeModal from '../components/changeModal';
import { AuthContext } from '../authContext';

export default function Account({ userInfo, onLogout, onUpdateProfile }) {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  
  const [localUserInfo, setLocalUserInfo] = useState({
    firstname: "",
    middlename: "",
    surname: "",
    extension: "",
    hospital_num: "",
    email: "",
    contactNumber: "",
    dob: "",
    age: "",
    gender: "Female",
    houseNumber: "",
    barangay: "",
    city: "",
    postalCode: "",
    province: "",
    guardianFirstName: "",
    guardianMiddleName: "",
    guardianSurname: "",
    guardianExtension: "",
    guardianContactNum: "",
    relationship: "",
    emergencyContact: "",
    emergencyContactNum: "",
    emergencyEmail: ""
  });

  const [isMinor, setIsMinor] = useState(false);
  const [tempUserInfo, setTempUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (localUserInfo.age && Number(localUserInfo.age) < 18) {
      setIsMinor(true);
    }
  }, [localUserInfo.age]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userEmail = payload.sub;

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/patients/profile/${userEmail}`);
        if (response.ok) {
          const data = await response.json();
          setLocalUserInfo(data);
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    };
    
    fetchProfile();
  }, [token]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const calculateAge = (dobString) => {
    if (!dobString || dobString.includes('M')) return "";
    const parts = dobString.split('/');
    if (parts.length !== 3) return "";
    const [m, d, y] = parts.map(Number);
    if (!m || !d || !y || y.toString().length !== 4) return "";
    
    const today = new Date();
    const birthDate = new Date(y, m - 1, d);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge >= 0 ? calculatedAge.toString() : "0";
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === 'dob' && isEditing) {
      const cleanValue = value.replace(/\D/g, ''); 
      if (cleanValue.length <= 2) value = cleanValue;
      else if (cleanValue.length <= 4) value = `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`;
      else value = `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}/${cleanValue.slice(4, 8)}`;
    }
    
    setLocalUserInfo(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'dob' && value.length === 10) {
        updated.age = calculateAge(value);
      }
      return updated;
    });

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCalendarChange = (e) => {
    const dateValue = e.target.value; 
    if (!dateValue) return;
    const [y, m, d] = dateValue.split('-');
    const formattedDob = `${m}/${d}/${y}`;
    
    setLocalUserInfo(prev => ({ 
      ...prev, 
      dob: formattedDob,
      age: calculateAge(formattedDob)
    }));

    if (errors.dob) setErrors(prev => ({ ...prev, dob: null }));
  };

  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });
  
  const openLogoutModal = () => {
    setModalConfig({
      isOpen: true,
      type: 'info',
      title: 'Log Out',
      message: 'Are you sure you want to log out of GABAY? You will need to sign in again to book appointments.',
      onConfirm: () => {
        onLogout(); 
        navigate('/');
      }
    });
  };

  const openDeleteModal = () => {
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: 'Delete Account',
      message: 'This action is permanent. Your hospital records and appointment history will be removed from the GABAY system.',
      onConfirm: async () => {
        closeModal();
        
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/patients/delete-account`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to delete account.");
          }

          console.log("Account successfully deleted from database.");
          onLogout(); 
          navigate('/'); 
          
        } catch (error) {
          console.error("Error deleting account:", error);
          alert(error.message);
        }
      }
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('password');

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  const validate = () => {
    let newErrors = {};
    const today = new Date(); 

    if (!localUserInfo.firstname.trim()) newErrors.firstname = "First name is required";
    else if (!namePattern.test(localUserInfo.firstname)) newErrors.firstname = "Name cannot contain numbers";
    
    if (!namePattern.test(localUserInfo.middlename)) newErrors.middlename = "Name cannot contain numbers";

    if (!localUserInfo.surname.trim()) newErrors.surname = "Last name is required";
    else if (!namePattern.test(localUserInfo.surname)) newErrors.surname = "Name cannot contain numbers";

    if (!localUserInfo.dob.trim() || localUserInfo.dob === "MM/DD/YYYY") {
      newErrors.dob = "Date of birth is required";
    } else if (!dobPattern.test(localUserInfo.dob)) {
      newErrors.dob = "Please use MM/DD/YYYY format";
    } else {
      const [m, d, y] = localUserInfo.dob.split('/').map(Number);
      const birthDate = new Date(y, m - 1, d);
      if (birthDate > today) newErrors.dob = "Invalid date of birth";
      else {
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
        
        if (!isMinor && age < minAgeRequirement) {
          newErrors.dob = `USER MUST BE ATLEAST ${minAgeRequirement} YEARS OLD`;
        }
      }
    }

    if (isMinor) {
      if (!localUserInfo.guardianFirstName.trim()) newErrors.guardianFirstName = "Guardian first name is required";
      else if (!namePattern.test(localUserInfo.guardianFirstName)) newErrors.guardianFirstName = "Name must contain letters only";

      if (!localUserInfo.guardianSurname.trim()) newErrors.guardianSurname = "Guardian last name is required";
      else if (!namePattern.test(localUserInfo.guardianSurname)) newErrors.guardianSurname = "Name must contain letters only";

      if (!localUserInfo.guardianContactNum.trim()) newErrors.guardianContactNum = "Guardian contact number is required";
      else if (!phonePattern.test(localUserInfo.guardianContactNum)) newErrors.guardianContactNum = "Must be an 11-digit mobile number";

      if (!localUserInfo.relationship) newErrors.relationship = "Relationship specification is required";
    }

    if (!localUserInfo.contactNumber.trim()) newErrors.contactNumber = "Contact number is required";
    else if (!phonePattern.test(localUserInfo.contactNumber)) newErrors.contactNumber = "Must be a valid 11-digit number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartEdit = () => {
    setTempUserInfo({ ...localUserInfo });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setLocalUserInfo(tempUserInfo);
    setErrors({});
    setIsEditing(false);
  };

const handleSave = async () => {
    if (validate()) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/patients/update-profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localUserInfo)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to save changes.");
        }

        if (onUpdateProfile) {
          onUpdateProfile(localUserInfo);
        }
        setIsEditing(false);
        setShowToast(true);

      } catch (error) {
        console.error("Save Error:", error);
        alert(error.message); 
      }
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr || dateStr.includes('/')) return dateStr;
    const [y, m, d] = dateStr.split('-');
    return `${m}/${d}/${y}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 font-poppins relative text-left animate-in fade-in duration-500">
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
          <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/20">
            <CheckCircle size={20} className="text-white" />
            <span className="font-medium font-montserrat text-sm tracking-wide">Changes saved successfully!</span>
          </div>
        </div>
      )}

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
                  onClick={handleStartEdit} 
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
            <h2 className="text-lg font-semibold text-gabay-blue mb-1 tracking-wider uppercase">Patient Information</h2>
             <label className="flex items-center cursor-pointer group mb-6 tracking-wide uppercase">
                <input 
                  type="checkbox" 
                  checked={isMinor}
                  disabled={!isEditing}
                  onChange={(e) => setIsMinor(e.target.checked)}
                  className="w-4 h-4 border-gray-300 rounded bg-gabay-blue focus:ring-gabay-blue cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="ml-2 text-xs font-poppins text-gray-600 group-hover:text-gabay-blue transition-colors">
                  Is Patient under 18 years old?
                </span>
              </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {isEditing ? (
                <>
                  <Input label="First Name" name="firstname" value={localUserInfo.firstname} onChange={handleInputChange} error={errors.firstname} isEditing={isEditing} required />
                  <Input label="Middle Name" name="middlename" value={localUserInfo.middlename} onChange={handleInputChange} error={errors.middlename} isEditing={isEditing} /> 
                  <Input label="Last Name" name="surname" value={localUserInfo.surname} onChange={handleInputChange} error={errors.surname} isEditing={isEditing} required />
                  <div className="flex flex-col gap-1 w-full">
                  <label className="text-sm font-poppins font-medium text-gray-700">Name Extension</label>
                  <select value={localUserInfo.extension || ""} onChange={(e) => setLocalUserInfo({ ...localUserInfo, extension: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md font-poppins text-sm bg-white outline-none focus:ring-1 focus:ring-gabay-teal text-gray-700 cursor-pointer">
                    <option value="">None (N/A)</option>
                    <option value="Jr.">Jr.</option>
                    <option value="Sr.">Sr.</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                    <option value="V">V</option>
                  </select>
                  </div>
                </>
              ) : (
                <Input label="Full Name" value={[
                  localUserInfo.firstname,
                  localUserInfo.middlename,
                  localUserInfo.surname,
                  localUserInfo.extension
                  ].filter(Boolean).join(' ')} readOnly noHover />
              )}
              
              <Input label="Hospital Number" value={localUserInfo.hospital_num} readOnly noHover />
              <div className="relative">
                <Input 
                  label={
                    <div className="flex items-center gap-2">
                      Email Address
                      {localUserInfo.is_verified === false && (
                        <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
                          Unverified
                        </span>
                      )}
                    </div>
                  } 
                  name="email" 
                  value={localUserInfo.email} 
                  readOnly={true} 
                  noHover={true} 
                  error={errors.email} 
                  isEditing={false} 
                  required 
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gabay-navy mb-1">Gender</label>
                {isEditing ? (
                  <div className="flex items-center gap-6 h-[40px]">
                    {["Female", "Male"].map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" value={g} checked={localUserInfo.gender === g} onChange={handleInputChange} className="accent-gabay-blue h-4 w-4" />
                        <span className="text-base">{g}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <Input value={localUserInfo.gender} readOnly noHover />
                )}
              </div>

              <Input 
                label="Date of Birth" 
                name="dob" 
                value={isEditing ? localUserInfo.dob : formatDisplayDate(localUserInfo.dob)} 
                onChange={handleInputChange} 
                onIconClick={handleCalendarChange}
                readOnly={!isEditing} 
                noHover={!isEditing}
                isEditing={isEditing}
                required
                placeholder="MM/DD/YYYY"
                maxLength={10}
                error={errors.dob}
              />
              
              <Input label="Age" name="age" value={localUserInfo.age} readOnly noHover />
              <Input label="Contact Number" name="contactNumber" value={localUserInfo.contactNumber} onChange={handleInputChange} readOnly={!isEditing} noHover={!isEditing} isEditing={isEditing} required error={errors.contactNumber} />

              <div className="md:col-span-2">
                {isEditing ? (
                  <div className="grid col-span-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="House No. / Street / Subdivision" 
                      name="houseNumber" 
                      value={localUserInfo.houseNumber || ""} 
                      onChange={handleInputChange} 
                      error={errors.houseNumber} 
                      isEditing={isEditing} 
                      required 
                    />
                    
                    <Input 
                      label="Barangay" 
                      name="barangay" 
                      value={localUserInfo.barangay || ""} 
                      onChange={handleInputChange} 
                      error={errors.barangay} 
                      isEditing={isEditing} 
                      required 
                    />

                    <Input 
                      label="City / Municipality" 
                      name="city" 
                      value={localUserInfo.city || ""} 
                      onChange={handleInputChange} 
                      error={errors.city} 
                      isEditing={isEditing} 
                      required 
                    />

                    <Input 
                      label="Province" 
                      name="province" 
                      value={localUserInfo.province || ""} 
                      onChange={handleInputChange} 
                      error={errors.province} 
                      isEditing={isEditing} 
                      required 
                    />

                    <Input 
                      label="Postal Code" 
                      name="postalCode" 
                      value={localUserInfo.postalCode || ""} 
                      onChange={handleInputChange} 
                      error={errors.postalCode} 
                      isEditing={isEditing} 
                      required 
                    />
                  </div>
                ) : (
                  <Input 
                    label="Home Address" 
                    value={[
                      localUserInfo.houseNumber,
                      localUserInfo.barangay,
                      localUserInfo.city,
                      localUserInfo.province,
                      localUserInfo.postalCode
                    ].filter(Boolean).join(', ')} 
                    readOnly 
                    noHover 
                  />
                )}
              </div>

            </div>
          </section>


          {isMinor && isEditing && (
            <section className="animate-in slide-in-from-top-4 duration-300">
              <h2 className="text-lg font-semibold text-gabay-blue mb-6 tracking-wider uppercase">Guardian Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 items-start">
                <Input label="First Name" name="guardianFirstName" value={localUserInfo.guardianFirstName} onChange={handleInputChange} error={errors.guardianFirstName} isEditing={isEditing} required />
                <Input label="Middle Name" name="guardianMiddleName" value={localUserInfo.guardianMiddleName} onChange={handleInputChange} error={errors.guardianMiddleName} isEditing={isEditing} /> 
                <Input label="Last Name" name="guardianSurname" value={localUserInfo.guardianSurname} onChange={handleInputChange} error={errors.guardianSurname} isEditing={isEditing} required />
                
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-sm font-poppins font-medium text-gray-700">Name Extension</label>
                  <select value={localUserInfo.guardianExtension || ""} onChange={(e) => setLocalUserInfo({ ...localUserInfo, guardianExtension: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md font-poppins text-sm bg-white outline-none focus:ring-1 focus:ring-gabay-teal text-gray-700 cursor-pointer">
                    <option value="">None (N/A)</option>
                    <option value="Jr.">Jr.</option>
                    <option value="Sr.">Sr.</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                    <option value="V">V</option>
                  </select>
                </div>

                <Input label="Contact Number" name="guardianContactNum" value={localUserInfo.guardianContactNum} onChange={handleInputChange} isEditing={isEditing} error={errors.guardianContactNum} required />
                
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-sm font-poppins font-medium text-gray-700">Relationship to Patient</label>
                  <select value={localUserInfo.relationship || ""} onChange={(e) => setLocalUserInfo({ ...localUserInfo, relationship: e.target.value })}
                    className={`w-full p-2 border rounded-md font-poppins text-sm bg-white outline-none transition-all h-[38px] text-gray-700 cursor-pointer ${
                    errors.relationship ? 'border-red-500 focus:ring-1 focus:ring-red-500 ring-1 ring-red-500/20' : 'border-gray-300 focus:ring-1 focus:ring-gabay-teal'}`} required>
                    <option value="">Select Relationship</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Extended Relative">Extended Relative</option>
                  </select>
                  {errors.relationship && <p className="text-[10px] text-red-500 font-poppins font-bold uppercase">{errors.relationship}</p>}
                </div>
              </div>
            </section>
          )}

          {isMinor && !isEditing && (
            <section className="animate-in fade-in duration-300">
              <h2 className="text-lg font-semibold text-gabay-blue mb-6 tracking-wider uppercase">Guardian Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <Input label="Guardian Full Name" value={[
                  localUserInfo.guardianFirstName,
                  localUserInfo.guardianMiddleName,
                  localUserInfo.guardianSurname,
                  localUserInfo.guardianExtension
                ].filter(Boolean).join(' ')} readOnly noHover />

                <Input label="Guardian Contact Number" value={localUserInfo.guardianContactNum} readOnly noHover />
                <Input label="Relationship to Patient" value={localUserInfo.relationship} readOnly noHover />
              </div>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold text-gabay-blue mb-6 tracking-wider uppercase">Emergency Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <Input label="Emergency Contact" name="emergencyContact" value={localUserInfo.emergencyContact} onChange={handleInputChange} readOnly={!isEditing} noHover={!isEditing} isEditing={isEditing} error={errors.emergencyContact} />
              <Input label="Emergency Contact Number" name="emergencyContactNum" value={localUserInfo.emergencyContactNum} onChange={handleInputChange} readOnly={!isEditing} noHover={!isEditing} isEditing={isEditing} error={errors.emergencyContactNum} />
              <div className="md:col-span-1">
                <Input label="Emergency Email Address" name="emergencyEmail" value={localUserInfo.emergencyEmail} onChange={handleInputChange} readOnly={!isEditing} noHover={!isEditing} isEditing={isEditing} error={errors.emergencyEmail} />
              </div>
            </div>
          </section>

          {isEditing && (
            <div className="flex gap-3.5 pt-1">
              <button onClick={handleCancel} className="px-8 py-1.5 rounded-full border border-gabay-teal text-sm text-gabay-teal font-semibold hover:bg-teal-50 transition-all">CANCEL</button>
              <button onClick={handleSave} className="px-8 py-1.5 rounded-full bg-gabay-teal text-sm text-white font-semibold hover:bg-teal-600 shadow-md transition-all">SAVE CHANGES</button>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="w-full md:w-64 flex flex-col items-start gap-4 border-l border-gray-100 pl-8 pt-10">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Account Settings</h3>
          <button onClick={openLogoutModal} className="flex items-center gap-2 text-gabay-teal hover:text-teal-700 transition-colors hover:underline text-sm font-semibold text-left">
            <LogOut size={18} /> Log Out
          </button>
          {isEditing && (
            <>
              <button onClick={() => { setModalType('email'); setIsModalOpen(true); }}
              className="text-gabay-blue hover:text-gabay-navy transition-colors hover:underline text-sm font-medium text-left">
              Change Email
              </button>

              <button onClick={() => { setModalType('password'); setIsModalOpen(true); }}
              className="text-gabay-blue hover:text-gabay-navy transition-colors hover:underline text-sm font-medium text-left">
              Change Password
              </button>
              
              <button onClick={openDeleteModal} className="text-red-500 hover:text-red-700 text-sm font-semibold mt-10 underline w-full flex gap-2 text-left">
                <Trash2 size={16} /> Delete Account
              </button>
            </>
          )}
        </div>
      </div>

      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />

      <ChangeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        type={modalType} 
        currentEmail={localUserInfo.email}
        setShowToast={setShowToast}
      />
    </div>
  );
}