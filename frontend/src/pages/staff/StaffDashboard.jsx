import { CalendarCheck, CalendarX, CalendarOff, CalendarClock, Plus } from 'lucide-react';
import StatCard from '../../components/StatCard';

export default function StaffDashboard() {
  const stats = {
    approved: 4,
    cancelled: 7,
    noShow: 12,
    forApproval: 3
  };

  const patients = [
    { name: 'Juan Dela Cruz', hospitalNumber: '26-154928', reason: 'Consultation' },
    { name: 'Maria Santos', hospitalNumber: '26-154929', reason: 'Follow-up' },
    { name: 'Jose Rizal', hospitalNumber: '26-154930', reason: 'Follow-up' },
    { name: 'Antonio Luna', hospitalNumber: '26-154931', reason: 'Consultation' },
    { name: 'Gabriela Silang', hospitalNumber: '26-154932', reason: 'Follow-up' }
  ];

  const queueList = [
    { name: 'Patient One', hospitalNumber: 'HN-001', status: 'served' },
    { name: 'Patient Two', hospitalNumber: 'HN-002', status: 'served' },
    { name: 'Patient Three', hospitalNumber: 'HN-003', status: 'waiting' },
    { name: 'Patient Four', hospitalNumber: 'HN-004', status: 'waiting' },
    { name: 'Patient Five', hospitalNumber: 'HN-005', status: 'waiting' },
    { name: 'Patient Six', hospitalNumber: 'HN-006', status: 'waiting' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gabay-blue px-4 py-4 mb-4">
        <div>
          <h1 className="font-montserrat text-3xl font-bold text-white">Dashboard</h1>
          <p className="font-poppins text-sm text-white mt-1">
            Dashboard Overview &gt; <span className="text-white font-medium">Queue Management</span>
          </p>
        </div>

        <div className="flex gap-4">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium font-poppins text-sm rounded-lg hover:bg-gray-50 transition">
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[5fr_2fr] gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <StatCard 
              title="Appointments Approved" 
              value={stats.approved} 
              icon={CalendarCheck} 
              color="green" 
            />
            <StatCard 
              title="Appointments Cancelled" 
              value={stats.cancelled} 
              icon={CalendarX} 
              color="red" 
            />
            <StatCard 
              title="Appointments No Show" 
              value={stats.noShow} 
              icon={CalendarOff} 
              color="blue" 
            />
            <StatCard 
              title="Appointments for Approval" 
              value={stats.forApproval} 
              icon={CalendarClock} 
              color="gray" 
            />
          </div>

          {/* Queue List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-montserrat text-lg font-bold text-gabay-blue">Queue List</h2>
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-poppins">
                {queueList.length} Waiting
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {queueList.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-10 px-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-poppins font=medium text-lg text-gray-800">{item.name}</p>
                    <p className="font-poppins text-lg text-gray-600 mt-2">{item.hospitalNumber}</p>
                  </div>
                  <span className={`font-poppins text-md font-medium ${ item.status === 'served' ? 'text-green-500' : 'text-gray-500'}`}> {item.status} </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-md">
        <div className="text-center mb-6">
            <h2 className="font-montserrat text-xl font-bold text-gabay-blue">
            Scheduled Appointment List
            </h2>
        </div>
        <div className="flex flex-col gap-4">
            {patients.map((patient, idx) => (
            <div 
                key={idx} 
                className="relative bg-[#9db4db] py-4 px-4 rounded-xl shadow-sm border border-blue-200/50">
                <div className="space-y-1">
                <h3 className="font-poppins font-bold text-sm">
                    {patient.name}
                </h3>
                <p className="font-poppins text-sm">
                    {patient.hospitalNumber}
                </p>
                <p className="font-poppins font-medium text-sm mt-2">
                    {patient.reason}
                </p>
                </div>
                <button className="absolute right-5 top-1/2 -translate-y-1/2 bg-transparent border-2 border-[#5a81c4] rounded-lg p-1 hover:bg-white/20 transition-colors">
                <Plus size={24} className="text-gabay-blue" strokeWidth={5} />
                </button>
            </div>
            ))}
        </div>
        </div>
      </div>
    </div>
  );
}