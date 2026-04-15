import { useState } from 'react';
import { X, CalendarDays } from 'lucide-react'; // Added CalendarDays
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '../components/button';

export default function ApproveScheduleModal({ isOpen, onClose, appointment, onApprove }) {
  const [selectedDoctor, setSelectedDoctor] = useState(appointment.assignedDoctor || '');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState('Morning');

  const doctors = [
    'Dr. Diane Marie Mendoza',
    'Dr. Joseph Nieto',
    'Dr. Ritchie Cruz',
    'Dr. Vinhcent Sandoval'
  ];

  const startDate = appointment.requestedStartDate ? new Date(appointment.requestedStartDate) : null;
  const endDate = appointment.requestedEndDate ? new Date(appointment.requestedEndDate) : null;

  const handleApprove = () => {
    if (!selectedDate) {
      alert('Please select a date.');
      return;
    }
    if (!selectedDoctor) {
      alert('Please assign a doctor.');
      return;
    }
    if (!selectedBatch) {
      alert('Please select a batch.');
      return;
    }

    const formattedDate = selectedDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });

    onApprove({
      ...appointment,
      assignedDoctor: selectedDoctor,
      appointmentDate: formattedDate,
      batch: selectedBatch
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-10 relative">
        <div className="relative mb-4">
          <h3 className="font-montserrat text-xl font-bold text-gabay-blue text-center">
            Approve Schedule
          </h3>
          <button
            onClick={onClose}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block font-poppins font-medium text-lg text-gabay-navy">Patient:</label>
            <p className="font-poppins mt-1 text-gray-700">{appointment.name}</p>
          </div>

          {/* Doctor assignment */}
          <div>
            <label className="block font-poppins font-medium text-lg text-gabay-navy">Assigned Doctor:</label>
            {appointment.assignedDoctor ? (
              <p className="font-poppins text-gray-800 mt-1">{appointment.assignedDoctor}</p>
            ) : (
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-200 rounded-md font-poppins text-md focus:outline-none focus:ring-2 focus:ring-gabay-blue"
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map(doc => (
                  <option key={doc} value={doc}>{doc}</option>
                ))}
              </select>
            )}
          </div>

          {/* Date selection with Icon inside */}
          <div>
            <label className="block font-poppins font-medium text-lg text-gabay-navy">Date:</label>
            <p className="font-poppins text-sm text-gray-500 mb-1">
              Requested range: {appointment.requestedStartDate} - {appointment.requestedEndDate}
            </p>
            <div className="relative">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                minDate={startDate}
                maxDate={endDate}
                dateFormat="MM/dd/yyyy"
                placeholderText="Select date within range"
                className="w-full p-2 border border-gray-200 rounded-md font-poppins text-md focus:outline-none focus:ring-2 focus:ring-gabay-blue pr-10 cursor-pointer"
                wrapperClassName="w-full"
              />
              <CalendarDays 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                size={20} 
              />
            </div>
          </div>

          {/* Batch */}
          <div>
            <label className="block font-poppins font-medium text-lg text-gabay-navy">Batch:</label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="batch"
                  value="Morning"
                  checked={selectedBatch === 'Morning'}
                  onChange={() => setSelectedBatch('Morning')}
                  className="text-gabay-blue focus:ring-gabay-blue"
                />
                <span className="font-poppins text-md">Morning (8:00 - 12:00)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="batch"
                  value="Afternoon"
                  checked={selectedBatch === 'Afternoon'}
                  onChange={() => setSelectedBatch('Afternoon')}
                  className="text-gabay-blue focus:ring-gabay-blue"
                />
                <span className="font-poppins text-md">Afternoon (1:00 - 5:00)</span>
              </label>
            </div>
          </div>

          <p className="font-poppins text-sm text-gray-500 text-center italic mt-4">
            An automated alert will be sent via Email.
          </p>
        </div>

        <div className="flex gap-3 mt-8">
          <Button variant="teal" onClick={handleApprove} className="flex-1 py-2">
            Approve & Notify
          </Button>
          <Button variant="teal-outline" onClick={onClose} className="flex-1 py-2">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}