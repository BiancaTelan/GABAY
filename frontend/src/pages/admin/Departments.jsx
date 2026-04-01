import React, { useState, useMemo } from 'react';
import { 
  Search, Download, Funnel, Plus, 
  Edit3, MinusCircle, ChevronLeft, ChevronRight, ChevronDown 
} from 'lucide-react';

// --- MOCK DATA (10 Rows) ---
const rawDeptData = [
  { id: 'GEN001', name: 'General IM', type: 'GENERAL', doctors: 11, staff: 5, usedSlots: 7, totalSlots: 25 },
  { id: 'SPEC001', name: 'IM - Cardiology', type: 'SPECIALTY', doctors: 5, staff: 2, usedSlots: 3, totalSlots: 25 },
  { id: 'GEN002', name: 'Dermatology', type: 'GENERAL', doctors: 8, staff: 4, usedSlots: 8, totalSlots: 25 },
  { id: 'SPEC002', name: 'IM - Pulmonology', type: 'SPECIALTY', doctors: 9, staff: 4, usedSlots: 12, totalSlots: 25 },
  { id: 'SPEC003', name: 'Rheumatology', type: 'SPECIALTY', doctors: 7, staff: 3, usedSlots: 2, totalSlots: 25 },
  { id: 'GEN003', name: 'Pediatrics', type: 'GENERAL', doctors: 15, staff: 6, usedSlots: 20, totalSlots: 25 },
  { id: 'SPEC004', name: 'Neurology', type: 'SPECIALTY', doctors: 4, staff: 2, usedSlots: 5, totalSlots: 25 },
  { id: 'GEN004', name: 'Obstetrics', type: 'GENERAL', doctors: 10, staff: 8, usedSlots: 15, totalSlots: 25 },
  { id: 'SPEC005', name: 'Oncology', type: 'SPECIALTY', doctors: 6, staff: 3, usedSlots: 1, totalSlots: 25 },
  { id: 'GEN005', name: 'Orthopedics', type: 'GENERAL', doctors: 12, staff: 5, usedSlots: 10, totalSlots: 25 },
];

export default function Departments() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  const [filters, setFilters] = useState({
    sortKey: 'name', // 'name', 'id', 'usedSlots'
    sortOrder: 'asc',
    deptType: ['GENERAL', 'SPECIALTY']
  });

  const itemsPerPage = 10;

  // --- LOGIC: FILTERING & SORTING ---
  const filteredData = useMemo(() => {
    let result = rawDeptData.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.id.toLowerCase().includes(search.toLowerCase())
    );

    // Apply Checkbox Filters
    if (filters.deptType.length > 0) {
      result = result.filter(i => filters.deptType.includes(i.type));
    }

    // SORTING
    result.sort((a, b) => {
      const valA = a[filters.sortKey];
      const valB = b[filters.sortKey];

      // Handle numerical sort for slots or IDs, string sort for name
      const comparison = typeof valA === 'string' 
        ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' })
        : valA - valB;

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [search, filters]);

  // --- PAGINATION ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pagedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const entryStart = (currentPage - 1) * itemsPerPage + 1;
  const entryEnd = Math.min(currentPage * itemsPerPage, filteredData.length);

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-gabay-blue tracking-tight">Departments Management</h1>
        <p className="text-xs md:text-sm font-poppins text-gray-500">Main Menu &gt; Departments</p>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
        {/* Left Side: Search + Add */}
        <div className="flex flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96">
            <input 
              type="text" 
              value={search}
              onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}}
              placeholder="Search Departments..." 
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg font-poppins outline-none focus:ring-2 focus:ring-gabay-blue/20"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button className="whitespace-nowrap flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-gabay-teal text-white font-medium font-poppins text-sm hover:bg-opacity-90 transition shadow-sm">
            <Plus size={16} /><span className="hidden sm:inline">New Department</span><span className="sm:hidden">Department</span> 
          </button>
        </div>

        {/* Right Side: Export + Filter */}
        <div className="flex flex-row gap-2 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gabay-teal text-gabay-teal rounded-lg text-sm font-poppins font-medium">
            <Download size={16} /> Export as CSV
          </button>
          
          <div className="relative flex-1 lg:flex-none">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gabay-teal text-gabay-teal rounded-lg text-sm font-poppins font-medium"
            >
              <Funnel size={16} /> Filter ({filters.deptType.length})
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] p-5 space-y-5">
                <div>
                  <p className="text-[10px] font-bold font-poppins text-gray-400 uppercase tracking-widest mb-3">Sort By</p>
                  <div className="space-y-3">
                    <select 
                      value={filters.sortKey}
                      className="w-full text-sm font-poppins border rounded-lg p-2 outline-none"
                      onChange={(e) => setFilters({...filters, sortKey: e.target.value})}
                    >
                      <option value="id">Department ID</option>
                      <option value="name">Department Name</option>
                      <option value="usedSlots">Slot Capacity</option>
                    </select>
                    <select 
                      value={filters.sortOrder}
                      className="w-full text-sm font-poppins border rounded-lg p-2 outline-none"
                      onChange={(e) => setFilters({...filters, sortOrder: e.target.value})}
                    >
                      <option value="asc">Ascending (A-Z / 0-9)</option>
                      <option value="desc">Descending (Z-A / 9-0)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold font-poppins text-gray-400 uppercase tracking-widest mb-3">Department Type</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['GENERAL', 'SPECIALTY'].map(type => (
                      <label key={type} className="flex items-center gap-2 text-sm font-poppins cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={filters.deptType.includes(type)}
                          onChange={(e) => {
                            const newTypes = e.target.checked ? [...filters.deptType, type] : filters.deptType.filter(x => x !== type);
                            setFilters({...filters, deptType: newTypes});
                          }}
                          className="w-4 h-4 rounded accent-gabay-blue"
                        /> {type}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button onClick={() => setFilters({ sortKey: 'name', sortOrder: 'asc', deptType: [] })} className="flex-1 py-2 text-xs text-gray-400 font-poppins">Reset</button>
                  <button onClick={() => setShowFilterDropdown(false)} className="flex-1 py-2 bg-gabay-blue text-white rounded-lg text-xs font-poppins">Apply</button>
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
                <th className="px-4 py-4 text-center"><input type="checkbox" className="w-4 h-4" /></th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">Department ID</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">Department Name</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center">Department Type</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center">Doctors</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center">Staff</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center">Slot Capacity</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedData.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50 transition-colors" onClick={() => toggleSelection(dept.id)}>
                  <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.includes(dept.id)} onChange={() => toggleSelection(dept.id)} className="w-4 h-4" />
                  </td>
                  <td className="px-4 py-4 text-sm font-poppins">{dept.id}</td>
                  <td className="px-4 py-4 text-sm font-poppins font-medium text-gabay-blue">{dept.name}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-3 py-0.5 rounded-full text-[11px] font-poppins font-bold tracking-wider ${
                      dept.type === 'SPECIALTY' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {dept.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-poppins">{dept.doctors}</td>
                  <td className="px-4 py-4 text-center text-sm font-poppins">{dept.staff}</td>
                  <td className="px-4 py-4 text-center text-sm font-poppins font-semibold text-gray-600">
                    {dept.usedSlots}/{dept.totalSlots}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-3">
                      <button className="text-gabay-teal hover:scale-110 transition-transform"><Edit3 size={18}/></button>
                      <button className="text-red-400 hover:scale-110 transition-transform"><MinusCircle size={18}/></button>
                      <button className="text-gray-400 hover:scale-110 transition-transform"><ChevronDown size={20}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded hover:bg-white disabled:opacity-30"><ChevronLeft size={20}/></button>
              <button className="w-8 h-8 rounded bg-gabay-blue text-white text-xs font-bold">1</button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded hover:bg-white disabled:opacity-30"><ChevronRight size={20}/></button>
           </div>
           <p className="text-[10px] md:text-xs text-gray-400 font-poppins">Showing {entryStart} - {entryEnd} of {filteredData.length} entries</p>
        </div>
      </div>
    </div>
  );
}