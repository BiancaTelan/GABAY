import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, CalendarClock } from 'lucide-react';

export default function StaffNoShows() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample Data
  const [noShowData, setNoShowData] = useState([
    { id: 1, dateTime: "10/08/2025 11:20 AM", patientName: "Juan Dela Cruz", status: "No Show" },
    { id: 2, dateTime: "10/07/2025 09:30 AM", patientName: "Maria Santos", status: "No Show" },
    { id: 3, dateTime: "10/07/2025 08:45 AM", patientName: "Jose Rizal", status: "No Show" },
    { id: 4, dateTime: "10/06/2025 12:30 AM", patientName: "Antonio Luna", status: "Rescheduled" },
  ]);

  useEffect(() => {
    if (location.state?.newNoShow) {
      const incoming = location.state.newNoShow;
      setNoShowData(prev => {
        const alreadyExists = prev.some(entry => entry.id === incoming.id);
        if (alreadyExists) return prev; 
        const newEntry = {
          id: incoming.id,
          dateTime: incoming.time || new Date().toLocaleString(),
          patientName: incoming.name,
          status: "No Show"
        };
        return [newEntry, ...prev];
      });
      navigate(location.pathname, { replace: true, state: {} });
    }

    if (location.state?.updatedId && location.state?.newStatus) {
      const { updatedId, newStatus } = location.state;
      setNoShowData(prev => prev.map(item =>
        String(item.id) === String(updatedId) ? { ...item, status: newStatus } : item
      ));
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const filteredData = useMemo(() => {
    return noShowData.filter(item => 
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, noShowData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pagedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const entryStart = filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const entryEnd = Math.min(currentPage * itemsPerPage, filteredData.length);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gabay-blue px-6 py-6 mb-4 font-poppins text-white">
        <div>
          <h1 className="font-montserrat text-3xl font-bold tracking-tight">Appointments No Show</h1>
          <p className="text-sm text-white/90 mt-1">
            Dashboard &gt; <span className="text-white font-medium underline underline-offset-4">No Show Records</span>
          </p>
        </div>
        <button 
          onClick={() => navigate('/staff/dashboard')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-gabay-blue font-bold text-sm rounded-lg hover:bg-teal-50 transition-all shadow-lg active:scale-95 group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Return to Dashboard
        </button>
      </div>

      <div className="w-full pb-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-visible font-poppins">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4 border-b border-gray-100">
            <h2 className="font-montserrat text-2xl font-bold text-gabay-blue">No Show Logs</h2>
            <div className="relative">
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                placeholder="Search patient name..." 
                className="border border-gray-300 rounded-md px-3 py-1.5 w-64 pr-10 focus:ring-2 focus:ring-gabay-teal/20 outline-none text-sm" 
              />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className='sticky top-0 z-10 bg-gray-50'>
                <tr className="text-gabay-teal font-bold border-b border-gray-100 text-sm uppercase tracking-wider">
                  <th className="px-6 py-5">Date & Time</th>
                  <th className="px-6 py-5">Patient Name</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-6 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pagedData.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-gabay-navy">{row.dateTime}</td>
                    <td className="px-6 py-4 font-bold text-gabay-navy">{row.patientName}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold text-white shadow-sm transition-all min-w-[110px] text-center uppercase tracking-tighter ${
                          row.status === 'No Show' ? 'bg-gray-400' : 'bg-gabay-teal'
                        }`}>
                          {row.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {row.status === 'No Show' ? (
                          <button 
                            onClick={() => {
                              const isMorning = row.dateTime.toLowerCase().includes('am');
                              navigate('/staff/reschedule', { 
                                state: { 
                                  patientData: {
                                    id: row.id,
                                    patientName: row.patientName,
                                    hospitalNumber: row.id,
                                    previousDate: row.dateTime,
                                    batch: isMorning ? 'Morning' : 'Afternoon',
                                    source: 'no-show' 
                                  } 
                                } 
                              });
                            }}
                            className="flex items-center gap-1 text-gabay-blue hover:text-gabay-teal font-bold text-xs transition-colors group"
                          >
                            <CalendarClock size={16} className="group-hover:scale-110 transition-transform" />
                            RESCHEDULE
                          </button>
                        ) : (
                          <span className="text-gabay-teal/60 text-xs font-bold italic flex items-center gap-1">
                            ✓ PROCESSED
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {pagedData.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={20} />
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
                className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <p className="text-[10px] md:text-xs text-gray-400 font-poppins font-medium">
              Showing {entryStart} - {entryEnd} of {filteredData.length} entries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}