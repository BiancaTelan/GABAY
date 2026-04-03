import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { ChevronDown, CalendarDays, Upload, X, FileText } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const GabayInput = React.forwardRef(({ value, onClick, onChange, ...props }, ref) => {
  const handleChange = (e) => {
    const rawValue = e.target.value;
    const digits = rawValue.replace(/\D/g, "");
    let formatted = digits;
    
    if (digits.length > 2 && digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
    
    e.target.value = formatted;
    onChange(e);
  };

  return (
    <div className="relative w-full">
      <input
        {...props}
        ref={ref}
        value={value}
        onClick={onClick}
        onChange={handleChange}
        autoComplete="off"
      />
      <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
    </div>
  );
});

export default function SpecialtyForm({ userInfo, onConfirm }) {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
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

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const response = await fetch('/api/appointments/departments-and-doctors');
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

  const [errors, setErrors] = useState({});

  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);

  const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'department' || (name === 'hasPreviousRecord' && !checked) ? { doctor: "NONE" } : {})
    }));
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

  const validateForm = () => {
    let newErrors = {};
    if (!formData.department) newErrors.department = "Department is required.";
    if (!formData.reason) newErrors.reason = "Please provide a reason for booking.";
    if (!startDate) newErrors.appointmentDate = "Please select a date range.";
    if (!referralImage && !isReadOnly) newErrors.referral = "Medical referral is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        {isReadOnly ? "Review Specialty Reservation" : "Specialty Appointment Form"}
      </h1>
      <p className="text-gray-500 mb-10">
        {isReadOnly ? "Please double-check your details before confirming." : "Specialty departments require a valid medical referral."}
      </p>

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
            <label className="text-gabay-blue font-semibold mb-1 text-lg uppercase tracking-wide">Preferred Appointment Date</label>
            <div className="relative custom-datepicker-container">
              {isReadOnly ? (
                <div className="p-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500">
                  {startDate?.toLocaleDateString()} {endDate ? `- ${endDate?.toLocaleDateString()}` : ""}
                </div>
              ) : (
                <DatePicker
                  selected={startDate}
                  onChange={(dates) => {
                    const [start, end] = dates;
                    setStartDate(start);
                    setEndDate(end);
                  }}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  filterDate={isWeekday}
                  minDate={today}
                  maxDate={startDate ? new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000) : maxDate}
                  placeholderText="MM/DD/YYYY - MM/DD/YYYY"
                  dateFormat="MM/dd/yyyy"
                  customInput={<GabayInput className={`w-full p-2 text-base rounded-md border outline-none transition-all pr-10 ${errors.appointmentDate ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-gabay-teal'}`} />}
                />
              )}
            </div>
            {errors.appointmentDate && <p className="text-red-500 text-[11px] mt-1 font-medium uppercase">{errors.appointmentDate}</p>}
          </div>

          <div className="flex flex-col">
            <label className="text-gabay-blue font-semibold mb-1 text-lg uppercase tracking-wide">Reason for Specialty Consultation</label>
            <textarea 
              name="reason"
              rows="4"
              value={formData.reason}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              className={`p-3 text-base rounded-md border outline-none resize-none transition-all ${isReadOnly ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-default' : errors.reason ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-1 focus:ring-gabay-teal'}`}
              placeholder="Briefly explain the condition requiring a specialist..."
            />
            {errors.reason && <p className="text-red-500 text-[11px] mt-1 font-medium uppercase">{errors.reason}</p>}
          </div>
        </div>

        <div className="w-full md:w-1/3 space-y-8 pt-5">
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
            
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-gabay-teal group">
                <img src={imagePreview} alt="Referral Preview" className="w-full h-48 object-cover" />
                {!isReadOnly && (
                  <button 
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg"
                  >
                    <X size={20} />
                  </button>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-white text-xs text-center">
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
            {errors.referral && <p className="text-red-500 text-[11px] mt-2 font-medium uppercase text-center">{errors.referral}</p>}
          </div>
        </div>
      </div>

      <div className="mt-12 flex gap-4">
        {isReadOnly ? (
          <>
            <button 
              type="button"
              onClick={() => setMode("fill")} 
              className="flex-1 md:flex-none border-2 border-gabay-teal text-gabay-teal px-8 py-2 rounded-full font-bold transition-all hover:bg-teal-50 active:scale-95 text-base"
            >
              EDIT DETAILS
            </button>
            <button 
              type="button"
              onClick={() => onConfirm({ ...formData, startDate, endDate, referralImage }, "Specialty")} 
              className="flex-1 md:flex-none bg-gabay-teal hover:bg-teal-700 text-white px-8 py-2 rounded-full font-bold transition-all shadow-lg active:scale-95 text-base"
            >
              SUBMIT RESERVATION
            </button>
          </>
        ) : (
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              type="button"
              onClick={() => navigate('/departments')}
              className="flex-1 md:flex-none px-8 py-2 rounded-full border-2 border-gabay-teal font-poppins text-base text-gabay-teal font-bold hover:bg-gray-50 transition-all active:scale-95"
            >
              CANCEL
            </button>
            <button 
              type="button"
              onClick={() => { if (validateForm()) setMode("confirm") }} 
              className="flex-1 md:flex-none px-8 py-2 rounded-full bg-gabay-teal font-poppins text-base text-white font-bold hover:bg-teal-600 shadow-md transition-all active:scale-95"
            >
              CONFIRM
            </button>
          </div>
        )}
      </div>
    </div>
  );
}