import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import hospitalData from '../utils/hospitalData.json';
import { ChevronDown, CalendarDays } from 'lucide-react';
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

export default function GeneralForm({ userInfo, mode = "fill", onConfirm }) {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: userInfo?.firstName || "",
    lastName: userInfo?.lastName || "",
    hospitalNumber: userInfo?.hospitalNumber || "",
    department: "",
    doctor: "NONE",
    reason: "",
    hasPreviousRecord: false
  });

  const [errors, setErrors] = useState({});
  const isReadOnly = mode === "confirm";

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

  const validateForm = () => {
    let newErrors = {};
    if (!formData.department) newErrors.department = "Department is required.";
    if (!formData.reason) newErrors.reason = "Please provide a reason for booking.";
    
    if (!startDate) {
      newErrors.appointmentDate = "Please select a date range.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generalDepts = hospitalData.departments.filter(d => d.type === 'general');

  const availableDoctors = hospitalData.departments.find(
    d => d.name === formData.department
  )?.doctors || [];

  return (
    <div className="max-w-6xl mx-auto p-10 font-poppins text-left animate-in fade-in duration-500">
      <h1 className="text-3xl font-montserrat font-bold text-gabay-teal mb-1">
        {isReadOnly ? "Review Reservation" : "General Appointment Form"}
      </h1>
      <p className="text-gray-500 mb-10">
        {isReadOnly ? "Please double-check your details before confirming." : "Complete the form to reserve your appointment."}
      </p>

      <div className="flex flex-col md:flex-row gap-16">
        <div className="flex-1 space-y-6">
         
          <div className="flex flex-col">
            <label className="text-gabay-blue font-semibold mb-1 text-base uppercase tracking-wide">Department</label>
            <div className="relative">
              <select 
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`hide-chevron w-full p-2 text-base rounded-md border outline-none transition-all pr-10 ${
                  isReadOnly ? 'bg-gray-50 border-gray-300 text-gray-700 cursor-default' : 
                  errors.department ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-1 focus:ring-gabay-teal'
                }`}
              >
                <option value="">Select Department</option>
                {hospitalData.departments
                  .filter(dept => dept.type === 'general')
                  .map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
              {!isReadOnly && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />}
            </div>
            {errors.department && <p className="text-red-500 text-[11px] mt-1 font-medium uppercase">{errors.department}</p>}
          </div>

          <div className="flex flex-col">
            <label className="text-gabay-blue font-semibold mb-1 text-base uppercase tracking-wide">Assigned Doctor</label>
            <div className="relative">
              <select 
                name="doctor"
                value={formData.doctor}
                onChange={handleInputChange}
                disabled={!formData.hasPreviousRecord || isReadOnly}
                className={`hide-chevron w-full p-2 text-base rounded-md border outline-none transition-all pr-10 ${
                  isReadOnly || !formData.hasPreviousRecord 
                  ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-default' 
                  : 'border-gray-300 focus:ring-1 focus:ring-gabay-teal'
                }`}
              >
                <option value="NONE">NONE</option>
                {availableDoctors.map(doc => (
                  <option key={doc} value={doc}>{doc}</option>
                ))}
              </select>
              {(!isReadOnly && formData.hasPreviousRecord) && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-gabay-blue font-semibold mb-1 text-base uppercase tracking-wide">Preferred Appointment Date</label>
            <div className="relative custom-datepicker-container">
              {isReadOnly ? (
                <div className="p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
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
                  maxDate={startDate 
                    ? new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000) 
                    : maxDate
                  }
                  placeholderText="MM/DD/YYYY - MM/DD/YYYY"
                  dateFormat="MM/dd/yyyy"
                  customInput={
                    <GabayInput 
                      className={`w-full p-2 text-base rounded-md border outline-none transition-all pr-10 ${
                        errors.appointmentDate ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-gabay-teal'
                      }`} 
                    />
                  }
                />
              )}
            </div>
            {errors.appointmentDate && (
              <p className="text-red-500 text-[11px] mt-1 font-medium uppercase">
                {errors.appointmentDate}
              </p>
            )}
            {!isReadOnly && <p className="text-[12px] text-gray-400 mt-1 font-medium">* Max 5-day duration per reservation.</p>}
          </div>

          <div className="flex flex-col">
            <label className="text-gabay-blue font-semibold mb-1 text-base uppercase tracking-wide">Reason for Booking</label>
            <textarea 
              name="reason"
              rows="4"
              value={formData.reason}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              className={`p-3 text-base rounded-md border outline-none resize-none transition-all ${
                isReadOnly ? 'bg-gray-50 border-gray-300 text-gray-700 cursor-default' : 
                errors.reason ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-1 focus:ring-gabay-teal'
              }`}
              placeholder="Describe your symptoms..."
            />
            {errors.reason && <p className="text-red-500 text-[11px] mt-1 font-medium uppercase">{errors.reason}</p>}
          </div>
        </div>

        <div className="w-full md:w-1/3 pt-5">
          <div className={`flex items-center justify-between py-3 px-4 rounded-md transition-all ${
            isReadOnly ? 'bg-gray-100' : 'bg-gray-50'
          }`}>
            <span className="text-gabay-blue text-lg font-semibold">Has previous OPD record?</span>
            <label className={`relative inline-flex items-center ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
              <input 
                type="checkbox" 
                name="hasPreviousRecord"
                checked={formData.hasPreviousRecord}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gabay-teal"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-12 flex gap-4">
        {isReadOnly ? (
          <>
            <button 
              type="button"
              onClick={() => onConfirm(formData, "fill")}
              className="flex-1 md:flex-none border-2 border-gabay-teal text-gabay-teal px-8 py-2 rounded-full font-bold transition-all hover:bg-teal-50 active:scale-95 text-base"
            >
              EDIT DETAILS
            </button>
            <button 
              type="button"
              onClick={() => onConfirm({ ...formData, startDate, endDate }, "submit")}
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
              onClick={() => validateForm() && onConfirm(formData, "confirm")}
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