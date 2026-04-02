import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Download, Funnel, ChevronLeft, ChevronRight, 
  ChevronDown, ChevronUp, Server, Activity, AlertCircle, Database 
} from 'lucide-react';

// --- MOCK DATA ---
const rawSystemData = [
  { id: 1, date: '04/02/2026', time: '12:40:26 PM', type: 'Performance', module: 'Slow loading', priority: 'HIGH', description: 'Slow performance detected due to high memory usage in the main thread.', actions: 'Optimize database queries and clear cache.' },
  { id: 2, date: '04/02/2026', time: '9:23:55 AM', type: 'Security', module: 'DatabaseFirewall', priority: 'CRITICAL', description: 'Vulnerabilities found in firewall. Security is at high risk of SQL injection.', actions: 'Update firewall rules and rotate API keys.' },
  { id: 3, date: '04/01/2026', time: '3:12:28 PM', type: 'Memory', module: 'ServerProcesses', priority: 'MEDIUM', description: 'High memory usage detected (75%). System processes are slowing down.', actions: 'Restart secondary worker nodes.' },
  { id: 4, date: '03/31/2026', time: '11:36:08 AM', type: 'Storage', module: 'BackupSystem', priority: 'LOW', description: 'Last backup was 12HRS ago. Perform backup now to avoid losing new data.', actions: 'Backup and sync new data to update database.' },
  { id: 5, date: '03/31/2026', time: '10:58:41 AM', type: 'Report', module: 'WebsiteCrashes', priority: 'MEDIUM', description: 'User reported an error on the landing page.', actions: 'Review client-side error logs in Sentry.' },
];

const priorityStyles = {
  CRITICAL: 'bg-red-100 text-red-500 border-red-200',
  HIGH: 'bg-orange-50 text-orange-400 border-orange-200',
  MEDIUM: 'bg-teal-50 text-gabay-teal border-teal-100',
  LOW: 'bg-green-50 text-green-500 border-green-100',
};

export default function SystemLogs() {
  // --- STATES ---
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [latency, setLatency] = useState(124);
  
  const [filters, setFilters] = useState({
    sortKey: 'date',
    sortOrder: 'desc',
    priorities: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    issueType: 'All'
  });

  const itemsPerPage = 10;

  // --- 1. LIVE SYSTEM LOGIC ---
  useEffect(() => {
    /* BACKEND NOTE: In production, replace this interval with a WebSocket listener (Socket.io) 
       to receive real-time heartbeat pulses from the server and storage metrics. */
    const interval = setInterval(() => {
      setLatency(prev => prev + (Math.floor(Math.random() * 11) - 5)); // Simulate fluctuation
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const criticalErrorCount = rawSystemData.filter(i => i.priority === 'CRITICAL').length;

 // --- LOGIC: FILTERING & SORTING ---
const filteredData = useMemo(() => {
  let result = rawSystemData.filter(item => 
    item.type.toLowerCase().includes(search.toLowerCase()) || 
    item.module.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase()) ||
    item.date.includes(search)
  );

  if (filters.priorities.length > 0) {
    result = result.filter(i => filters.priorities.includes(i.priority));
  }

  if (filters.issueType !== 'All') {
    result = result.filter(i => i.type === filters.issueType);
  }

  result.sort((a, b) => {
    let valA, valB;

    if (filters.sortKey === 'date') {
      valA = new Date(`${a.date} ${a.time}`);
      valB = new Date(`${b.date} ${b.time}`);
    } else if (filters.sortKey === 'priority') {
      const priorityWeight = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      valA = priorityWeight[a.priority];
      valB = priorityWeight[b.priority];
    }

    if (filters.sortOrder === 'asc') {
      return valA > valB ? 1 : -1;
    } else {
      return valA < valB ? 1 : -1;
    }
  });

  return result;
}, [search, filters]);

  // --- PAGINATION ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pagedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const entryStart = filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const entryEnd = Math.min(currentPage * itemsPerPage, filteredData.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-gabay-blue">System Logs</h1>
        <p className="text-xs md:text-sm font-poppins text-gray-500">System &gt; System Logs</p>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
        <div className="relative w-full lg:w-96">
          <input 
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search System Logs..." 
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg font-poppins outline-none focus:ring-2 focus:ring-gabay-blue/20"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
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
              <Funnel size={16} /> 
              Filter ({filters.priorities.length + (filters.issueType !== 'All' ? 1 : 0)})
            </button>

            {/* DROPDOWN MENU */}
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] p-5 space-y-5 max-h-[500px] overflow-y-auto">
                
                {/* 1. SORT BY SECTION */}
                <div>
                  <p className="text-[10px] font-bold font-poppins text-gray-400 uppercase tracking-widest mb-3">Sort By</p>
                  <div className="space-y-3">
                    <div>
                      <select 
                        value={filters.sortKey}
                        className="w-full text-sm font-poppins border border-gray-200 rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-gabay-blue/10"
                        onChange={(e) => setFilters({...filters, sortKey: e.target.value})}
                      >
                        <option value="date">Date</option>
                        <option value="priority">Priority Level</option>
                      </select>
                    </div>
                    <div>
                      <select 
                        value={filters.sortOrder}
                        className="w-full text-sm font-poppins border border-gray-200 rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-gabay-blue/10"
                        onChange={(e) => setFilters({...filters, sortOrder: e.target.value})}
                      >
                        <option value="desc">By Newest / High Priority</option>
                        <option value="asc">By Oldest / Low Priority</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. ISSUE TYPE SECTION */}
                <div>
                  <p className="text-[10px] font-bold font-poppins text-gray-400 uppercase tracking-widest mb-3">Issue Type</p>
                  <select 
                    value={filters.issueType}
                    className="w-full text-sm font-poppins border border-gray-200 rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-gabay-blue/10"
                    onChange={(e) => setFilters({...filters, issueType: e.target.value})}
                  >
                    <option value="All">All Types</option>
                    <option value="Performance">Performance</option>
                    <option value="Security">Security</option>
                    <option value="Storage">Storage</option>
                    <option value="Memory">Memory</option>
                    <option value="Report">Report</option>
                  </select>
                </div>

                {/* 3. PRIORITY LEVEL SECTION */}
                <div>
                  <p className="text-[10px] font-bold font-poppins text-gray-400 uppercase tracking-widest mb-3">Priority Level</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => (
                      <label key={p} className="flex items-center gap-2 text-sm font-poppins text-gray-600 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={filters.priorities.includes(p)}
                          onChange={(e) => {
                            const newP = e.target.checked 
                              ? [...filters.priorities, p] 
                              : filters.priorities.filter(x => x !== p);
                            setFilters({...filters, priorities: newP});
                          }}
                          className="w-4 h-4 rounded accent-gabay-blue"
                        /> 
                        <span className="group-hover:text-gabay-blue transition-colors">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="pt-2 flex gap-2">
                  <button 
                    onClick={() => setFilters({ sortKey: 'date', sortOrder: 'desc', priorities: [], issueType: 'All' })} 
                    className="flex-1 py-2 text-xs font-poppins font-medium border border-gray-400 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Reset All
                  </button>
                  <button 
                    onClick={() => setShowFilterDropdown(false)} 
                    className="flex-1 py-2 bg-gabay-blue text-white rounded-lg text-xs font-poppins font-medium shadow-md hover:bg-opacity-90 transition-all"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard icon={<Server className="text-green-500"/>} label="Server Status" value={criticalErrorCount > 3 ? "DOWNED" : "NORMAL"} />
        <StatusCard icon={<Activity className="text-blue-500"/>} label="System Latency" value={`${latency}ms`} />
        <StatusCard icon={<AlertCircle className="text-red-500"/>} label="Critical Errors" value={`${criticalErrorCount} ERRORS`} color="text-red-500" />
        <StatusCard icon={<Database className="text-gabay-teal"/>} label="Storage Space" value="38% (15.7 GB/41.3GB)" />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-gabay-blue text-white font-poppins text-[12px] uppercase">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Issue Type</th>
                <th className="px-6 py-4">Affected Module</th>
                <th className="px-6 py-4 text-center">Priority Level</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-4 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-poppins">
              {pagedData.map((log) => (
                <React.Fragment key={log.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-gabay-blue">{log.date}<br/><span className="text-gray-400 font-normal">{log.time}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-700">{log.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 italic">{log.module}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-6 py-0.5 rounded-full text-[10px] font-bold border ${priorityStyles[log.priority]}`}>{log.priority}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[300px]">{log.description}</td>
                    <td className="px-4 py-4">
                      <button onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                        {expandedId === log.id ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                      </button>
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr className="bg-gray-50/50">
                      <td colSpan="6" className="px-10 py-4 border-l-4 border-gabay-blue">
                        <p className="text-sm text-gray-700 mb-2">{log.description}</p>
                        <p className="text-[11px] font-bold text-gabay-teal uppercase">Recommended Actions: <span className="font-medium normal-case text-gray-600">{log.actions}</span></p>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {/* PAGINATION (Same style as Departments) */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded hover:bg-white disabled:opacity-30"><ChevronLeft size={20}/></button>
            <button className="w-8 h-8 rounded bg-gabay-blue text-white text-xs font-bold">{currentPage}</button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded hover:bg-white disabled:opacity-30"><ChevronRight size={20}/></button>
          </div>
          <p className="text-[10px] md:text-xs text-gray-400">Showing {entryStart} - {entryEnd} of {filteredData.length} entries</p>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ icon, label, value, color = "text-gray-800" }) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{label}</p>
        <p className={`text-sm font-bold ${color}`}>{value}</p>
      </div>
    </div>
  );
}