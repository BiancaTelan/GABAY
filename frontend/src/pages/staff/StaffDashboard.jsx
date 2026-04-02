// src/pages/staff/StaffDashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, CalendarX, CalendarOff, CalendarClock, Plus } from 'lucide-react';
import StatCard from '../../components/StatCard';
import QueueStatusModal from '../../components/QueueStatusModal';
import AppointmentDetailsModal from '../../components/ApptDetailsModal';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

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
    { name: 'Gabriela Silang', hospitalNumber: '26-154932', reason: 'Follow-up' },
    { name: 'Emilio Aguinaldo', hospitalNumber: '26-154933', reason: 'Consultation' }
  ];

  const [queueList, setQueueList] = useState([
    { name: 'Juan Dela Cruz', hospitalNumber: '26-154928', status: 'served' },
    { name: 'Maria Santos', hospitalNumber: '26-154929', status: 'served' },
    { name: 'Jose Rizal', hospitalNumber: '26-154930', status: 'waiting' },
    { name: 'Antonio Luna', hospitalNumber: '26-154931', status: 'waiting' },
    { name: 'Gabriela Silang', hospitalNumber: '26-154932', status: 'waiting' },
    { name: 'Emilio Aguinaldo', hospitalNumber: '26-154933', status: 'waiting' }
  ]);

  const handleQueueItemClick = (patient) => {
    setSelectedPatient(patient);
    setModalOpen(true);
  };

  const handleStatusUpdate = (patient, newStatus) => {
    setQueueList(prevList =>
      prevList.map(item =>
        item.hospitalNumber === patient.hospitalNumber
          ? { ...item, status: newStatus }
          : item
      )
    );
    setModalOpen(false);
    console.log(`Updated ${patient.name} to ${newStatus}`);
  };

  const handleAddToQueue = (patient) => {
    console.log('Add to queue:', patient);
    setAppointmentModalOpen(false);
  };

  const handleNoShow = (patient) => {
    console.log('No-show:', patient);
    setAppointmentModalOpen(false);
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
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <StatCard title="Appointments Approved" value={stats.approved} icon={CalendarCheck} color="green" onClick={() => navigate('/staff/approved-appointments')} />
            <StatCard title="Appointments Cancelled" value={stats.cancelled} icon={CalendarX} color="red" onClick={() => navigate('/staff/cancelled-appointments')} />
            <StatCard title="Appointments No Show" value={stats.noShow} icon={CalendarOff} color="blue" onClick={() => navigate('/staff/no-show-appointments')} />
            <StatCard title="Appointments for Approval" value={stats.forApproval} icon={CalendarClock} color="gray" onClick={() => navigate('/staff/for-approval-appointments')} />
          </div>

          {/* Scheduled Appointment List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-center mb-6">
              <h2 className="font-montserrat text-xl font-bold text-gabay-blue">Scheduled Appointment List</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {patients.map((patient, idx) => (
                <div key={idx} className="relative bg-blue-100 py-7 px-6 rounded-xl shadow-sm border border-blue-200/50">
                  <div className="space-y-1">
                    <h3 className="font-poppins font-bold text-md">{patient.name}</h3>
                    <p className="font-poppins text-md">{patient.hospitalNumber}</p>
                    <p className="font-poppins font-medium text-md mt-2">{patient.reason}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAppointment(patient);
                      setAppointmentModalOpen(true);
                    }}
                    className="absolute right-5 top-1/2 -translate-y-1/2 bg-transparent border-2 border-gabay-blue rounded-lg p-1 hover:bg-gabay-blue/20 transition-colors"
                  >
                    <Plus size={24} className="text-gabay-blue" strokeWidth={5} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Queue List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-montserrat text-lg font-bold text-gabay-blue">Queue List</h2>
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-poppins">
                {queueList.filter(p => p.status === 'waiting' || p.status === 'serving').length} Waiting
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {queueList.map((item, idx) => {
                const badge = getStatusBadge(item.status);
                return (
                  <div
                    key={idx}
                    onClick={() => handleQueueItemClick(item)}
                    className="flex items-center justify-between py-4 px-4 shadow-md bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                  >
                    <div>
                      <p className="font-poppins font-medium text-md text-gray-800">{item.name}</p>
                      <p className="font-poppins text-md text-gray-600 mt-2">{item.hospitalNumber}</p>
                    </div>
                    <span className={`font-poppins text-md font-medium px-2 py-1 rounded-full ${badge.className}`}>
                      {badge.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Queue Status Modal */}
      {selectedPatient && (
        <QueueStatusModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          patient={selectedPatient}
          onUpdate={handleStatusUpdate}
        />
      )}

      {/* Appointment Details Modal */}
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