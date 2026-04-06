import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '../../components/button';
import { CalendarDays } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Sample departments and doctors
const departments = [
  { id: 1, name: 'Internal Medicine', doctors: ['Dr. Diane Marie Mendoza', 'Dr. Ritchie Cruz'] },
  { id: 2, name: 'Pediatrics', doctors: ['Dr. Maria Santos', 'Dr. Jose Rizal'] },
  { id: 3, name: 'Cardiology', doctors: ['Dr. Vinhcent Sandoval'] },
];

export default function BookScheduleForm({ onSuccess }) {
  // Patient Information
  const [hospitalNo, setHospitalNo] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [address, setAddress] = useState('');

  // Schedule Details
  const [department, setDepartment] = useState('');
  const [doctor, setDoctor] = useState('');
  const [date, setDate] = useState(null);
  const [batch, setBatch] = useState('Morning');
  const [reason, setReason] = useState('');

  const [loading, setLoading] = useState(false);

  const handleDepartmentChange = (e) => {
    const deptName = e.target.value;
    setDepartment(deptName);
    setDoctor('');
  };

  const selectedDept = departments.find(d => d.name === department);
  const doctorOptions = selectedDept ? selectedDept.doctors : [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date) {
      toast.error('Please select a consultation date.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      
      // Success Notification
      toast.success('Appointment Booked Successfully!', {
        duration: 4000,
        position: 'top-center',
        style: {
          fontFamily: 'Poppins, sans-serif',
          fontSize: '14px',
          fontWeight: '500',
        },
      });

      handleCancel();

      if (onSuccess) onSuccess();
    }, 1500);
  };

  const handleCancel = () => {
    setHospitalNo('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setContactNo('');
    setAddress('');
    setDepartment('');
    setDoctor('');
    setDate(null);
    setBatch('Morning');
    setReason('');
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 relative">
      <Toaster />
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column – Patient Information */}
          <div className="space-y-4">
            <h3 className="font-montserrat text-lg font-semibold text-gabay-teal mb-4 uppercase tracking-wide">
              Patient Information
            </h3>
            
            <div>
              <label className="block font-poppins font-medium text-gabay-navy text-md mb-1">Hospital Number</label>
              <input
                type="text"
                value={hospitalNo}
                onChange={(e) => setHospitalNo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-poppins text-md focus:outline-none focus:ring-2 focus:ring-gabay-blue transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-poppins font-medium text-gabay-navy text-md mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-poppins text-md focus:outline-none focus:ring-2 focus:ring-gabay-blue transition-all"
                  required
                />
              </div>
              <div>
                <label className="block font-poppins font-medium text-gabay-navy text-md mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-poppins text-md focus:outline-none focus:ring-2 focus:ring-gabay-blue transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-poppins font-medium text-gabay-navy text-md mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-poppins text-md focus:outline-none focus:ring-2 focus:ring-gabay-blue transition-all"
                required
              />
            </div>

            <div>
              <label className="block font-poppins font-medium text-gabay-navy text-md mb-1">Contact Number</label>
              <input
                type="tel"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-poppins text-md focus:outline-none focus:ring-2 focus:ring-gabay-blue transition-all"
                required
              />
            </div>

            <div>
              <label className="block font-poppins font-medium text-gabay-navy text-md mb-1">Address</label>
              <textarea
                rows="3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-poppins text-md focus:outline-none focus:ring-2 focus:ring-gabay-blue transition-all"
                required
              />
            </div>
          </div>

          {/* Right Column – Schedule Details */}
          <div className="space-y-5">
            <h3 className="font-montserrat text-lg font-semibold text-gabay-teal mb-4 uppercase tracking-wide">
              Schedule Details
            </h3>

            <div>
              <label className="block font-poppins font-medium text-gabay-navy text-md mb-1">Department</label>
              <select
                value={department}
                onChange={handleDepartmentChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-poppins text-md focus:outline-none focus:ring-2 focus:ring-gabay-blue bg-white appearance-none transition-all"
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-poppins font-medium text-gabay-navy text-md mb-1">Assigned Doctor</label>
              <select
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-poppins text-md focus:outline-none focus:ring-2 focus:ring-gabay-blue disabled:bg-gray-50 bg-white appearance-none transition-all"
                disabled={!department}
                required
              >
                <option value="">Select Doctor</option>
                {doctorOptions.map(doc => (
                  <option key={doc} value={doc}>{doc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-poppins font-medium text-gabay-navy text-md mb-1">Date</label>
              <div className="relative w-full">
                <DatePicker
                  selected={date}
                  onChange={(d) => setDate(d)}
                  minDate={new Date()}
                  dateFormat="MM/dd/yyyy"
                  wrapperClassName="w-full"
                  customInput={
                    <div className="relative w-full">
                      <input
                        value={date ? date.toLocaleDateString('en-US') : ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-poppins text-md focus:outline-none focus:ring-2 focus:ring-gabay-blue pr-10 cursor-pointer bg-white transition-all"
                        placeholder="Select a date"
                      />
                      <CalendarDays 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                        size={20} 
                      />
                    </div>
                  }
                />
              </div>
            </div>

            <div>
              <label className="block font-poppins font-medium text-gabay-navy text-md mb-1">Batch</label>
              <div className="flex flex-wrap gap-6 mt-2">
                <label className="flex items-center gap-2 font-poppins text-gabay-navy text-md cursor-pointer">
                  <input
                    type="radio"
                    name="batch"
                    value="Morning"
                    checked={batch === 'Morning'}
                    onChange={() => setBatch('Morning')}
                    className="w-4 h-4 text-gabay-teal focus:ring-gabay-teal border-gray-300"
                  />
                  Morning (8:00 - 12:00)
                </label>
                <label className="flex items-center gap-2 font-poppins text-gabay-navy text-md cursor-pointer">
                  <input
                    type="radio"
                    name="batch"
                    value="Afternoon"
                    checked={batch === 'Afternoon'}
                    onChange={() => setBatch('Afternoon')}
                    className="w-4 h-4 text-gabay-teal focus:ring-gabay-teal border-gray-300"
                  />
                  Afternoon (1:00 - 5:00)
                </label>
              </div>
            </div>

            <div>
              <label className="block font-poppins font-medium text-gabay-navy text-md mb-1">Reason for Booking</label>
              <textarea
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., General Consultation"
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-poppins text-md focus:outline-none focus:ring-2 focus:ring-gabay-blue transition-all"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-10 pt-6 border-t border-gray-100">
          <Button variant="teal" type="submit" disabled={loading} className="py-2 px-10 min-w-[180px]">
            {loading ? 'Processing...' : 'Confirm Appointment'}
          </Button>
          <Button variant="teal-outline" onClick={handleCancel} type="button" className="py-2 px-10">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}