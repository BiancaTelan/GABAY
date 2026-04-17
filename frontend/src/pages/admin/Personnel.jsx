import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Download, Funnel, Plus, 
  Edit3, MinusCircle, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Check 
} from 'lucide-react';
import GeneralForm from '../GeneralForm';
import AddPersonnel from '../../components/AddPersonnel';

// --- SAMPLE DATA ---
const rawData = [
  { id: 'DOC001', role: 'DOCTOR', name: 'Zack Arias', dept: 'General IM', isSpecialty: false, schedule: 'M, W, F', email: 'zack@gmail.com', status: 'Active' },
  { id: 'STF001', role: 'STAFF', name: 'Ana Batungbakal', dept: 'General IM', isSpecialty: false, schedule: 'T, TH', email: 'ana@gmail.com', status: 'Offline' },
  { id: 'DOC002', role: 'DOCTOR', name: 'Bernice Castro', dept: 'Dermatology', isSpecialty: true, schedule: 'M, W, TH', email: 'bernice@gmail.com', status: 'Inactive' },
  { id: 'STF002', role: 'STAFF', name: 'Carlos Dala', dept: 'IM - Pulmonology', isSpecialty: true, schedule: 'W, F', email: 'carlos@gmail.com', status: 'Deactivated' },
  { id: 'ADM001', role: 'ADMIN', name: 'Dante Estacio', dept: 'N/A', isSpecialty: false, schedule: 'M, T, W', email: 'dante@gmail.com', status: 'Active' },
  { id: 'DOC003', role: 'DOCTOR', name: 'Elena Fajardo', dept: 'General IM', isSpecialty: false, schedule: 'F', email: 'elena@gmail.com', status: 'Active' },
  { id: 'STF003', role: 'STAFF', name: 'Gina Gomez', dept: 'Pediatrics', isSpecialty: true, schedule: 'M, T', email: 'gina@gmail.com', status: 'Active' },
  { id: 'DOC004', role: 'DOCTOR', name: 'Harvey Isip', dept: 'Cardiology', isSpecialty: true, schedule: 'W, TF', email: 'harvey@gmail.com', status: 'Offline' },
  { id: 'STF004', role: 'STAFF', name: 'Irene Javier', dept: 'General IM', isSpecialty: false, schedule: 'M-F', email: 'irene@gmail.com', status: 'Active' },
  { id: 'DOC005', role: 'DOCTOR', name: 'Jojo Kasilag', dept: 'Neurology', isSpecialty: true, schedule: 'T, TH, S', email: 'jojo@gmail.com', status: 'Inactive' },
  // ... PAGE 2
  { id: 'DOC006', role: 'DOCTOR', name: 'Michael Gomez', dept: 'Pediatrics', isSpecialty: false, schedule: 'F', email: 'michael@gmail.com', status: 'Deactivated' },
  { id: 'STF005', role: 'STAFF', name: 'Alex Simon', dept: 'Pediatrics', isSpecialty: true, schedule: 'M, T', email: 'alex@gmail.com', status: 'Inactive' },
  { id: 'DOC007', role: 'DOCTOR', name: 'Inigo Bautista', dept: 'Dermatology', isSpecialty: true, schedule: 'T, TH', email: 'inigo@gmail.com', status: 'Offline' },
  { id: 'ADM002', role: 'ADMIN', name: 'Rachel Mawac', dept: 'N/A', isSpecialty: false, schedule: 'M-F', email: 'rachel@gmail.com', status: 'Active' },
  { id: 'ADM003', role: 'ADMIN', name: 'Chelly Redondo', dept: 'N/A', isSpecialty: false, schedule: 'TH, F', email: 'chelly@gmail.com', status: 'Active' },
];

export default function Personnel() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);
  const handleOpenAddModal = () => {
    setSelectedPersonnel(null); 
    setIsModalOpen(true);       
  };
  
  const [filters, setFilters] = useState({
    sortKey: 'name', // 'name', 'id'
    sortOrder: 'asc',
    deptType: ['General', 'Specialty'],  
    roles: ['STAFF', 'DOCTOR', 'ADMIN'], 
    statuses: ['Active', 'Offline', 'Inactive', 'Deactivated']
  });

  const itemsPerPage = 10;

  // --- LOGIC: FILTERING & SORTING ---
  const filteredData = useMemo(() => {
    let result = rawData.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.id.toLowerCase().includes(search.toLowerCase())
    );

    // Apply Filters
    if (filters.roles.length > 0) result = result.filter(i => filters.roles.includes(i.role));
    if (filters.statuses.length > 0) result = result.filter(i => filters.statuses.includes(i.status));
    if (filters.deptType.length > 0) {
      result = result.filter(i => {
        const type = i.isSpecialty ? 'Specialty' : 'General';
        return filters.deptType.includes(type);
      });
    }

    // SORTING
    result.sort((a, b) => {
      const valA = a[filters.sortKey];
      const valB = b[filters.sortKey];

      // numeric: true = DOC001 vs DOC010 
      const comparison = valA.localeCompare(valB, undefined, { 
        numeric: true, 
        sensitivity: 'base' 
      });

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [search, filters]);

  // --- LOGIC: PAGINATION ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pagedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const entryStart = (currentPage - 1) * itemsPerPage + 1;
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
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-gabay-blue">Personnel List</h1>
        <p className="text-xs md:text-sm font-poppins text-gray-500">Main Menu &gt; Personnel</p>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
        <div className="flex flex-row items-center gap-3 w-full lg:w-auto">
        <div className="relative w-full lg:w-96">
          <input 
            type="text" 
            value={search}
            onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}}
            placeholder="Search Personnel..." 
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg font-poppins outline-none focus:ring-2 focus:ring-gabay-blue/20"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-gabay-teal text-white font-medium font-poppins text-sm hover:bg-gabay-teal2 transition shadow-md shadow-teal-100 active:scale-95"
        >
          <Plus size={16} /> 
          <span className="hidden sm:inline">New Personnel</span>
          <span className="sm:hidden">Personnel</span> 
        </button>
        </div>

        <div className="flex flex-row gap-2 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gabay-teal text-gabay-teal rounded-lg text-sm font-poppins font-medium hover:bg-teal-50 transition-colors">
            <Download size={16} /> Export as CSV
          </button>
          
          {/* MULTI-FILTER DROPDOWN */}
          <div className="relative flex-1 lg:flex-none">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gabay-teal text-gabay-teal rounded-lg text-sm font-poppins font-medium hover:bg-teal-50 transition-colors"
            >
              <Funnel size={16} /> Filter ({filters.roles.length + filters.statuses.length + filters.deptType.length})
            </button>
            
            {showFilterDropdown && (
  <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] p-5 space-y-5 max-h-[500px] overflow-y-auto scrollbar-thin">
    
          {/* SORTING SECTION */}
          <div>
            <p className="text-[10px] font-bold font-poppins text-gray-400 uppercase tracking-widest mb-3">Sort By</p>
            <div className="space-y-3">
              {/* FIRST DROPDOWN */}
              <div>
                <select 
                  value={filters.sortKey}
                  className="w-full text-sm font-poppins border border-gray-200 rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-gabay-blue/10"
                  onChange={(e) => setFilters({...filters, sortKey: e.target.value})}
                >
                  <option value="name">Name</option>
                  <option value="id">Employee ID</option>
                </select>
              </div>

              {/* SECOND DROPDOWN */}
              <div>
                <select 
                  value={filters.sortOrder}
                  className="w-full text-sm font-poppins border border-gray-200 rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-gabay-blue/10"
                  onChange={(e) => setFilters({...filters, sortOrder: e.target.value})}
                >
                  <option value="asc">Ascending (A-Z / 0-9)</option>
                  <option value="desc">Descending (Z-A / 9-0)</option>
                </select>
              </div>
            </div>
          </div>

          {/* DEPARTMENT */}
          <div>
            <p className="text-[10px] font-bold font-poppins text-gray-400 uppercase tracking-widest mb-3">Department Type</p>
            <div className="grid grid-cols-2 gap-2">
              {['General', 'Specialty'].map(type => (
                <label key={type} className="flex items-center gap-2 text-sm font-poppins cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded accent-gabay-blue"
                    checked={filters.deptType.includes(type)}
                    onChange={(e) => {
                      const newTypes = e.target.checked ? [...filters.deptType, type] : filters.deptType.filter(x => x !== type);
                      setFilters({...filters, deptType: newTypes});
                    }}
                  /> 
                  <span className="text-gray-600 font-poppins group-hover:text-gabay-blue transition-colors">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ROLES */}
          <div>
            <p className="text-[10px] font-bold font-poppins text-gray-400 uppercase tracking-widest mb-3">Role</p>
            <div className="grid grid-cols-2 gap-2">
              {['DOCTOR', 'STAFF', 'ADMIN'].map(r => (
                <label key={r} className="flex items-center gap-2 text-sm cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded accent-gabay-blue"
                    checked={filters.roles.includes(r)}
                    onChange={(e) => {
                      const newRoles = e.target.checked ? [...filters.roles, r] : filters.roles.filter(x => x !== r);
                      setFilters({...filters, roles: newRoles});
                    }}
                  /> 
                  <span className="text-gray-600 font-poppins group-hover:text-gabay-blue transition-colors">{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* STATUS SECTION */}
          <div>
            <p className="text-[10px] font-poppins font-bold text-gray-400 uppercase tracking-widest mb-3">Status</p>
            <div className="grid grid-cols-2 gap-2">
              {['Active', 'Offline', 'Inactive', 'Deactivated'].map(s => (
                <label key={s} className="flex items-center gap-2 text-sm cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded accent-gabay-blue"
                    checked={filters.statuses.includes(s)}
                    onChange={(e) => {
                      const newStatus = e.target.checked ? [...filters.statuses, s] : filters.statuses.filter(x => x !== s);
                      setFilters({...filters, statuses: newStatus});
                    }}
                  /> 
                  <span className="text-gray-600 font-poppins group-hover:text-gabay-blue transition-colors">{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button 
              onClick={() => setFilters({ sortKey: 'name', sortOrder: 'asc', deptType: [], roles: [], statuses: [] })}
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

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Native swipe container*/}
        <div className="overflow-x-auto cursor-default">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-gabay-blue font-poppins text-white select-none">
              <tr>
                <th className="px-4 py-4 text-center">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedIds.length === pagedData.length && pagedData.length > 0}
                    className="w-4 h-4 bg-gabay-blue"
                  />
                </th>
                <th className="px-4 py-4 text-[12px] md:text-xs font-poppins font-bold uppercase tracking-wider">Employee ID</th>
                <th className="px-4 py-4 text-[12px] md:text-xs font-poppins font-bold uppercase tracking-wider">Role</th>
                <th className="px-4 py-4 text-[12px] md:text-xs font-poppins font-bold uppercase tracking-wider">Name</th>
                <th className="px-4 py-4 text-[12px] md:text-xs font-poppins font-bold uppercase tracking-wider">Department</th>
                <th className="px-4 py-4 text-[12px] md:text-xs font-poppins font-bold uppercase tracking-wider">Schedule</th>
                <th className="px-4 py-4 text-[12px] md:text-xs font-poppins font-bold uppercase tracking-wider">Email</th>
                <th className="px-4 py-4 text-[12px] md:text-xs font-poppins font-bold uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-[12px] md:text-xs font-poppins font-bold uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedData.map((person) => (
                <tr 
                  key={person.id} 
                  className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(person.id) ? 'bg-blue-50/50' : ''}`}
                  onClick={() => toggleSelection(person.id)}
                >
                  <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(person.id)}
                      onChange={() => toggleSelection(person.id)}
                      className="w-4 h-4 bg-gabay-blue"
                    />
                  </td>
                  <td className="px-4 py-4 text-xs md:text-sm font-poppins text-gray-700 font-medium">{person.id}</td>
                  <td className="px-4 py-4">
                     <span className={`px-3 py-0.5 rounded-full text-[12px] md:text-[11px] font-poppins font-bold ${
                       person.role === 'DOCTOR' ? 'bg-orange-50 text-gabay-orange border border-orange-400' : 
                       person.role === 'ADMIN' ? 'bg-blue-50 text-blue-600 border border-blue-500' : 'bg-teal-50 text-teal-600 border border-teal-500'
                     }`}>
                       {person.role}
                     </span>
                  </td>
                  <td className="px-4 py-4 text-xs font-poppins md:text-sm text-gabay-blue font-medium">{person.name}</td>
                  <td className="px-4 py-4 text-xs font-poppins md:text-sm text-gray-700">{person.dept}</td>
                  <td className="px-4 py-4 text-xs font-poppins md:text-sm text-gray-700">{person.schedule}</td>
                  <td className="px-4 py-4 text-xs font-poppins md:text-sm text-gray-500">{person.email}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-[11px] uppercase md:text-[12px] font-poppins font-medium text-gray-700">
                      <div className={`w-2 h-2 rounded-full ${
                        person.status === 'Active' ? 'bg-gabay-green' : 
                        person.status === 'Deactivated' ? 'bg-gabay-orange' :
                        person.status === 'Offline' ? 'bg-gray-outline' : 'bg-gabay-red'
                      }`} />
                      {person.status}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 text-gabay-teal hover:bg-teal-50 rounded-lg transition-colors"><Edit3 size={18}/></button>
                      <button className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><MinusCircle size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGE RESULTS */}
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
              disabled={currentPage === totalPages}
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
      <AddPersonnel 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editData={selectedPersonnel} 
      />
    </div>
  );
}