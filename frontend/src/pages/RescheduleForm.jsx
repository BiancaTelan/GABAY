import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DatePicker from "react-datepicker";
import { CalendarDays, AlertCircle } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";

export default function RescheduleForm({ userInfo }) {
  const { appointmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { department, doctor, date } = location.state || {
    department: "Unknown",
    doctor: "Unknown",
    date: "Unknown",
  };

  const [newDateRange, setNewDateRange] = useState([null, null]);
  const [startDate, endDate] = newDateRange;
  const [newReason, setNewReason] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatSafeDate = (dateObj) => {
    const d = new Date(dateObj);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const handleConfirm = async () => {
    if (!startDate) {
      setError("Please select a new preferred date.");
      return;
    }
    if (!newReason.trim()) {
      setError("Please provide a reason for rescheduling.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        preferredStartDate: formatSafeDate(startDate),
        preferredEndDate: endDate ? formatSafeDate(endDate) : null,
        reason: newReason
      };

      const response = await fetch(`/api/appointments/${appointmentId}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to reschedule appointment.");
      }

      alert("Reschedule request submitted successfully! It is now pending approval.");
      navigate('/calendar');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-10 font-poppins text-left animate-in fade-in duration-500 min-h-[calc(100vh-64px)]">
      <div className="bg-blue-50 border-l-4 border-gabay-blue p-4 mb-8 flex gap-3 rounded-r-lg">
        <AlertCircle className="text-gabay-blue shrink-0" size={20} />
        <p className="text-sm text-gabay-blue">
          <strong>Rescheduling:</strong> You are requesting to modify your appointment for <strong>{department}</strong>. Your original date was <strong>{date}</strong>. This request will require hospital approval.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        <div className="space-y-4 opacity-75">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-400 uppercase mb-1">Department</label>
            <div className="p-3 bg-gray-100 rounded-lg border border-gray-200 text-gray-600 font-medium">
              {department}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-400 uppercase mb-1">Doctor</label>
            <div className="p-3 bg-gray-100 rounded-lg border border-gray-200 text-gray-600 font-medium">
              {doctor}
            </div>
          </div>
          
          <div className="flex flex-col pt-2">
            <label className="text-xs font-bold text-gray-400 uppercase mb-1">Attached Referral</label>
            <div className="h-24 w-full bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs italic font-medium">
              Original Document Retained
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col relative custom-datepicker-container">
            <label className="text-gabay-blue font-bold mb-2 uppercase text-sm tracking-wide">New Preferred Date</label>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => {
                setNewDateRange(update);
                setError("");
              }}
              minDate={new Date()}
              placeholderText="Select new dates..."
              className={`w-full p-3 border rounded-xl outline-none transition-all ${
                error && !startDate ? 'border-red-500 ring-1 ring-red-500' : 'border-gabay-teal focus:ring-2 focus:ring-teal-200'
              }`}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gabay-blue font-bold mb-2 uppercase text-sm tracking-wide">Reason for Reschedule</label>
            <textarea 
              rows="4"
              value={newReason}
              onChange={(e) => {
                setNewReason(e.target.value);
                setError("");
              }}
              placeholder="e.g., Personal emergency, schedule conflict..."
              className={`p-3 border rounded-xl outline-none resize-none transition-all ${
                error && !newReason ? 'border-red-500 ring-1 ring-red-500' : 'border-gabay-teal focus:ring-2 focus:ring-teal-200'
              }`}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 font-medium">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button 
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex-1 bg-gabay-teal text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-md disabled:bg-gray-400 flex justify-center items-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "SUBMIT REQUEST"
              )}
            </button>
            <button 
              onClick={() => navigate('/calendar')}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-semibold disabled:opacity-50"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}