import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/input';
import Button from '../components/button';
import { AuthContext } from '../authContext';
import { phonePattern, dobPattern, minAgeRequirement } from '../utils/constants';
import toast from 'react-hot-toast';
import { getApiErrorMessage, parseJsonResponse, showValidationError } from '../utils/apiError';
import { CheckCircle, Info } from 'lucide-react';
import YesIcon from '../assets/personCheck.png';
import NoIcon from '../assets/personCancel.png';
import { getZipCode, getLocationByZip } from '../utils/locationUtils'; 

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { token, updateUserInfo } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [formData, setFormData] = useState({
    firstname: '', middlename: '', surname: '', suffix: '',
    dob: '', age: '', gender: 'Female', civilStatus: '',
    contactNumber: '', street: '', barangay: '', city: '', province: '', postalCode: '',
    emergencyContact: '', emergencyContactNum: '', emergencyEmail: '',
    guardianFirstName: '', guardianMiddleName: '', guardianSurname: '', guardianExtension: '', guardianContactNum: '', guardianRelationship: '',
    hospitalChoice: null,
    hospitalNumInput: ''
  });

  const [isMinor, setIsMinor] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/patients/profile/${payload.sub}`);
        const data = await response.json();
        setFormData(prev => ({ ...prev, firstname: data.firstname, middlename: data.middlename, surname: data.surname, suffix: data.suffix || '' }));
      } catch (err) {
        console.error("Failed to fetch initial profile");
      }
    };
    fetchProfile();

    fetch('https://psgc.gitlab.io/api/provinces/')
      .then(res => res.json())
      .then(data => {
        const ncr = { code: '130000000', name: 'METRO MANILA', isRegion: true };
        setProvinces([...data, ncr].sort((a, b) => a.name.localeCompare(b.name)));
      });
  }, [token]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.province) return;
      const selectedProv = provinces.find(p => p.name.toUpperCase() === formData.province.toUpperCase());
      
      if (selectedProv) {
        const url = selectedProv.isRegion 
          ? `https://psgc.gitlab.io/api/regions/${selectedProv.code}/cities-municipalities/`
          : `https://psgc.gitlab.io/api/provinces/${selectedProv.code}/cities-municipalities/`;
        const res = await fetch(url);
        const data = await res.json();
        setCities(data.sort((a, b) => a.name.localeCompare(b.name)));

        if (formData.province !== selectedProv.name) {
           setFormData(prev => ({ ...prev, province: selectedProv.name }));
        }
      }
    };
    if (provinces.length > 0) fetchCities();
  }, [formData.province, provinces]);

  useEffect(() => {
    const fetchBarangays = async () => {
      if (!formData.city) return;
      
      const selectedCity = cities.find(c => c.name.toUpperCase().includes(formData.city.toUpperCase()));
      
      if (selectedCity) {
        const res = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${selectedCity.code}/barangays/`);
        const data = await res.json();
        setBarangays(data.sort((a, b) => a.name.localeCompare(b.name)));

        if (formData.city !== selectedCity.name) {
           setFormData(prev => ({ ...prev, city: selectedCity.name }));
        }
      }
    };
    if (cities.length > 0) fetchBarangays();
  }, [formData.city, cities]);

  const handleProvinceChange = (e) => {
    const provinceName = e.target.value;
    setFormData(prev => ({ ...prev, province: provinceName, city: '', barangay: '' }));
    setCities([]); 
    setBarangays([]);
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    const autoZip = getZipCode(formData.province, cityName);
    setFormData(prev => ({ ...prev, 
      city: cityName, 
      barangay: '',
      postalCode: autoZip || prev.postalCode 
    }));
    setBarangays([]);
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'hospitalNumInput') {
      const digits = value.replace(/\D/g, '');
      value = digits.length <= 2 ? digits : `${digits.slice(0, 2)}-${digits.slice(2, 8)}`;
    }

    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      if (name === 'dob' && value) {
        const [y, m, d] = value.split('-');
        const birthDate = new Date(y, m - 1, d);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        updated.age = age;
        setIsMinor(age < 18);
      }

      if (name === 'postalCode' && value.length === 4) {
        const locationInfo = getLocationByZip(value);
        if (locationInfo) {
          updated.province = locationInfo.province;
          updated.city = locationInfo.city;
          updated.barangay = ''; 
        }
      }

      return updated;
    });

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateStep1 = () => {
    let newErrors = {};
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    } else if (formData.age < 0) {
      newErrors.dob = "Date of birth cannot be in the future";
    } else if (formData.age > 110) {
      newErrors.dob = "Age cannot exceed 110 years old";
    }
    if (!formData.contactNumber || !phonePattern.test(formData.contactNumber)) newErrors.contactNumber = "Valid 11-digit number required";
    if (!formData.civilStatus) newErrors.civilStatus = "Civil status is required";
    if (!formData.street) newErrors.street = "Street/House No. is required";
    if (!formData.barangay) newErrors.barangay = "Barangay is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.province) newErrors.province = "Province is required";
    if (!formData.postalCode) newErrors.postalCode = "Postal code is required";

    if (isMinor) {
      if (!formData.guardianFirstName.trim()) newErrors.guardianFirstName = "Guardian first name is required";
      if (!formData.guardianSurname.trim()) newErrors.guardianSurname = "Guardian last name is required";
      if (!formData.guardianContactNum.trim() || !phonePattern.test(formData.guardianContactNum)) newErrors.guardianContactNum = "Valid 11-digit mobile number required";
      if (!formData.guardianRelationship) newErrors.guardianRelationship = "Relationship is required";
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) showValidationError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (!formData.hospitalChoice) {
      toast.error("Please select an option regarding your hospital number.");
      return false;
    }
    if (formData.hospitalChoice === 'link' && formData.hospitalNumInput.length < 9) {
      setErrors({ hospitalNumInput: "Must be a valid format (e.g., 26-123456)" });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const [y, m, d] = formData.dob.split('-');
      const profilePayload = {
        ...formData,
        dob: formData.dob 
      };

      const profileRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/patients/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(profilePayload)
      });
      if (!profileRes.ok) throw new Error("Failed to save personal information.");

      if (formData.hospitalChoice === 'link') {
        const linkRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/patients/link-hospital-number`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ hospital_num: formData.hospitalNumInput })
        });
        if (!linkRes.ok) throw new Error("Failed to link hospital number. It may already be in use.");
      } else {
        const genRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/patients/generate-hospital-number`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!genRes.ok) throw new Error("Failed to generate hospital number.");
      }

      toast.success("Account setup complete! Welcome to GABAY.");
      if (updateUserInfo) updateUserInfo({ isProfileComplete: true });
      navigate('/'); 

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 font-poppins">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* Header / Progress Bar */}
        <div className="bg-gabay-blue p-8 text-white">
          <h1 className="text-3xl font-montserrat font-bold">Complete Your Profile</h1>
          <p className="text-sm mt-2 text-blue-100">Please provide your details to fully activate your account.</p>
          
          <div className="flex items-center justify-between mt-8 relative">
            <div className="absolute left-0 top-1/2 w-full h-1 bg-blue-800 -z-0 rounded"></div>
            <div className="absolute left-0 top-1/2 h-1 bg-gabay-teal transition-all duration-500 z-0" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
            
            {['Personal Details', 'Hospital Number', 'Review'].map((label, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= idx + 1 ? 'bg-gabay-teal text-white shadow-[0_0_10px_rgba(51,175,174,0.8)]' : 'bg-blue-900 text-blue-300'}`}>
                  {step > idx + 1 ? <CheckCircle size={16} /> : idx + 1}
                </div>
                <span className={`text-xs mt-2 font-semibold ${step >= idx + 1 ? 'text-white' : 'text-blue-300'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 md:p-12">
          {/* STEP 1: PERSONAL DETAILS */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <h2 className="text-xl font-bold text-gabay-navy font-montserrat border-b pb-2">Personal & Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">Date of Birth</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full border p-2.5 rounded-xl text-sm outline-none bg-gray-50 focus:ring-2 focus:ring-gabay-teal/20 focus:border-gabay-teal transition-all" />
                    {errors.dob && <span className="text-red-500 text-xs mt-1">{errors.dob}</span>}
                </div>
                
                <Input label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} error={errors.contactNumber} placeholder="09XXXXXXXXX" isEditing />

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full border p-2.5 rounded-xl text-sm outline-none bg-gray-50 focus:ring-2 focus:ring-gabay-teal/20 focus:border-gabay-teal">
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">Civil Status</label>
                  <select name="civilStatus" value={formData.civilStatus} onChange={handleInputChange} className="w-full border p-2.5 rounded-xl text-sm outline-none bg-gray-50 focus:ring-2 focus:ring-gabay-teal/20 focus:border-gabay-teal">
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                  {errors.civilStatus && <span className="text-red-500 text-xs mt-1">{errors.civilStatus}</span>}
                </div>
              </div>

              <h2 className="text-xl font-bold text-gabay-navy font-montserrat border-b pb-2 pt-4">Address Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="House No./Street" name="street" value={formData.street} onChange={handleInputChange} error={errors.street} isEditing />
                
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">Province</label>
                    <select value={formData.province} onChange={handleProvinceChange} className="w-full border p-2.5 rounded-xl text-sm outline-none bg-gray-50 focus:ring-2 focus:ring-gabay-teal/20 focus:border-gabay-teal">
                    <option value="" disabled>Select Province</option>
                    {provinces.map(prov => <option key={prov.code} value={prov.name}>{prov.name}</option>)}
                    </select>
                    {errors.province && <span className="text-red-500 text-xs mt-1">{errors.province}</span>}
                </div>

                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">City / Municipality</label>
                    <select disabled={!formData.province} value={formData.city} onChange={handleCityChange} className="w-full border p-2.5 rounded-xl text-sm outline-none bg-gray-50 focus:ring-2 focus:ring-gabay-teal/20 focus:border-gabay-teal disabled:opacity-50">
                    <option value="" disabled>Select City</option>
                    {cities.map(city => <option key={city.code} value={city.name}>{city.name}</option>)}
                    </select>
                    {errors.city && <span className="text-red-500 text-xs mt-1">{errors.city}</span>}
                </div>

                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">Barangay</label>
                    <select disabled={!formData.city} name="barangay" value={formData.barangay} onChange={handleInputChange} className="w-full border p-2.5 rounded-xl text-sm outline-none bg-gray-50 focus:ring-2 focus:ring-gabay-teal/20 focus:border-gabay-teal disabled:opacity-50">
                    <option value="" disabled>Select Barangay</option>
                    {barangays.map(brgy => <option key={brgy.code} value={brgy.name}>{brgy.name}</option>)}
                    </select>
                    {errors.barangay && <span className="text-red-500 text-xs mt-1">{errors.barangay}</span>}
                </div>
                <Input label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleInputChange} error={errors.postalCode} isEditing />
              </div>

              <h2 className="text-xl font-bold text-gabay-navy font-montserrat border-b pb-2 pt-4">Emergency Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Emergency Contact Name" 
                  name="emergencyContact" 
                  value={formData.emergencyContact} 
                  onChange={handleInputChange} 
                  error={errors.emergencyContact} 
                  isEditing 
                />
                <Input 
                  label="Emergency Contact Number" 
                  name="emergencyContactNum" 
                  value={formData.emergencyContactNum} 
                  onChange={handleInputChange} 
                  error={errors.emergencyContactNum} 
                  isEditing 
                />
                <div className="md:col-span-2">
                  <Input 
                    label="Emergency Email Address (Optional)" 
                    type="email"
                    name="emergencyEmail" 
                    value={formData.emergencyEmail} 
                    onChange={handleInputChange} 
                    error={errors.emergencyEmail} 
                    isEditing 
                  />
                </div>
              </div>

              {/* Conditional Guardian Section */}
              {isMinor && (
                <>
                  <h2 className="text-xl font-bold text-gabay-navy font-montserrat border-b pb-2 pt-4">Guardian Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="First Name" name="guardianFirstName" value={formData.guardianFirstName} onChange={handleInputChange} error={errors.guardianFirstName} isEditing />
                    <Input label="Middle Name" name="guardianMiddleName" value={formData.guardianMiddleName} onChange={handleInputChange} error={errors.guardianMiddleName} isEditing />
                    <Input label="Last Name" name="guardianSurname" value={formData.guardianSurname} onChange={handleInputChange} error={errors.guardianSurname} isEditing />
                    
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-gray-600 mb-1">Name Extension</label>
                      <select name="guardianExtension" value={formData.guardianExtension} onChange={handleInputChange} className="w-full border p-2.5 rounded-xl text-sm outline-none bg-gray-50 focus:ring-2 focus:ring-gabay-teal/20 focus:border-gabay-teal">
                        <option value="">None (N/A)</option>
                        <option value="Jr.">Jr.</option>
                        <option value="Sr.">Sr.</option>
                        <option value="II">II</option>
                        <option value="III">III</option>
                        <option value="IV">IV</option>
                        <option value="V">V</option>
                      </select>
                    </div>

                    <Input label="Contact Number" name="guardianContactNum" value={formData.guardianContactNum} onChange={handleInputChange} error={errors.guardianContactNum} isEditing />
                    
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-gray-600 mb-1">Relationship</label>
                      <select name="guardianRelationship" value={formData.guardianRelationship} onChange={handleInputChange} className="w-full border p-2.5 rounded-xl text-sm outline-none bg-gray-50 focus:ring-2 focus:ring-gabay-teal/20 focus:border-gabay-teal">
                        <option value="">Select Relationship</option>
                        <option value="Parent">Parent</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Grandparent">Grandparent</option>
                        <option value="Extended Relative">Extended Relative</option>
                      </select>
                      {errors.guardianRelationship && <span className="text-red-500 text-xs mt-1">{errors.guardianRelationship}</span>}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end pt-6">
                <Button variant="teal" onClick={handleNext} className="w-32">NEXT</Button>
              </div>
            </div>
          )}

          {/* STEP 2: HOSPITAL NUMBER */}
          {step === 2 && (
             <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gabay-navy font-montserrat">Do you have an existing hospital number?</h2>
                    <p className="text-gray-500 mt-2 text-sm">A hospital number is uniquely assigned to one patient only. It cannot be shared.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* OPTION: YES */}
                    <div 
                        onClick={() => setFormData(prev => ({ ...prev, hospitalChoice: 'link' }))}
                        className={`cursor-pointer rounded-2xl border-2 p-6 flex flex-col items-center justify-center text-center transition-all ${formData.hospitalChoice === 'link' ? 'border-gabay-teal bg-teal-50 shadow-md' : 'border-gray-200 hover:border-gabay-teal/50 bg-white'}`}
                    >
                        <img src={YesIcon} alt="Yes" className="w-16 h-16 mb-4" />
                        <h3 className="font-bold text-lg text-gabay-teal mb-2">YES</h3>
                        <p className="text-sm text-gray-600">I already have a hospital number.</p>
                    </div>

                    {/* OPTION: NO */}
                    <div 
                        onClick={() => setFormData(prev => ({ ...prev, hospitalChoice: 'generate' }))}
                        className={`cursor-pointer rounded-2xl border-2 p-6 flex flex-col items-center justify-center text-center transition-all ${formData.hospitalChoice === 'generate' ? 'border-gabay-teal bg-teal-50 shadow-md' : 'border-gray-200 hover:border-gabay-teal/50 bg-white'}`}
                    >
                        <img src={NoIcon} alt="No" className="w-16 h-16 mb-4" />
                        <h3 className="font-bold text-lg text-gabay-teal mb-2">NO</h3>
                        <p className="text-sm text-gray-600">I am a new patient / I don't have one.</p>
                    </div>
                </div>

                {formData.hospitalChoice === 'link' && (
                    <div className="mt-8 p-6 bg-gray-50 rounded-xl border animate-in slide-in-from-top-4">
                        <Input 
                            label="Enter Existing Hospital Number" 
                            name="hospitalNumInput" 
                            value={formData.hospitalNumInput} 
                            onChange={handleInputChange} 
                            placeholder="e.g. 26-123456" 
                            error={errors.hospitalNumInput} 
                            isEditing 
                            maxLength={9}
                        />
                    </div>
                )}
                {formData.hospitalChoice === 'generate' && (
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-4">
                        <Info size={20} className="text-gabay-blue shrink-0 mt-0.5" />
                        <p className="text-sm text-gabay-navy">
                            The system will automatically generate a new, permanent hospital number for you upon final submission.
                        </p>
                    </div>
                )}

                <div className="flex justify-between pt-6">
                    <button onClick={() => setStep(1)} className="font-semibold text-gray-500 hover:text-gray-800 transition">← Back</button>
                    <Button variant="teal" onClick={handleNext} className="w-32">NEXT</Button>
                </div>
             </div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <h2 className="text-xl font-bold text-gabay-navy font-montserrat border-b pb-2">Review Your Information</h2>
                
                <div className="bg-gray-50 rounded-xl p-6 space-y-6 shadow-sm border border-gray-100">
                    
                    {/* Personal Details */}
                    <div>
                        <h4 className="font-bold text-gabay-teal mb-3 text-xs uppercase tracking-wider border-b border-gray-200 pb-1">Personal Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="sm:col-span-2">
                                <span className="font-semibold text-gray-500 block">Full Name</span>
                                {[formData.firstname, formData.middlename, formData.surname, formData.suffix].filter(Boolean).join(' ')}
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500 block">Date of Birth</span>
                                {formData.dob} ({formData.age} years old)
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500 block">Gender</span>
                                {formData.gender}
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500 block">Civil Status</span>
                                {formData.civilStatus}
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500 block">Contact Number</span>
                                {formData.contactNumber}
                            </div>
                        </div>
                    </div>

                    {/* Address Details */}
                    <div>
                        <h4 className="font-bold text-gabay-teal mb-3 text-xs uppercase tracking-wider border-b border-gray-200 pb-1">Address Details</h4>
                        <div className="text-sm">
                            <span className="font-semibold text-gray-500 block">Complete Address</span>
                            {[formData.street, formData.barangay, formData.city, formData.province, formData.postalCode].filter(Boolean).join(', ')}
                        </div>
                    </div>

                    {/* Emergency & Guardian Blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Emergency Contact */}
                        <div>
                            <h4 className="font-bold text-gabay-teal mb-3 text-xs uppercase tracking-wider border-b border-gray-200 pb-1">Emergency Contact</h4>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-500 block">Name</span>
                                    {formData.emergencyContact || <span className="text-gray-400 italic">Not provided</span>}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-500 block">Contact Number</span>
                                    {formData.emergencyContactNum || <span className="text-gray-400 italic">Not provided</span>}
                                </div>
                            </div>
                        </div>

                        {/* Conditionally Rendered Guardian Info */}
                        {isMinor && (
                            <div>
                                <h4 className="font-bold text-gabay-teal mb-3 text-xs uppercase tracking-wider border-b border-gray-200 pb-1">Guardian Information</h4>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="font-semibold text-gray-500 block">Name</span>
                                        {[formData.guardianFirstName, formData.guardianSurname].filter(Boolean).join(' ')}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-500 block">Relationship</span>
                                        {formData.guardianRelationship}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-500 block">Contact Number</span>
                                        {formData.guardianContactNum}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hospital Number Allocation Box */}
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
                    <h3 className="font-bold text-gabay-teal font-montserrat mb-2">Hospital Number Allocation</h3>
                    {formData.hospitalChoice === 'link' ? (
                        <p className="text-gray-700">You are registering the existing number: <span className="font-bold text-lg text-gabay-navy">{formData.hospitalNumInput}</span></p>
                    ) : (
                        <p className="text-gray-700">A <span className="font-bold text-gabay-navy">NEW</span> hospital number will be generated for you.</p>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                    <button onClick={() => setStep(2)} className="font-semibold text-gray-500 hover:text-gray-800 transition" disabled={isSubmitting}>← Back</button>
                    <Button variant="teal" onClick={handleSubmit} className="w-48" disabled={isSubmitting}>
                        {isSubmitting ? 'SAVING...' : 'FINISH REGISTRATION'}
                    </Button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}