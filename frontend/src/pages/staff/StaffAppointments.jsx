import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, SquarePen, Funnel } from 'lucide-react';
import ApproveScheduleModal from '../../components/ApproveSchedModal';
import BookScheduleForm from './BookScheduleForm';

export default function StaffAppointments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('approve'); // only 'approve' now
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Filter
  const [tempSortKey, setTempSortKey] = useState('date');
  const [tempSortOrder, setTempSortOrder] = useState('asc');
  const [tempSelectedDoctors, setTempSelectedDoctors] = useState([]);
  const [tempShowNewPatient, setTempShowNewPatient] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'date', order: 'asc' });
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [showNewPatient, setShowNewPatient] = useState(false);

  const itemsPerPage = 6;

  // Sample Data
  const [pendingAppointments, setPendingAppointments] = useState([
    { id: '1', name: 'Juan Dela Cruz', hospitalNo: '29-736473', reason: 'Consultation', requestedStartDate: '01/20/2026', requestedEndDate: '01/24/2026', status: 'pending', assignedDoctor: '', email: 'juan@example.com' },
    { id: '2', name: 'Maria Santos', hospitalNo: '29-736474', reason: 'Follow-up', requestedStartDate: '01/22/2026', requestedEndDate: '01/25/2026', status: 'pending', assignedDoctor: 'Dr. Joseph Nieto', email: 'maria@example.com' },
    { id: '3', name: 'Jose Rizal', hospitalNo: '29-736475', reason: 'Consultation', requestedStartDate: '02/01/2026', requestedEndDate: '02/05/2026', status: 'pending', assignedDoctor: 'Dr. Ritchie Cruz', email: 'jose@example.com' },
    { id: '4', name: 'Antonio Luna', hospitalNo: '29-736476', reason: 'Follow-up', requestedStartDate: '02/03/2026', requestedEndDate: '02/07/2026', status: 'pending', assignedDoctor: 'Dr. Joseph Nieto', email: 'antonio@example.com' },
    { id: '5', name: 'Andres Bonifacio', hospitalNo: '29-736477', reason: 'Consultation', requestedStartDate: '02/09/2026', requestedEndDate: '02/13/2026', status: 'pending', assignedDoctor: '', email: 'andres@example.com' },
    { id: '6', name: 'Antonio Luna', hospitalNo: '29-736478', reason: 'Follow-up', requestedStartDate: '02/15/2026', requestedEndDate: '02/19/2026', status: 'pending', assignedDoctor: 'Dr. Joseph Nieto', email: 'antonio2@example.com' }
  ]);
  const [approvedAppointments, setApprovedAppointments] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [canceledAppointments, setCanceledAppointments] = useState([
    { id: '1', name: 'Juan Dela Cruz', hospitalNo: '29-736473', reason: 'Consultation', appointmentDate: '03/01/2026', batch: 'Morning', assignedDoctor: 'Dr. Ritchie Cruz', status: 'canceled' },
    { id: '2', name: 'Maria Santos', hospitalNo: '29-736474', reason: 'Follow-up', appointmentDate: '03/04/2026', batch: 'Morning', assignedDoctor: 'Dr. Joseph Nieto', status: 'canceled' },
    { id: '3', name: 'Jose Rizal', hospitalNo: '29-736475', reason: 'Consultation', appointmentDate: '03/09/2026', batch: 'Afternoon', assignedDoctor: 'Dr. Ritchie Cruz', status: 'canceled' },
    { id: '4', name: 'Antonio Luna', hospitalNo: '29-736476', reason: 'Follow-up', appointmentDate: '03/12/2026', batch: 'Afternoon', assignedDoctor: 'Dr. Joseph Nieto', status: 'canceled' },
    { id: '5', name: 'Andres Bonifacio', hospitalNo: '29-736477', reason: 'Consultation', appointmentDate: '03/20/2026', batch: 'Morning', assignedDoctor: 'Dr. Diane Marie Mendoza', status: 'canceled' },
    { id: '6', name: 'Antonio Luna', hospitalNo: '29-736478', reason: 'Consultation', appointmentDate: '03/15/2026', batch:'Morning', assignedDoctor: 'Dr. Ritchie Cruz', status: 'canceled' }
  ]);

  // Helper functions
  const getCurrentData = () => {
    switch (activeTab) {
      case 'pending': return pendingAppointments;
      case 'approved': return approvedAppointments;
      case 'book': return bookedAppointments;
      case 'canceled': return canceledAppointments;
      default: return [];
    }
  };

  const availableDoctors = useMemo(() => {
  const doctors = new Set();
  const allData = [...pendingAppointments, ...approvedAppointments, ...canceledAppointments];
  
  allData.forEach(a => {
    if (a.assignedDoctor) doctors.add(a.assignedDoctor);
  });
  return Array.from(doctors).sort();
}, [pendingAppointments, approvedAppointments, canceledAppointments]);

useEffect(() => {
  setSelectedDoctors([]);
  setShowNewPatient(false);
  setCurrentPage(1);
}, [activeTab]);

  const getFilteredAppointments = () => {
    let filtered = [...getCurrentData()];
    if (activeTab === 'pending' || activeTab === 'approved' || activeTab === 'canceled') {
      if (selectedDoctors.length > 0 && !showNewPatient) {
        filtered = filtered.filter(app => selectedDoctors.includes(app.assignedDoctor));
      } else if (selectedDoctors.length === 0 && showNewPatient) {
        filtered = filtered.filter(app => !app.assignedDoctor);
      } else if (selectedDoctors.length > 0 && showNewPatient) {
        filtered = filtered.filter(app => selectedDoctors.includes(app.assignedDoctor) || !app.assignedDoctor);
      }
    }
    if (searchTerm) {
      filtered = filtered.filter(app => app.name.toLowerCase().includes(searchTerm.toLowerCase()) || app.hospitalNo.includes(searchTerm));
    }
    filtered.sort((a, b) => {
      let valA, valB;
      if (sortConfig.key === 'date') {
        if (activeTab === 'pending') {
          valA = new Date(a.requestedStartDate);
          valB = new Date(b.requestedStartDate);
        } else {
          valA = new Date(a.appointmentDate);
          valB = new Date(b.appointmentDate);
        }
      } else {
        valA = a.name;
        valB = b.name;
      }
      if (valA < valB) return sortConfig.order === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.order === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  };

  const filtered = getFilteredAppointments();
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Approve
  const handleApprove = (approvedData) => {
    console.log(`Sending email to ${approvedData.email} with appointment details.`);
    setPendingAppointments(prev => prev.filter(a => a.id !== approvedData.id));
    const finalData = { ...approvedData, status: 'approved' };
    setApprovedAppointments(prev => [...prev, finalData]);
    setModalOpen(false);
  };

  const tabs = [
    { id: 'pending', label: 'PENDING APPROVAL' },
    { id: 'approved', label: 'APPROVED SCHEDULES' },
    { id: 'book', label: 'BOOK SCHEDULES' },
    { id: 'canceled', label: 'CANCELED SCHEDULES' },
  ];

  // Filter
  const openFilter = () => {
    setTempSortKey(sortConfig.key);
    setTempSortOrder(sortConfig.order);
    setTempSelectedDoctors([...selectedDoctors]);
    setTempShowNewPatient(showNewPatient);
    setShowFilterDropdown(true);
  };
  const applyFilters = () => {
    setSortConfig({ key: tempSortKey, order: tempSortOrder });
    setSelectedDoctors([...tempSelectedDoctors]);
    setShowNewPatient(tempShowNewPatient);
    setCurrentPage(1);
    setShowFilterDropdown(false);
  };
  const resetFilters = () => {
    setTempSortKey('date');
    setTempSortOrder('asc');
    setTempSelectedDoctors([]);
    setTempShowNewPatient(false);
    setSortConfig({ key: 'date', order: 'asc' });
    setSelectedDoctors([]);
    setShowNewPatient(false);
    setCurrentPage(1);
    setShowFilterDropdown(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Breadcrumb */}
      <div className="bg-gabay-blue px-6 py-4 mb-6">
        <h1 className="font-montserrat text-3xl font-bold text-white">Appointment Management</h1>
        <p className="font-poppins text-sm text-white mt-1">
          Appointment Management &gt; {tabs.find(t => t.id === activeTab)?.label || 'Pending Approval'}
        </p>
      </div>

      {/* Tabs */}
      <div className="w-full border border-gabay-blue overflow-hidden mb-6">
        <div className="grid grid-cols-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`py-2 text-md font-poppins font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gabay-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

       {activeTab !== 'book' && (
        <>
          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
            <div className="relative w-full lg:w-96">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search Patient..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg font-poppins outline-none focus:ring-2 focus:ring-gabay-blue/20"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
            </div>
            <button onClick={openFilter} className="flex items-center gap-2 px-4 py-2 bg-white border border-gabay-teal text-gabay-teal rounded-lg text-sm font-poppins font-medium">
              <Funnel size={16} /> Filter & Sort
            </button>
          </div>

          {/* Filter Dropdown */}
          {showFilterDropdown && (
            <div className="relative">
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] p-5 space-y-5">
                {/* Sort By */}
                <div>
                  <p className="text-[10px] font-bold font-poppins text-gray-400 uppercase tracking-widest mb-3">Sort By</p>
                  <div className="space-y-3">
                    <select value={tempSortKey} onChange={(e) => setTempSortKey(e.target.value)} className="w-full text-sm font-poppins border border-gray-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-gabay-blue/10">
                      <option value="name">Name</option>
                      <option value="date">Date</option>
                    </select>
                    <select value={tempSortOrder} onChange={(e) => setTempSortOrder(e.target.value)} className="w-full text-sm font-poppins border border-gray-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-gabay-blue/10">
                      <option value="asc">Ascending (A-Z / Oldest first)</option>
                      <option value="desc">Descending (Z-A / Newest first)</option>
                    </select>
                  </div>
                </div>

                {/* Filter by Doctor */}
                {(activeTab === 'pending' || activeTab === 'approved' || activeTab === 'canceled') && (
                  <div>
                    <p className="text-[10px] font-bold font-poppins text-gray-400 uppercase tracking-widest mb-3">Filter by Doctor</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      <label className="flex items-center gap-2 text-sm font-poppins cursor-pointer group">
                        <input type="checkbox" checked={tempShowNewPatient} onChange={(e) => setTempShowNewPatient(e.target.checked)} className="w-4 h-4 rounded accent-gabay-blue" />
                        <span className="text-gray-600 group-hover:text-gabay-blue transition-colors">New Patient (No Doctor)</span>
                      </label>
                      {availableDoctors.map(doctor => (
                        <label key={doctor} className="flex items-center gap-2 text-sm font-poppins cursor-pointer group">
                          <input type="checkbox" checked={tempSelectedDoctors.includes(doctor)} onChange={(e) => {
                            if (e.target.checked) setTempSelectedDoctors([...tempSelectedDoctors, doctor]);
                            else setTempSelectedDoctors(tempSelectedDoctors.filter(d => d !== doctor));
                          }} className="w-4 h-4 rounded accent-gabay-blue" />
                          <span className="text-gray-600 group-hover:text-gabay-blue transition-colors">{doctor}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button onClick={resetFilters} className="flex-1 py-2 text-xs font-poppins font-medium border border-gray-400 rounded-lg text-gray-400 hover:text-red-500 transition-colors">Reset All</button>
                  <button onClick={applyFilters} className="flex-1 py-2 bg-gabay-blue text-white rounded-lg text-xs font-poppins font-medium shadow-md hover:bg-opacity-90 transition-all">Apply</button>
                </div>
              </div>
            </div>
          )}

          {/* Appointments List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginated.length === 0 ? (
              <div className="col-span-2 bg-white rounded-md shadow-sm border border-gray-100 p-6 text-center">
                <p className="font-poppins text-gray-500">No appointments found.</p>
              </div>
            ) : (
              paginated.map(app => (
                <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-montserrat text-xl font-semibold text-gabay-navy">{app.name}</p>
                          <p className="font-poppins text-md text-gabay-navy">{app.hospitalNo}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium font-poppins ${
                            app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            app.status === 'approved' ? 'bg-green-100 text-green-800' :
                            app.status === 'booked' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'canceled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {app.status.toUpperCase()}
                          </span>
                          {activeTab === 'pending' && (
                            <button onClick={() => { setSelectedAppointment(app); setModalMode('approve'); setModalOpen(true); }}
                              className="text-gabay-blue hover:text-gabay-navy transition" title="Approve">
                              <SquarePen size={24} />
                            </button>
                          )}
                          {activeTab === 'approved' && (
                            <button onClick={() => {
                              navigate('/staff/reschedule', { state: { appointment: app } });
                            }}
                              className="text-gabay-blue hover:text-gabay-navy transition" title="Reschedule">
                              <SquarePen size={24} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="font-poppins text-sm text-gray-700 mb-2"><span className="font-semibold">Reason:</span> {app.reason}</p>
                        {activeTab === 'pending' && (
                          <p className="font-poppins text-sm text-gray-700 mb-2"><span className="font-semibold">Requested Dates:</span> {app.requestedStartDate} - {app.requestedEndDate}</p>
                        )}
                        {(activeTab === 'approved' || activeTab === 'canceled') && (
                          <>
                            <p className="font-poppins text-sm text-gray-700 mb-2">
                              <span className="font-semibold">Appointment Date:</span>{' '}
                              {app.appointmentDate
                                ? typeof app.appointmentDate === 'string'
                                  ? app.appointmentDate
                                  : app.appointmentDate.toLocaleDateString()
                                : 'Not set'}
                            </p>
                            <p className="font-poppins text-sm text-gray-700 mb-2">
                              <span className="font-semibold">Batch:</span> {app.batch}
                            </p>
                          </>
                        )}
                        {app.assignedDoctor && <p className="font-poppins text-sm text-gray-700"><span className="font-semibold">Doctor:</span> {app.assignedDoctor}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center py-5 bg-gray-50 border-t border-gray-200 mt-6">
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 text-gabay-blue hover:bg-gray-200 rounded-full disabled:text-gray-300 disabled:bg-transparent disabled:cursor-not-allowed focus:outline-none transition-all"><ChevronLeft size={20} /></button>
              <span className="mx-6 font-poppins text-sm text-gabay-navy font-semibold">Page {currentPage} of {totalPages}</span>
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 text-gabay-blue hover:bg-gray-200 rounded-full disabled:text-gray-300 disabled:bg-transparent disabled:cursor-not-allowed focus:outline-none transition-all"><ChevronRight size={20} /></button>
            </div>
          )}
        </>
      )}

      {/* Book Schedule Form */}
      {activeTab === 'book' && (
        <BookScheduleForm onSuccess={() => {}} />
      )}

      {/* Approve Modal */}
      {selectedAppointment && modalMode === 'approve' && (
        <ApproveScheduleModal isOpen={modalOpen} onClose={() => setModalOpen(false)} appointment={selectedAppointment} onApprove={handleApprove} />
      )}
    </div>
  );
}