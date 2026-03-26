import React, { useState, useMemo } from 'react';
import { 
  Search, Download, Funnel, Plus, 
  Calendar, Clock, User, Stethoscope, 
  CheckCircle, XCircle, AlertCircle, MoreVertical
} from 'lucide-react';

// --- MOCK DATA (15 Entries) ---
// Note: In a real app, 'patientId' and 'doctorId' would link to your other tables
const rawAppointments = [
  { id: 'APP-2026-001', patient: 'Maria Clara', doctor: 'Dr. Santos', dept: 'Cardiology', date: '2026-03-27', time: '09:00 AM', type: 'Consultation', status: 'Pending' },
  { id: 'APP-2026-002', patient: 'Juan Dela Cruz', doctor: 'Dr. Reyes', dept: 'Pediatrics', date: '2026-03-27', time: '10:30 AM', type: 'Follow-up', status: 'Confirmed' },
  { id: 'APP-2026-003', patient: 'Crisostomo Ibarra', doctor: 'Dr. Gomez', dept: 'Dermatology', date: '2026-03-28', time: '01:00 PM', type: 'Check-up', status: 'Completed' },
  { id: 'APP-2026-004', patient: 'Elias Salcedo', doctor: 'Dr. Cruz', dept: 'Radiology', date: '2026-03-28', time: '03:00 PM', type: 'X-Ray', status: 'Cancelled' },
  { id: 'APP-2026-005', patient: 'Sisa Narciso', doctor: 'Dr. Dalisay', dept: 'Emergency', date: '2026-03-27', time: '11:45 AM', type: 'Emergency', status: 'Confirmed' },
  // ... (Add 10 more similar objects for testing)
];

const statusStyles = {
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  Completed: 'bg-green-100 text-green-700 border-green-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export default function Appointments() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ sortKey: 'date', sortOrder: 'desc', status: [] });

  const itemsPerPage = 10;

  // --- LOGIC: FILTER & SORT ---
  const filteredData = useMemo(() => {
    let result = rawAppointments.filter(app => 
      app.patient.toLowerCase().includes(search.toLowerCase()) || 
      app.id.toLowerCase().includes(search.toLowerCase())
    );

    if (filters.status.length > 0) {
      result = result.filter(app => filters.status.includes(app.status));
    }

    result.sort((a, b) => {
      const valA = a[filters.sortKey];
      const valB = b[filters.sortKey];
      return filters.sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    return result;
  }, [search, filters]);

  const pagedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-gabay-blue">Appointment Masterlist</h1>
        <p className="text-xs md:text-sm font-poppins text-gray-500">Main Menu &gt; Appointments</p>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
        <div className="flex flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96">
            <input 
              type="text" placeholder="Search Patient or Ref #..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg font-poppins outline-none focus:ring-2 focus:ring-gabay-blue/20"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button className="whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full bg-gabay-teal text-white font-medium text-sm hover:bg-opacity-90 transition shadow-sm">
            <Plus size={16} /> <span className="hidden sm:inline">New Appointment</span><span className="sm:hidden">Book</span>
          </button>
        </div>

        <div className="flex flex-row gap-2 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gabay-teal text-gabay-teal rounded-lg text-sm font-medium">
            <Download size={16} /> Export
          </button>
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gabay-teal text-gabay-teal rounded-lg text-sm font-medium">
            <Funnel size={16} /> Filter
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-gabay-blue text-white font-poppins uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Ref Number</th>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Doctor / Dept</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-poppins text-sm">
              {pagedData.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{app.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{app.patient}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-700 font-medium">{app.doctor}</span>
                      <span className="text-[10px] text-gabay-teal uppercase font-bold">{app.dept}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} className="text-gabay-blue" /> {app.date}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={14} className="text-gabay-blue" /> {app.time}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${statusStyles[app.status]}`}>
                      {app.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Approve/Confirm">
                        <CheckCircle size={18} />
                      </button>
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Cancel Appointment">
                        <XCircle size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}