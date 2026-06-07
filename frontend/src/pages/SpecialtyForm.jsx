import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { ChevronDown, CalendarDays, AlertCircle, Upload, X, FileText} from 'lucide-react';
import DatePicker from "react-datepicker";
import toast from 'react-hot-toast';
import "react-datepicker/dist/react-datepicker.css";


const DateDisplayInput = React.forwardRef(({ value, onClick, className }, ref) => (
  <div className="relative w-full">
    <input
      ref={ref}
      value={value}
      onClick={onClick}
      readOnly
      placeholder="Select up to 5 preferred dates"
      className={`cursor-pointer ${className}`}
    />
    <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
  </div>
));

export default function SpecialtyForm({ userInfo, onConfirm }) {
  const navigate = useNavigate();
  const [selectedDates, setSelectedDates] = useState([]);
  const [doctorAvailability, setDoctorAvailability] = useState({ working_days: [], fully_booked_dates: [] });
  const [referralImage, setReferralImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mode, setMode] = useState("fill");
  const isReadOnly = mode === "confirm";
  
  const [formData, setFormData] = useState({
    firstname: userInfo?.firstname || "",
    surname: userInfo?.surname|| "",
    hospitalNumber: userInfo?.hospital_num || "",
    department: "",
    doctor: "NONE",
    reason: "",
    hasPreviousRecord: false
  });

  const [hospitalData, setHospitalData] = useState({ departments: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/departments-and-doctors`);
        if (response.ok) {
          const data = await response.json();
          setHospitalData(data); 
        }
      } catch (error) {
        console.error("Failed to fetch hospital data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHospitalData();
  }, []);

  useEffect(() => {
    if (formData.doctor && formData.doctor !== "NONE") {
      const cleanDoctorName = formData.doctor.replace(/^Dr\.\s*/i, '');
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/doctor-availability?doctor_name=${encodeURIComponent(cleanDoctorName)}`)
        .then(res => res.json())
        .then(data => {
          setDoctorAvailability({
            working_days: data.working_days || [],
            fully_booked_dates: data.fully_booked_dates || []
          });
        })
        .catch(() => setDoctorAvailability({ working_days: [], fully_booked_dates: [] }));
    }
  }, [formData.doctor]);

  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);

  const filterAllowedDates = (date) => {
    const day = date.getDay();
    
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    
    if (formData.doctor === "NONE") {
      return day !== 0 && day !== 6; 
    }
    
    const isWorkingDay = (doctorAvailability?.working_days || []).includes(day);
    const isNotFullyBooked = !(doctorAvailability?.fully_booked_dates || []).includes(dateStr);
    
    return isWorkingDay && isNotFullyBooked;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));

    setFormData(prev => {
      const updates = { [name]: type === 'checkbox' ? checked : value };
      
      if (name === 'department' || (name === 'hasPreviousRecord' && !checked)) {
        updates.doctor = "NONE";
        setSelectedDates([]); 
      }
      return { ...prev, ...updates };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReferralImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      if (errors.referral) setErrors(prev => ({ ...prev, referral: "" }));
    }
  };

  const removeImage = () => {
    setReferralImage(null);
    setImagePreview(null);
  };

  const getWordCount = (text) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };

  const handleReasonChange = (e) => {
    const inputText = e.target.value;
    const currentWords = getWordCount(inputText);

    if (currentWords <= 150 || inputText.length < formData.reason.length) {
      setFormData({ ...formData, reason: inputText });
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.department) newErrors.department = "Department is required.";
    if (!formData.reason) newErrors.reason = "Please provide a reason for booking.";
    if (selectedDates.length === 0) newErrors.appointmentDate = "Please select at least 1 date.";
    if (!referralImage && !isReadOnly) newErrors.referral = "Medical referral is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmSubmit = () => {

    if (!validateForm()) return;

    const sortedDates = [...selectedDates].sort((a, b) => a - b);
    const start = sortedDates[0];
    const end = sortedDates[sortedDates.length - 1];
    
    onConfirm({ 
      ...formData, 
      startDate: start, 
      endDate: end, 
      reason: formData.reason, 
      referralImage 
    }, "Specialty");
  };

  const specialtyDepts = hospitalData.departments.filter(
    dept => dept.type === 'specialty'
  );

  const availableDoctors = hospitalData.departments.find(
    d => d.name === formData.department
  )?.doctors || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-gabay-teal border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-10 font-poppins text-left animate-in fade-in duration-500">
      <h1 className="text-3xl font-montserrat font-bold text-gabay-teal mb-1">
        {isReadOnly ? "Review Reservation" : "Specialty Appointment Form"}
      </h1>
      <p className="text-gray-500 mb-10">
        {isReadOnly ? "Please double-check your details before confirming." : "Specialty departments require a valid medical referral."}
      </p>

      {userInfo?.is_verified === false && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 flex items-center gap-3 rounded-r-lg">
          <AlertCircle className="text-red-500 shrink-0" size={20} />
          <p className="text-sm text-red-700">
            <strong>Account Unverified:</strong> You must verify your email address before you can submit a reservation. Please check your inbox for the verification link.
          </p>
        </div>
      )}

      <div className="flex flex-col border-2 border-gabay-teal rounded-2xl p-5 md:flex-row gap-16">
        <div className="flex-1 space-y-6">

          <div className="flex flex-col">
            <label className="text-gabay-blue font-semibold mb-1 text-lg uppercase tracking-wide">Specialty Department</label>
            <div className="relative">
              <select 
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`hide-chevron w-full p-2 text-base rounded-md border outline-none transition-all pr-10 ${
                  isReadOnly ? 'bg-gray-100 border-gray-300 text-gray-700 cursor-default' : 
                  errors.department ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-1 focus:ring-gabay-teal'
                }`}
              >
                <option value="">Select Specialty</option>
                
                {specialtyDepts.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
              {!isReadOnly && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />}
            </div>
            {errors.department && <p className="text-red-500 text-[11px] mt-1 font-medium uppercase">{errors.department}</p>}
          </div>

          <div className="flex flex-col">
            <label className="text-gabay-blue font-semibold mb-1 text-lg uppercase tracking-wide">
                Assigned Doctor
            </label>
            <div className="relative">
                <select 
                name="doctor"
                value={formData.doctor}
                onChange={handleInputChange}
                disabled={!formData.hasPreviousRecord || isReadOnly}
                className={`hide-chevron w-full p-2 text-base rounded-md border outline-none transition-all pr-10 ${
                    isReadOnly || !formData.hasPreviousRecord
                    ? 'bg-gray-100 text-gray-700 border-gray-300 cursor-default' 
                    : 'border-gray-300 focus:ring-1 focus:ring-gabay-teal'
                }`}
                >
                <option value="NONE">Select a Doctor</option>
                {availableDoctors.map((doc) => (
                    <option key={doc} value={doc}>
                    {doc}
                    </option>
                ))}
                </select>
                {(!isReadOnly && formData.hasPreviousRecord) && (
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                )}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-gabay-blue font-semibold mb-1 text-lg uppercase tracking-wide">Preferred Dates</label>
            <div className="relative custom-datepicker-container">
              {isReadOnly ? (
                <div className="p-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 font-medium">
                  {selectedDates.map(d => d.toLocaleDateString()).join(", ")}
                </div>
              ) : (
                <DatePicker
                  selected={selectedDates.length > 0 ? selectedDates[selectedDates.length - 1] : null}
                  highlightDates={selectedDates} 
                  shouldCloseOnSelect={false}
                  filterDate={filterAllowedDates}
                  minDate={today}
                  maxDate={maxDate}
                  dateFormat="MM/dd/yyyy"
                  value={selectedDates.map(d => d.toLocaleDateString()).join(", ")} 
                  onChange={(clickedDate) => {
                    if (!clickedDate) return;
                    
                    const clickedStr = clickedDate.toDateString();
                    const exists = selectedDates.find(d => d.toDateString() === clickedStr);
                    
                    if (exists) {
                      setSelectedDates(selectedDates.filter(d => d.toDateString() !== clickedStr));
                    } else {
                      if (selectedDates.length >= 5) {
                        toast.error("You can select a maximum of 5 dates.");
                      } else {
                        setSelectedDates([...selectedDates, clickedDate]);
                        if (errors.appointmentDate) setErrors(prev => ({ ...prev, appointmentDate: "" }));
                      }
                    }
                  }}
                  customInput={
                    <DateDisplayInput 
                      className={`w-full p-2 text-base rounded-md border outline-none transition-all pr-10 ${
                        errors.appointmentDate ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-gabay-teal'
                      }`} 
                    />
                  }
                />
              )}
            </div>
            {errors.appointmentDate && <p className="text-red-500 text-[11px] mt-1 font-medium uppercase">{errors.appointmentDate}</p>}
            {!isReadOnly && <p className="text-[12px] text-gray-400 mt-1 font-medium">* Select up to 5 individual dates to give the hospital scheduling flexibility.</p>}
          </div>

          <div className="flex flex-col">
            <label className="text-gabay-blue font-semibold mb-1 text-lg uppercase tracking-wide">
              Reason for Specialty Consultation <span className="text-red-500">*</span>
            </label>
            <textarea 
              required
              name="reason"
              rows="4"
              value={formData.reason}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              className={`p-3 text-base rounded-md border outline-none resize-none transition-all ${isReadOnly ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-default' : errors.reason ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-1 focus:ring-gabay-teal'}`}
              placeholder="Briefly explain the condition requiring a specialist..."
            />
            {errors.reason && <p className="text-red-500 text-[11px] mt-1 font-medium uppercase">{errors.reason}</p>}
            <div className="flex justify-end mt-1">
                <span className={`text-xs font-medium ${getWordCount(formData.reason) >= 150 ? 'text-red-500' : 'text-gray-400'}`}>
                  {getWordCount(formData.reason)} / 150 words
                </span>
            </div> 
          </div>
        </div>

        <div className="w-full md:w-1/3 space-y-6 pt-5">
          <div className={`flex items-center justify-between py-3 px-4 rounded-md transition-all ${isReadOnly ? 'bg-gray-100' : 'bg-gray-50 border border-gray-200'}`}>
            <span className="text-gabay-blue text-lg uppercase font-semibold">Has previous OPD record?</span>
            <label className={`relative inline-flex items-center ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
              <input type="checkbox" name="hasPreviousRecord" checked={formData.hasPreviousRecord} onChange={handleInputChange} disabled={isReadOnly} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gabay-teal"></div>
            </label>
          </div>

          <div className="flex flex-col">
            <label className="text-gabay-blue font-semibold mb-3 text-lg uppercase tracking-wide flex items-center gap-2">
              <FileText size={16} /> Medical Referral (Required)
            </label>
            
            {/* FIX: Redesigned Error Banner */}
            {errors.referral && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in fade-in">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-red-700 text-xs font-bold uppercase tracking-wider">{errors.referral}</p>
              </div>
            )}
            
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-gabay-teal group flex flex-col items-center justify-center bg-gray-50 h-48">
                {/* FIX: PDF Visual Handler */}
                {referralImage?.type === 'application/pdf' ? (
                  <div className="text-center p-4">
                    <FileText size={48} className="mx-auto text-gabay-teal mb-2" />
                    <p className="text-sm font-bold text-gabay-navy">PDF Document Attached</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px] mt-1">{referralImage.name}</p>
                  </div>
                ) : (
                  <img src={imagePreview} alt="Referral Preview" className="w-full h-full object-cover" />
                )}

                {!isReadOnly && (
                  <button 
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg"
                  >
                    <X size={20} />
                  </button>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-white text-xs text-center truncate">
                  {referralImage?.name}
                </div>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition-all cursor-pointer ${errors.referral ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-gabay-teal hover:bg-teal-50'}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className={`mb-3 ${errors.referral ? 'text-red-500' : 'text-gray-400'}`} size={32} />
                  <p className={`text-xs mb-1 font-semibold ${errors.referral ? 'text-red-500' : 'text-gray-500'}`}>Click to upload referral</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">PNG, JPG or PDF</p>
                </div>
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleImageChange} disabled={isReadOnly} />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 flex gap-4">
        {isReadOnly ? (
          <>
            <button onClick={() => setMode("fill")} className="flex-1 md:flex-none border-2 border-gabay-teal text-gabay-teal px-8 py-2 rounded-full font-bold transition-all hover:bg-teal-50">EDIT DETAILS</button>
            <button 
              onClick={handleConfirmSubmit} 
              disabled={userInfo?.is_verified === false}
              className={`flex-1 md:flex-none px-8 py-2 rounded-full font-bold transition-all shadow-lg text-base ${
                userInfo?.is_verified === false 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-gabay-teal hover:bg-teal-700 text-white active:scale-95'
              }`}
            >
              SUBMIT RESERVATION
            </button>
          </>
        ) : (
          <div className="flex gap-4 w-full md:w-auto">
            <button onClick={() => navigate('/departments')} className="flex-1 md:flex-none px-8 py-2 rounded-full border-2 border-gabay-teal font-poppins text-gabay-teal font-bold hover:bg-gray-50 transition-all">CANCEL</button>
            <button onClick={() => { if (validateForm()) setMode("confirm") }} className="flex-1 md:flex-none px-8 py-2 rounded-full bg-gabay-teal font-poppins text-white font-bold hover:bg-teal-600 shadow-md transition-all">CONFIRM</button>
          </div>
        )}
      </div>
    </div>
  );
}