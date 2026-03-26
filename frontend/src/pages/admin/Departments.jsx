import React, { useState, useMemo } from 'react';
import { 
  Search, Download, Funnel, Plus, 
  ChevronDown, ChevronUp, Edit3, Trash2, Eye 
} from 'lucide-react';

// --- MOCK DATA (15 Entries) ---
const rawDeptData = [
  { id: 1, name: 'Cardiology', type: 'Specialty', staffCount: 12, docCount: 5, status: 'Enabled', head: 'Dr. Santos', floor: '2nd Floor' },
  { id: 2, name: 'Pediatrics', type: 'General', staffCount: 20, docCount: 8, status: 'Enabled', head: 'Dr. Reyes', floor: '1st Floor' },
  { id: 3, name: 'Dermatology', type: 'Specialty', staffCount: 5, docCount: 2, status: 'Disabled', head: 'Dr. Gomez', floor: '3rd Floor' },
  { id: 4, name: 'Radiology', type: 'Specialty', staffCount: 15, docCount: 4, status: 'Enabled', head: 'Dr. Cruz', floor: 'Basement' },
  { id: 5, name: 'Emergency', type: 'General', staffCount: 45, docCount: 15, status: 'Enabled', head: 'Dr. Dalisay', floor: 'Ground Floor' },
  { id: 6, name: 'Obstetrics', type: 'General', staffCount: 18, docCount: 6, status: 'Enabled', head: 'Dr. Lim', floor: '2nd Floor' },
  { id: 7, name: 'Oncology', type: 'Specialty', staffCount: 10, docCount: 3, status: 'Enabled', head: 'Dr. Tan', floor: '4th Floor' },
  { id: 8, name: 'Neurology', type: 'Specialty', staffCount: 8, docCount: 3, status: 'Enabled', head: 'Dr. Garcia', floor: '3rd Floor' },
  { id: 9, name: 'General IM', type: 'General', staffCount: 25, docCount: 10, status: 'Enabled', head: 'Dr. Abad', floor: '1st Floor' },
  { id: 10, name: 'Orthopedics', type: 'Specialty', staffCount: 12, docCount: 4, status: 'Disabled', head: 'Dr. Sy', floor: '2nd Floor' },
  { id: 11, name: 'Psychiatry', type: 'Specialty', staffCount: 6, docCount: 2, status: 'Enabled', head: 'Dr. Lopez', floor: '4th Floor' },
  { id: 12, name: 'Urology', type: 'Specialty', staffCount: 7, docCount: 2, status: 'Enabled', head: 'Dr. Villa', floor: '3rd Floor' },
  { id: 13, name: 'Dental', type: 'General', staffCount: 10, docCount: 5, status: 'Enabled', head: 'Dr. Kho', floor: 'Ground Floor' },
  { id: 14, name: 'OPD', type: 'General', staffCount: 30, docCount: 12, status: 'Enabled', head: 'Dr. Pineda', floor: '1st Floor' },
  { id: 15, name: 'Laboratory', type: 'General', staffCount: 22, docCount: 0, status: 'Enabled', head: 'Dr. Rivera', floor: 'Basement' },
];

export default function Departments() {
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState(null); // To track which row is open
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filters, setFilters] = useState({ sortKey: 'name', sortOrder: 'asc', types: [] });

  const itemsPerPage = 10;

  // --- FILTER & SORT LOGIC ---
  const filteredData = useMemo(() => {
    let result = rawDeptData.filter(dept => 
      dept.name.toLowerCase().includes(search.toLowerCase())
    );

    if (filters.types.length > 0) result = result.filter(d => filters.types.includes(d.type));

    result.sort((a, b) => {
      const valA = a[filters.sortKey].toString();
      const valB = b[filters.sortKey].toString();
      const comparison = valA.localeCompare(valB, undefined, { numeric: true });
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [search, filters]);

  const pagedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-gabay-blue">Departments List</h1>
        <p className="text-xs md:text-sm font-poppins text-gray-500">Main Menu &gt; Departments</p>
      </div>

      <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
        <div className="flex flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96">
            <input 
              type="text" placeholder="Search Departments..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg font-poppins outline-none focus:ring-2 focus:ring-gabay-blue/20"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button className="whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full bg-gabay-teal text-white font-medium text-sm hover:bg-opacity-90 transition shadow-sm">
            <Plus size={16} /> <span className="hidden sm:inline">New Department</span><span className="sm:hidden">Add</span>
          </button>
        </div>

        <div className="flex flex-row gap-2 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none flex items-center gap-2 px-3 py-2 bg-white border border-gabay-teal text-gabay-teal rounded-lg text-sm font-medium">
            <Download size={16} /> <span className="hidden md:inline">Export as CSV</span><span className="md:hidden">Export</span>
          </button>
          <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gabay-teal text-gabay-teal rounded-lg text-sm font-medium">
            <Funnel size={16} /> Filter ({filters.types.length})
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gabay-blue text-white font-poppins uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Department Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Staff Count</th>
                <th className="px-6 py-4">Doctors</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-poppins text-sm">
              {pagedData.map((dept) => (
                <React.Fragment key={dept.id}>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gabay-blue">{dept.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${
                        dept.type === 'Specialty' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'
                      }`}>
                        {dept.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{dept.staffCount} Staff</td>
                    <td className="px-6 py-4 text-gray-600">{dept.docCount} Docs</td>
                    <td className="px-6 py-4 text-center">
                      {/* TOGGLE SWITCH UI */}
                      <button className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${dept.status === 'Enabled' ? 'bg-gabay-green' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${dept.status === 'Enabled' ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button className="text-gabay-teal hover:bg-teal-50 p-1.5 rounded-lg"><Edit3 size={16}/></button>
                        <button 
                          onClick={() => setExpandedRow(expandedRow === dept.id ? null : dept.id)}
                          className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg"
                        >
                          {expandedRow === dept.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* EXPANDABLE SECTION */}
                  {expandedRow === dept.id && (
                    <tr className="bg-gray-50/50">
                      <td colSpan="6" className="px-10 py-4 border-l-4 border-gabay-teal">
                        <div className="grid grid-cols-3 gap-8">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Department Head</p>
                            <p className="text-gray-700 font-medium">{dept.head}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Location</p>
                            <p className="text-gray-700 font-medium">{dept.floor}</p>
                          </div>
                          <div className="text-right">
                            <button className="text-xs text-gabay-blue underline font-medium">View Assigned Personnel</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}