import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import { CalendarDays, AlertCircle } from 'lucide-react';

export default function RescheduleForm({ userInfo }) {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  // FETCH DATA ID
  const [existingData, setExistingData] = useState({
    department: "Pediatrics",
    doctor: "Dr. Jose Rizal",
    referralImage: "referral_preview_url", 
    reason: "Original checkup reason",
    startDate: new Date(),
    endDate: new Date(),
  });

  const [newDateRange, setNewDateRange] = useState([null, null]);
  const [startDate, endDate] = newDateRange;
  const [newReason, setNewReason] = useState("");

  const handleConfirm = () => {
    // UPDATE BACKEND
    console.log(`Updating Appointment ${appointmentId} with new dates and reason.`);
    navigate('/calendar');
  };

  return (
    <div className="max-w-4xl mx-auto p-10 font-poppins text-left animate-in fade-in duration-500">
      <div className="bg-blue-50 border-l-4 border-gabay-blue p-4 mb-8 flex gap-3">
        <AlertCircle className="text-gabay-blue" size={20} />
        <p className="text-sm text-gabay-blue">
          <strong>Rescheduling:</strong> You are modifying your appointment for <strong>{existingData.department}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        <div className="space-y-4 opacity-70">
          <label className="text-xs font-bold text-gray-400 uppercase">Department (Locked)</label>
          <div className="p-3 bg-gray-100 rounded-lg border border-gray-200 text-gray-600">
            {existingData.department}
          </div>

          <label className="text-xs font-bold text-gray-400 uppercase">Doctor (Locked)</label>
          <div className="p-3 bg-gray-100 rounded-lg border border-gray-200 text-gray-600">
            {existingData.doctor}
          </div>
          
          {existingData.referralImage && (
            <div className="mt-4">
               <label className="text-xs font-bold text-gray-400 uppercase">Attached Referral</label>
               <div className="mt-2 h-32 w-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs italic">
                 Image Retained
               </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex flex-col">
            <label className="text-gabay-blue font-bold mb-2">New Preferred Date</label>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setNewDateRange(update)}
              minDate={new Date()}
              placeholderText="Select new dates..."
              className="w-full p-3 border border-gabay-teal rounded-xl focus:ring-2 focus:ring-teal-200 outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gabay-blue font-bold mb-2">Reason for Reschedule</label>
            <textarea 
              rows="4"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="e.g., Personal emergency, change of schedule..."
              className="p-3 border border-gabay-teal rounded-xl focus:ring-2 focus:ring-teal-200 outline-none resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={handleConfirm}
              className="flex-1 bg-gabay-teal text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-all"
            >
              CONFIRM CHANGE
            </button>
            <button 
              onClick={() => navigate('/calendar')}
              className="px-6 py-3 border border-gray-300 text-gray-500 rounded-xl hover:bg-gray-50 transition-all"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

