import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, CalendarX, CalendarPlus, CalendarClock, Plus, ChevronRightIcon } from 'lucide-react';
import StatCard from '../../components/StatCard';
import QueueStatusModal from '../../components/QueueStatusModal';
import AppointmentDetailsModal from '../../components/ApptDetailsModal';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [stats, setStats] = useState({
    approved: 4,
    cancelled: 7,
    slot: 12,
    forApproval: 3
  });

  const [patients, setPatients] = useState([
    { name: 'Juan Dela Cruz', hospitalNumber: '26-154928', reason: 'Consultation', assignedDoctor: 'Dr. Ritchie Cruz' },
    { name: 'Maria Santos', hospitalNumber: '26-154929', reason: 'Follow-up', assignedDoctor: 'Dr. Joseph Nieto' },
    { name: 'Jose Rizal', hospitalNumber: '26-154930', reason: 'Follow-up', assignedDoctor: 'Dr. Ritchie Cruz' },
    { name: 'Antonio Luna', hospitalNumber: '26-154931', reason: 'Consultation', assignedDoctor: 'Dr. Joseph Nieto' },
    { name: 'Gabriela Silang', hospitalNumber: '26-154932', reason: 'Follow-up', assignedDoctor: 'Dr. Diane Marie Mendoza' },
    { name: 'Emilio Aguinaldo', hospitalNumber: '26-154933', reason: 'Consultation', assignedDoctor: 'Dr. Ritchie Cruz' },
    { name: 'Andres Bonifacio', hospitalNumber: '26-154934', reason: 'Follow-up', assignedDoctor: 'Dr. Joseph Nieto' },
    { name: 'Melchora Aquino', hospitalNumber: '26-154935', reason: 'Consultation', assignedDoctor: 'Dr. Diane Marie Mendoza' }
  ]);

  const [queueList, setQueueList] = useState([
    { name: 'Juan Dela Cruz', hospitalNumber: '26-154928', status: 'served' },
    { name: 'Maria Santos', hospitalNumber: '26-154929', status: 'served' }
  ]);

  const handleQueueItemClick = (patient) => {
    setSelectedPatient(patient);
    setModalOpen(true);
  };

  const handleStatusUpdate = (patient, newStatus) => {
    setQueueList(prevList =>
      prevList.map(item =>
        item.hospitalNumber === patient.hospitalNumber ? { ...item, status: newStatus } : item
      )
    );
    setModalOpen(false);
  };

  const handleAddToQueue = (patient) => {
    setQueueList(prev => [...prev, { 
      ...patient, 
      status: 'waiting'
    }]);
    setPatients(prev => prev.filter(p => p.hospitalNumber !== patient.hospitalNumber));
    setAppointmentModalOpen(false);
  };

  const handleNoShow = (patient) => {
    setStats(prev => ({ ...prev, slot: prev.slot + 1 }));
    setPatients(prev => prev.filter(p => p.hospitalNumber !== patient.hospitalNumber));
    setAppointmentModalOpen(false);

    const uniqueId = Date.now(); 
    const currentTime = new Date().toLocaleString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true,
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });

    navigate('/staff/no-show-appointments', {
      state: { 
        newNoShow: {
          id: uniqueId,
          name: patient.name,
          hospitalNumber: patient.hospitalNumber,
          reason: patient.reason,
          assignedDoctor: patient.assignedDoctor,
          time: currentTime
        } 
      }
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'served' || status === 'completed') {
      return { text: 'Completed', className: 'text-green-500 bg-green-100' };
    } else if (status === 'serving') {
      return { text: 'Currently Serving', className: 'text-blue-600 bg-blue-100' };
    } else {
      return { text: 'Waiting', className: 'text-gray-500 bg-gray-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gabay-blue px-6 py-6 mb-4 text-white">
        <div>
          <h1 className="font-montserrat text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="font-poppins text-sm text-white/90 mt-1">
            Dashboard Overview &gt; <span className="text-white font-medium underline underline-offset-4">Queue Management</span>
          </p>
        </div>
        <button 
          onClick={() => navigate('/staff/no-show-appointments')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-gabay-blue font-bold font-poppins text-sm rounded-lg hover:bg-teal-50 transition-all shadow-lg active:scale-95 group"
        >
          View No Show Records
          <ChevronRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[5fr_2fr] gap-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <StatCard title="Appointments for Approval" value={stats.forApproval} icon={CalendarClock} color="gray" onClick={() => navigate('/staff/appointments', { state: { activeTab: 'pending' } })} />
            <StatCard title="Appointments Approved" value={stats.approved} icon={CalendarCheck} color="green" onClick={() => navigate('/staff/appointments', { state: { activeTab: 'approved' } })} />
            <StatCard title="Appointments Cancelled" value={stats.cancelled} icon={CalendarX} color="red" onClick={() => navigate('/staff/appointments', { state: { activeTab: 'canceled' } })} />
            <StatCard title="Available Slots" value={stats.slot} icon={CalendarPlus} color="blue" onClick={() => navigate('/staff/no-show-appointments')} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-montserrat text-xl font-bold text-gabay-blue mb-6">Scheduled Appointment List</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {patients.map((patient, idx) => (
                <div key={patient.hospitalNumber} className="relative bg-gray-100 py-4 px-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="space-y-1">
                    <h3 className="font-poppins font-bold text-md text-gabay-navy">{patient.name}</h3>
                    <p className="font-poppins text-sm text-gray-600">{patient.hospitalNumber}</p>
                    <p className="font-poppins font-medium text-sm mt-2 text-gabay-teal">{patient.reason}</p>
                    <p className="font-poppins text-sm text-gray-500 italic">{patient.assignedDoctor}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAppointment(patient);
                      setAppointmentModalOpen(true);
                    }}
                    className="absolute right-5 top-1/2 -translate-y-1/2 bg-white border-2 border-gabay-blue rounded-lg p-1.5 hover:bg-gabay-blue hover:text-white transition-all shadow-sm"
                  >
                    <Plus size={20} strokeWidth={3} />
                  </button>
                </div>
              ))}
              {patients.length === 0 && <p className="text-gray-400 font-poppins italic">No scheduled appointments left for today.</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-montserrat text-lg font-bold text-gabay-blue">Queue List</h2>
            <span className="text-xs bg-gabay-blue text-white px-2.5 py-1 rounded-full font-bold font-poppins">
              {queueList.filter(p => p.status === 'waiting' || p.status === 'serving').length} ACTIVE
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {queueList.map((item) => {
              const badge = getStatusBadge(item.status);
              return (
                <div
                  key={item.hospitalNumber}
                  onClick={() => handleQueueItemClick(item)}
                  className="flex items-center justify-between py-3 px-4 bg-gray-50 border border-gray-100 rounded-lg cursor-pointer hover:border-gabay-teal hover:bg-white transition-all shadow-sm"
                >
                  <div>
                    <p className="font-poppins font-bold text-md text-gabay-navy">{item.name}</p>
                    <p className="font-poppins text-sm text-gray-400">{item.hospitalNumber}</p>
                  </div>
                  <span className={`font-poppins text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${badge.className}`}>
                    {badge.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedPatient && (
        <QueueStatusModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          patient={selectedPatient}
          onUpdate={handleStatusUpdate}
        />
      )}

      {selectedAppointment && (
        <AppointmentDetailsModal
          isOpen={appointmentModalOpen}
          onClose={() => setAppointmentModalOpen(false)}
          patient={selectedAppointment}
          onAddToQueue={handleAddToQueue}
          onNoShow={handleNoShow}
        />
      )}
    </div>
  );
}