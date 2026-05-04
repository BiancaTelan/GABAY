import React, { useState, useMemo } from 'react';
import { 
  Search, Download, Funnel, ChevronLeft, ChevronRight 
} from 'lucide-react';

// --- SAMPLE DATA ---
const rawAuditData = [
  { id: 'LOG-001', date: '04/02/2026', time: '12:40:26 PM', user: 'Patient Name', role: 'PATIENT', action: 'LoggedIn', description: 'User has logged in', ip: '192.168.1.45' },
  { id: 'LOG-002', date: '04/02/2026', time: '9:23:55 AM', user: 'Staff Name', role: 'STAFF', action: 'UpdateSchedule', description: "Updated Dr. Silao's schedule", ip: '192.168.1.12' },
  { id: 'LOG-003', date: '04/01/2026', time: '3:12:28 PM', user: 'Staff Name', role: 'STAFF', action: 'ApproveReservation', description: 'Approved reservation of Juan Dela Cruz', ip: '192.168.1.47' },
  { id: 'LOG-004', date: '03/31/2026', time: '11:36:08 AM', user: 'Admin Name', role: 'ADMIN', action: 'DisableAccount', description: 'Disabled account of Coco Martin', ip: '192.168.1.17' },
  { id: 'LOG-005', date: '03/31/2026', time: '10:58:41 AM', user: 'System', role: 'SYSTEM', action: 'AutoBackup', description: 'Automatic backup complete', ip: 'Localhost' },
  { id: 'LOG-006', date: '03/30/2026', time: '2:15:10 PM', user: 'Dr. Smith', role: 'DOCTOR', action: 'AddPrescription', description: 'Added prescription for Patient ID 22', ip: '192.168.1.50' },
];

const roleStyles = {
  PATIENT: 'bg-purple-50 text-gabay-violet border border-violet-500',
  STAFF: 'bg-teal-50 text-teal-600 border border-teal-500',
  ADMIN: 'bg-blue-50 text-blue-600 border border-blue-500',
  DOCTOR: 'bg-orange-50 text-gabay-orange border border-orange-400',
  SYSTEM: 'bg-gray-50 text-gray-500 border border-gray-400',
};

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  const [filters, setFilters] = useState({
    sortKey: 'date', // Default sort by date
    sortOrder: 'desc', // Default to latest first
    roles: ['PATIENT', 'STAFF', 'DOCTOR', 'ADMIN', 'SYSTEM']
  });

  const itemsPerPage = 10;

  // --- LOGIC: FILTERING & SORTING ---
  const filteredData = useMemo(() => {
    let result = rawAuditData.filter(item => 
      item.user.toLowerCase().includes(search.toLowerCase()) || 
      item.ip.toLowerCase().includes(search.toLowerCase()) ||
      item.action.toLowerCase().includes(search.toLowerCase()) ||
      item.date.includes(search)
    );

    // Apply Role Checkboxes
    if (filters.roles.length > 0) {
      result = result.filter(i => filters.roles.includes(i.role));
    }

    // SORTING
    result.sort((a, b) => {
      let valA = a[filters.sortKey];
      let valB = b[filters.sortKey];

      // Special handling for Date/Time sorting
      if (filters.sortKey === 'date') {
        valA = new Date(`${a.date} ${a.time}`);
        valB = new Date(`${b.date} ${b.time}`);
        return filters.sortOrder === 'asc' ? valA - valB : valB - valA;
      }

      const comparison = valA.toString().localeCompare(valB.toString(), undefined, { numeric: true });
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [search, filters]);

  // --- PAGINATION LOGIC ---
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
        <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-gabay-blue tracking-tight">Audit Logs</h1>
        <p className="text-xs md:text-sm font-poppins text-gray-500">System &gt; Audit Logs</p>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
        <div className="flex flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96">
            <input 
              type="text" 
              value={search}
              onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}}
              placeholder="Search Audit Logs..." 
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg font-poppins outline-none focus:ring-2 focus:ring-gabay-blue/20"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <div className="flex flex-row gap-2 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gabay-teal text-gabay-teal rounded-lg text-sm font-poppins font-medium hover:bg-teal-50 transition-colors">
            <Download size={16} /> Export as CSV
          </button>
          
          <div className="relative flex-1 lg:flex-none">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gabay-teal text-gabay-teal rounded-lg text-sm font-poppins font-medium hover:bg-teal-50 transition-colors"
            >
              <Funnel size={16} /> Filter ({filters.roles.length})
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] p-5 space-y-5">
                <div>
                  <p className="text-[10px] font-bold font-poppins text-gray-400 uppercase tracking-widest mb-3">Sort By</p>
                  <select 
                    value={filters.sortOrder}
                    className="w-full text-sm font-poppins border rounded-lg p-2 outline-none"
                    onChange={(e) => setFilters({...filters, sortOrder: e.target.value})}
                  >
                    <option value="desc">By Newest</option>
                    <option value="asc">By Oldest</option>
                  </select>
                </div>

                <div>
                  <p className="text-[10px] font-bold font-poppins text-gray-400 uppercase tracking-widest mb-3">User Role</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['PATIENT', 'STAFF', 'DOCTOR', 'ADMIN', 'SYSTEM'].map(role => (
                      <label key={role} className="flex items-center gap-2 text-sm font-poppins text-gray-600 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={filters.roles.includes(role)}
                          onChange={(e) => {
                            const newRoles = e.target.checked ? [...filters.roles, role] : filters.roles.filter(x => x !== role);
                            setFilters({...filters, roles: newRoles});
                          }}
                          className="w-4 h-4 rounded accent-gabay-blue"
                        /> {role}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button onClick={() => setFilters({ sortKey: 'date', sortOrder: 'desc', roles: [] })} 
                  className="flex-1 py-2 text-xs font-poppins font-medium border border-gray-400 rounded-lg text-gray-400 hover:text-red-500 transition-colors">Reset</button>
                  <button onClick={() => setShowFilterDropdown(false)} 
                  className="flex-1 py-2 bg-gabay-blue text-white rounded-lg text-xs font-poppins font-medium shadow-md hover:bg-opacity-90">Apply</button>
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

                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">Date</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">User</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center">Role</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">Action</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">Description</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedData.map((log) => (
                <tr key={log.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(log.id) ? 'bg-blue-50/50' : ''}`} onClick={() => toggleSelection(log.id)}>
                  <td className="px-4 py-4 text-xs font-poppins text-gabay-blue font-medium">
                    {log.date} <br/> <span className="text-gray-400 font-normal">{log.time}</span>
                  </td>
                  <td className="px-4 py-4 text-sm font-poppins font-medium text-blue-600 cursor-pointer">{log.user}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-3 py-0.5 rounded-full text-[11px] font-poppins font-bold tracking-wider ${roleStyles[log.role]}`}>
                      {log.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 font-poppins">{log.action}</td>
                  <td className="px-4 py-4 text-sm text-gray-500 font-poppins italic">{log.description}</td>
                  <td className="px-4 py-4 text-sm text-gray-400 font-poppins">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 transition-all"><ChevronLeft size={20}/></button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} 
                  className={`w-8 h-8 rounded-lg text-xs font-poppins font-bold transition-all ${currentPage === i + 1 ? 'bg-gabay-blue text-white shadow-md' : 'hover:bg-white text-gray-500'}`}>
                  {i + 1}
                </button>
              ))}
              <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 transition-all"><ChevronRight size={20}/></button>
           </div>
           <p className="text-[10px] md:text-xs text-gray-400 font-poppins font-medium">Showing {entryStart} - {entryEnd} of {filteredData.length} entries</p>
        </div>
      </div>
    </div>
  );
}