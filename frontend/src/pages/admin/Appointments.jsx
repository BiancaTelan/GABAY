import React, { useState, useMemo } from 'react';
import { 
  Search, Download, Funnel, Plus, 
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Calendar, Clock, User 
} from 'lucide-react';

// --- MOCK DATA (15 Entries to test pagination) ---
const rawAppointments = [
  { id: 'APPT-102463', hospitalNum: '26-154928', patient: 'Juan Dela Cruz', dept: 'Internal Medicine', isSpecialty: false, doctor: 'Dr. Ritchie Cruz', status: 'Approved', date: '03/20/2026', time: '8:00 AM - 12:00 PM', approvedBy: 'Staff Name', approvedDate: '03/05/2026', lastUpdate: '03/15/2026 3:45 PM' },
  { id: 'APPT-102464', hospitalNum: '26-123456', patient: 'Maria Dela Cruz', dept: 'IM - Cardiology', isSpecialty: true, doctor: 'Dr. Manuel Gomez', status: 'Completed', date: '03/21/2026', time: '1:00 PM - 3:00 PM', approvedBy: 'Staff Name', approvedDate: '03/06/2026', lastUpdate: '03/22/2026 9:00 AM' },
  { id: 'APPT-102465', hospitalNum: '26-177354', patient: 'Rachel Mawac', dept: 'Dermatology', isSpecialty: true, doctor: 'Dr. Maria de Jesus', status: 'Cancelled', date: '03/18/2026', time: '9:00 AM - 11:00 AM', cancelReason: 'Rescheduled to another date', lastUpdate: '03/17/2026 4:00 PM' },
  { id: 'APPT-102466', hospitalNum: '26-177354', patient: 'Isabelle Gomez', dept: 'IM - Pulmonology', isSpecialty: true, doctor: 'Dr. Roberto Cruz', status: 'Pending', date: '04/05/2026', time: '10:00 AM - 12:00 PM', lastUpdate: '04/01/2026 2:30 PM' },
  { id: 'APPT-102467', hospitalNum: '26-12699', patient: 'Chelly Redondo', dept: 'Dentistry', isSpecialty: false, doctor: 'Dr. Juanita Santos', status: 'Completed', date: '03/20/2026', time: '8:00 AM - 12:00 PM', approvedBy: 'Staff Name', approvedDate: '03/05/2026', lastUpdate: '03/15/2026 3:45 PM' },
  { id: 'APPT-102468', hospitalNum: '26-15500', patient: 'Zack Arias', dept: 'General IM', isSpecialty: false, doctor: 'Dr. Elena Fajardo', status: 'Approved', date: '04/02/2026', time: '2:00 PM - 4:00 PM', approvedBy: 'Staff Name', approvedDate: '03/30/2026', lastUpdate: '03/30/2026 10:00 AM' },
  { id: 'APPT-102469', hospitalNum: '26-11122', patient: 'Roberto Garcia', dept: 'General IM', isSpecialty: false, doctor: 'Dr. Zack Arias', status: 'Pending', date: '04/02/2026', time: '9:00 AM', lastUpdate: '03/30/2026 11:00 AM' },
  { id: 'APPT-102470', hospitalNum: '26-33344', patient: 'Elena Santos', dept: 'Pediatrics', isSpecialty: false, doctor: 'Dr. Elena Fajardo', status: 'Completed', date: '03/25/2026', time: '10:00 AM', lastUpdate: '03/26/2026 8:00 AM' },
  { id: 'APPT-102471', hospitalNum: '26-55566', patient: 'Ricardo Dalisay', dept: 'Dermatology', isSpecialty: true, doctor: 'Dr. Bernice Castro', status: 'Cancelled', cancelReason: 'Patient request', date: '03/28/2026', time: '1:00 PM', lastUpdate: '03/27/2026 5:00 PM' },
  { id: 'APPT-102472', hospitalNum: '26-77788', patient: 'Liza Soberano', dept: 'Cardiology', isSpecialty: true, doctor: 'Dr. Harvey Isip', status: 'Approved', date: '04/03/2026', time: '3:00 PM', lastUpdate: '04/01/2026 9:00 AM' },
  { id: 'APPT-102473', hospitalNum: '26-99900', patient: 'Bong Go', dept: 'Neurology', isSpecialty: true, doctor: 'Dr. Jojo Kasilag', status: 'Pending', date: '04/10/2026', time: '11:00 AM', lastUpdate: '04/05/2026 1:00 PM' },
];

const statusStyles = {
  Approved: 'bg-amber-100 text-amber-700',
  Completed: 'bg-green-50 text-gabay-green',
  Cancelled: 'bg-red-50 text-gabay-red',
  Pending: 'bg-gray-100 text-gray-400',
};

export default function Appointments() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  
  const [filters, setFilters] = useState({
    sortKey: 'id',
    sortOrder: 'asc',
    statuses: ['Pending', 'Approved', 'Completed', 'Cancelled'],
    deptTypes: ['General', 'Specialty']
  });

  const itemsPerPage = 10;

  // --- LOGIC: FILTERING & SORTING ---
  const filteredData = useMemo(() => {
    let result = rawAppointments.filter(item => 
      item.patient.toLowerCase().includes(search.toLowerCase()) || 
      item.doctor.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.hospitalNum.includes(search)
    );

    if (filters.statuses.length > 0) result = result.filter(i => filters.statuses.includes(i.status));
    
    if (filters.deptTypes.length > 0) {
      result = result.filter(i => {
        const type = i.isSpecialty ? 'Specialty' : 'General';
        return filters.deptTypes.includes(type);
      });
    }

    result.sort((a, b) => {
      const valA = a[filters.sortKey];
      const valB = b[filters.sortKey];
      const comparison = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [search, filters]);

  // --- LOGIC: PAGINATION ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pagedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const entryStart = filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const entryEnd = Math.min(currentPage * itemsPerPage, filteredData.length);

  // --- LOGIC: SELECTION ---
const handleSelectAll = (e) => {
  if (e.target.checked) {
    setSelectedIds(pagedData.map(i => i.id));
  } else {
    setSelectedIds([]);
  }
};

const toggleSelection = (id) => {
  setSelectedIds(prev => 
    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  );
};

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-gabay-blue tracking-tight">Appointments Management</h1>
        <p className="text-xs md:text-sm font-poppins text-gray-500">Main Menu &gt; Appointments</p>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
        <div className="flex flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96">
            <input 
              type="text" value={search}
              onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}}
              placeholder="Search Appointments..." 
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg font-poppins outline-none focus:ring-2 focus:ring-gabay-blue/20"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button className="whitespace-nowrap flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-gabay-teal text-white font-medium font-poppins text-sm hover:bg-opacity-90 transition shadow-sm">
            <Plus size={16} /><span className="hidden sm:inline">New Appointment</span><span className="sm:hidden">Appointment</span> 
          </button>
        </div>

        <div className="flex flex-row gap-2 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gabay-teal text-gabay-teal rounded-lg text-sm font-poppins font-medium">
            <Download size={16} /> Export as CSV
          </button>
          
          <div className="relative flex-1 lg:flex-none">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gabay-teal text-gabay-teal rounded-lg text-sm font-poppins font-medium"
            >
              <Funnel size={16} /> Filter ({filters.statuses.length + filters.deptTypes.length})
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] p-5 space-y-5 max-h-[500px] overflow-y-auto">
                <div>
                  <p className="text-[10px] font-bold font-poppins text-gray-400 uppercase tracking-widest mb-3">Sort By</p>
                  <div className="space-y-3">
                    <select 
                      value={filters.sortKey}
                      className="w-full text-sm font-poppins border rounded-lg p-2 outline-none"
                      onChange={(e) => setFilters({...filters, sortKey: e.target.value})}
                    >
                      <option value="id">Appointment ID</option>
                      <option value="dept">Department</option>
                    </select>
                    <select 
                      value={filters.sortOrder}
                      className="w-full text-sm font-poppins border rounded-lg p-2 outline-none"
                      onChange={(e) => setFilters({...filters, sortOrder: e.target.value})}
                    >
                      <option value="asc">Ascending (A-Z)</option>
                      <option value="desc">Descending (Z-A)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold font-poppins text-gray-400 uppercase tracking-widest mb-3">Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Pending', 'Approved', 'Completed', 'Cancelled'].map(s => (
                      <label key={s} className="flex items-center gap-2 text-sm font-poppins cursor-pointer">
                        <input type="checkbox" checked={filters.statuses.includes(s)} onChange={(e) => {
                          const newStatus = e.target.checked ? [...filters.statuses, s] : filters.statuses.filter(x => x !== s);
                          setFilters({...filters, statuses: newStatus});
                        }} className="w-4 h-4 rounded bg-gabay-blue" />
                        <span className="text-gray-600">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold font-poppins text-gray-400 uppercase tracking-widest mb-3">Department Type</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['General', 'Specialty'].map(type => (
                      <label key={type} className="flex items-center gap-2 text-sm font-poppins cursor-pointer">
                        <input type="checkbox" checked={filters.deptTypes.includes(type)} onChange={(e) => {
                          const newTypes = e.target.checked ? [...filters.deptTypes, type] : filters.deptTypes.filter(x => x !== type);
                          setFilters({...filters, deptTypes: newTypes});
                        }} className="w-4 h-4 rounded bg-gabay-blue" />
                        <span className="text-gray-600">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button onClick={() => setFilters({ sortKey: 'id', sortOrder: 'asc', statuses: [], deptTypes: [] })} 
                  className="flex-1 py-2 text-xs font-poppins font-medium border border-gray-400 rounded-lg text-gray-400 hover:text-red-500 transition-colors">Reset All</button>
                  <button onClick={() => setShowFilterDropdown(false)} 
                  className="flex-1 py-2 bg-gabay-blue text-white rounded-lg text-xs font-poppins font-medium shadow-md hover:bg-opacity-90 transition-all">Apply</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-gabay-blue font-poppins text-white select-none">
              <tr>
                <th className="px-4 py-4 text-center">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedIds.length === pagedData.length && pagedData.length > 0}
                    className="w-4 h-4 accent-gabay-blue"
                  />
                </th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">Appointment ID</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">Hospital #</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">Patient Name</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">Doctor</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">Department</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center">Status</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedData.map((app) => (
                <React.Fragment key={app.id}>
                  <tr className={`hover:bg-gray-50 transition-colors ${expandedId === app.id ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-4 py-4 text-center"><input 
                      type="checkbox" checked={selectedIds.includes(app.id)} 
                      onChange={() => toggleSelection(app.id)} className="w-4 h-4 accent-gabay-blue" />
                    </td>
                    <td className="px-4 py-4 text-sm font-poppins text-gray-700 font-medium">{app.id}</td>
                    <td className="px-4 py-4 text-sm font-poppins text-gray-700 font-base">{app.hospitalNum}</td>
                    <td className="px-4 py-4 text-sm font-poppins font-medium text-gabay-blue">{app.patient}</td>
                    <td className="px-4 py-4 text-sm font-poppins text-gray-700">{app.doctor}</td>
                    <td className="px-4 py-4 text-sm font-poppins text-gabay-teal font-medium">{app.dept}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-4 py-0.5 rounded-full text-[11px] font-poppins font-bold ${statusStyles[app.status]}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                        className="text-gray-400 hover:text-gabay-blue transition-colors"
                      >
                        {expandedId === app.id ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                      </button>
                    </td>
                  </tr>
                  {expandedId === app.id && (
                    <tr className="bg-gray-50/50 border-l-4 border-gabay-blue">
                      <td colSpan="8" className="px-10 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-2 text-xs font-poppins">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Schedule:</p>
                            <span className="flex items-center gap-2 text-gabay-blue font-medium"><Calendar size={14}/> {app.date}</span>
                            <span className="flex items-center gap-2 text-gabay-blue font-medium"><Clock size={14}/> {app.time}</span>
                          </div>
                          <div className="space-y-2 text-xs font-poppins">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Approved By:</p>
                            <span className="flex items-center gap-2 text-gabay-blue font-medium"><User size={14}/> {app.approvedBy || '--'}</span>
                            <span className="flex items-center gap-2 text-gabay-blue font-medium"><Calendar size={14}/> {app.approvedDate || '--'}</span>
                          </div>
                          <div className="space-y-2 text-xs font-poppins">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Updated:</p>
                            <span className="text-gabay-blue font-medium">{app.lastUpdate}</span>
                          </div>
                        </div>
                        {app.status === 'Cancelled' && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                            <p className="text-[10px] font-bold text-red-400 uppercase">Reason:</p>
                            <p className="text-xs italic text-red-600">"{app.cancelReason}"</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)} 
              className="p-1.5 rounded hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20}/>
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentPage(i + 1)} 
                  className={`w-8 h-8 rounded-lg text-xs font-poppins font-bold transition-all ${
                    currentPage === i + 1 ? 'bg-gabay-blue text-white shadow-md' : 'hover:bg-white border border-transparent hover:border-gray-200 text-gray-500'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages || totalPages === 0} 
              onClick={() => setCurrentPage(p => p + 1)} 
              className="p-1.5 rounded hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={20}/>
            </button>
          </div>
          <p className="text-[10px] md:text-xs text-gray-400 font-poppins font-medium">
            Showing {entryStart} - {entryEnd} of {filteredData.length} entries
          </p>
        </div>
      </div>
    </div>
  );
}