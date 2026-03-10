import React, { useState, useEffect } from 'react';
import hospitalData from '../utils/hospitalData.json';

export default function GeneralForm({ userInfo, mode = "fill", onConfirm }) {
  const [formData, setFormData] = useState({
    firstName: userInfo?.firstName || "",
    lastName: userInfo?.lastName || "",
    hospitalNumber: userInfo?.hospitalNumber || "",
    department: "",
    doctor: "NONE",
    appointmentDate: "",
    reason: "",
    hasPreviousRecord: false
  });

  const isReadOnly = mode === "confirm";

  // --- DATE CONSTRAINT LOGIC ---
  const today = new Date().toISOString().split("T")[0];
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 7); 
  const maxDate = maxDateObj.toISOString().split("T")[0];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "appointmentDate" && value) {
      const day = new Date(value).getDay();
      if (day === 0 || day === 6) {
        alert("Appointments are only available on Weekdays (Monday to Friday).");
        return; 
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'department' || (name === 'hasPreviousRecord' && !checked) ? { doctor: "NONE" } : {})
    }));
  };

  const availableDoctors = hospitalData.departments.find(
    d => d.name === formData.department
  )?.doctors || [];

  return (
    <div className="max-w-6xl mx-auto p-10 font-poppins text-left animate-fade-in">
      <h1 className="text-3xl font-montserrat font-bold text-gabay-teal mb-1">
        {isReadOnly ? "Review Reservation" : "Reservation Form"}
      </h1>
      <p className="text-gray-500 mb-10">
        {isReadOnly ? "Please double-check your details before confirming." : "Complete the form to reserve your appointment."}
      </p>

      <div className="flex flex-col md:flex-row gap-16">
        <div className="flex-1 space-y-6">

          <div className="flex flex-col">
            <label className="text-gabay-blue font-medium mb-1">Department</label>
            <select 
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              disabled={isReadOnly}
              className={`p-2 text-base rounded-md border outline-none transition-all ${
                isReadOnly ? 'bg-gray-50 border-gray-300 text-gray-700 cursor-default' : 'border-gray-300 focus:ring-2 focus:ring-gabay-teal'
              }`}
              required
            >
              <option value="">Select Department</option>
              {hospitalData.departments.map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-gabay-blue font-medium mb-1">Assigned Doctor</label>
            <select 
              name="doctor"
              value={formData.doctor}
              onChange={handleInputChange}
              disabled={!formData.hasPreviousRecord || isReadOnly}
              className={`p-2 text-base rounded-md border outline-none transition-all ${
                isReadOnly || !formData.hasPreviousRecord 
                ? 'bg-gray-100 text-gray-500 border-gray-300' 
                : 'border-gray-300 focus:ring-2 focus:ring-gabay-teal'
              }`}
            >
              <option value="NONE">NONE</option>
              {availableDoctors.map(doc => (
                <option key={doc} value={doc}>{doc}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-gabay-blue font-medium mb-1">Preferred Appointment Date</label>
            <input 
              type="date"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              min={today}
              max={maxDate}
              className={`p-2 text-base rounded-md border outline-none transition-all ${
                isReadOnly ? 'bg-gray-50 border-gray-300 text-gray-700 cursor-default' : 'border-gray-300 focus:ring-2 focus:ring-gabay-teal'
              }`}
              required
            />
            {!isReadOnly && <p className="text-xs text-gray-400 mt-1">* Weekdays only, up to 5 working days in advance.</p>}
          </div>

          <div className="flex flex-col">
            <label className="text-gabay-blue font-medium mb-1">Reason for Booking</label>
            <textarea 
              name="reason"
              rows="4"
              value={formData.reason}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              className={`p-3 text-base rounded-md border outline-none resize-none transition-all ${
                isReadOnly ? 'bg-gray-50 border-gray-300 text-gray-700 cursor-default' : 'border-gray-300 focus:ring-2 focus:ring-gabay-teal'
              }`}
              placeholder="Describe your symptoms..."
              required
            />
          </div>
        </div>

        <div className="w-full md:w-1/3 pt-5">
          <div className={`flex items-center justify-between py-3 px-4 rounded-md transition-all ${
            isReadOnly ? 'bg-gray-100' : 'bg-gray-30'
          }`}>
            <span className="text-gabay-blue text-lg font-medium">Has previous OPD record?</span>
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
              className="flex-1 md:flex-none border-2 border-gabay-teal text-gabay-teal px-12 py-3 rounded-xl font-bold transition-all hover:bg-teal-50 active:scale-95"
            >
              EDIT DETAILS
            </button>
            <button 
              type="button"
              onClick={() => onConfirm(formData, "submit")}
              className="flex-1 md:flex-none bg-gabay-green hover:bg-gabay-green2 text-white px-12 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
            >
              CONFIRM RESERVATION
            </button>
          </>
        ) : (
          <button 
            type="button"
            onClick={() => {
              if (!formData.department || !formData.appointmentDate || !formData.reason) {
                alert("Please fill in all required fields.");
                return;
              }
              onConfirm(formData, "confirm");
            }}
            className="px-8 py-1.5 rounded-full bg-gabay-teal font-poppins text-base text-white font-semibold hover:bg-teal-600 shadow-md transition-all"
          >
            SUBMIT FOR REVIEW
          </button>
        )}
      </div>
    </div>
  );
}