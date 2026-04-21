import React, { useState, useMemo } from 'react';
import { 
  Search, Download, Funnel, Plus, 
  Edit3, MinusCircle, ChevronLeft, ChevronRight, ChevronDown, 
  Check, CircleCheckBig
} from 'lucide-react';
import toast from 'react-hot-toast'; 
import AddDepartment from '../../components/AddDepartment';
import DisableModal from '../../components/DisableModal';
import ConfirmationModal from '../../components/ConfirmModal';
// import { highlightMatch, exportToCSV } from '../../utils/transformers';

const rawDeptData = [
  { id: 'GEN001', name: 'General IM', type: 'GENERAL', doctors: 11, staff: 5, usedSlots: 7, totalSlots: 25, status: 'Active' },
  { id: 'SPEC001', name: 'IM - Cardiology', type: 'SPECIALTY', doctors: 5, staff: 2, usedSlots: 3, totalSlots: 25, status: 'Active' },
  { id: 'GEN002', name: 'Dermatology', type: 'GENERAL', doctors: 8, staff: 4, usedSlots: 8, totalSlots: 25, status: 'Active' },
  { id: 'SPEC002', name: 'IM - Pulmonology', type: 'SPECIALTY', doctors: 9, staff: 4, usedSlots: 12, totalSlots: 25, status: 'Deactivated' },
  { id: 'SPEC003', name: 'Rheumatology', type: 'SPECIALTY', doctors: 7, staff: 3, usedSlots: 2, totalSlots: 25, status: 'Active' },
  { id: 'GEN003', name: 'Pediatrics', type: 'GENERAL', doctors: 15, staff: 6, usedSlots: 20, totalSlots: 25, status: 'Active' },
  { id: 'SPEC004', name: 'Neurology', type: 'SPECIALTY', doctors: 4, staff: 2, usedSlots: 5, totalSlots: 25, status: 'Active' },
  { id: 'GEN004', name: 'Obstetrics', type: 'GENERAL', doctors: 10, staff: 8, usedSlots: 15, totalSlots: 25, status: 'Active' },
  { id: 'SPEC005', name: 'Oncology', type: 'SPECIALTY', doctors: 6, staff: 3, usedSlots: 1, totalSlots: 25, status: 'Active' },
  { id: 'GEN005', name: 'Orthopedics', type: 'GENERAL', doctors: 12, staff: 5, usedSlots: 10, totalSlots: 25, status: 'Active' },
];

export default function Departments() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  const [departments, setDepartments] = useState(rawDeptData);

  const [filters, setFilters] = useState({
    sortKey: 'name', 
    sortOrder: 'asc',
    deptType: ['GENERAL', 'SPECIALTY']
  });

  const itemsPerPage = 10;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  
  const handleAddNew = () => {
    setSelectedDept(null);
    setIsAddModalOpen(true);
  };

  const handleEditClick = (dept) => {
    const mappedData = {
      ...dept,
      departmentName: dept.name,
      departmentType: dept.type,
      staffCount: dept.staff,
      doctorCount: dept.doctors,
      slotCapacity: dept.totalSlots
    };
    setSelectedDept(mappedData);
    setIsAddModalOpen(true);
  };

  // //EDIT: Function to handle local state update after saving in the modal
  // //INSTRUCTION FOR BACKEND: Once the API is integrated, this function should be called 
  // ONLY after a successful response from your PUT/PATCH endpoint.
  const handleSaveDepartment = (updatedData) => {
    setDepartments((prev) => 
      prev.map((d) => 
        d.id === updatedData.id 
          ? { 
              ...d, 
              name: updatedData.departmentName, 
              type: updatedData.departmentType,
              staff: updatedData.staffCount,
              doctors: updatedData.doctorCount,
              totalSlots: updatedData.slotCapacity
            } 
          : d
      )
    );
  };

  const filteredData = useMemo(() => {
    let result = departments.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.id.toLowerCase().includes(search.toLowerCase())
    );

    if (filters.deptType.length > 0) {
      result = result.filter(i => filters.deptType.includes(i.type));
    }

    result.sort((a, b) => {
      const valA = a[filters.sortKey];
      const valB = b[filters.sortKey];
      const comparison = typeof valA === 'string' 
        ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' })
        : valA - valB;
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [search, filters, departments]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pagedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const entryStart = (currentPage - 1) * itemsPerPage + 1;
  const entryEnd = Math.min(currentPage * itemsPerPage, filteredData.length);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(pagedData.filter(i => i.status !== 'Deactivated').map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelection = (id, status) => {
    if (status === 'Deactivated') return;
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDisableClick = (dept) => {
    setSelectedDept(dept);
    setIsDisableModalOpen(true);
  };

  const handleReactivateClick = (dept) => {
    setSelectedDept(dept);
    setIsReactivateModalOpen(true);
  };

  const handleDisableConfirm = (reason) => {
    setDepartments(prev => prev.map(d => d.id === selectedDept.id ? { ...d, status: 'Deactivated' } : d));
    toast.success(`${selectedDept.name} disabled: ${reason}`);
  };

  const handleReactivateConfirm = () => {
    setDepartments(prev => prev.map(d => d.id === selectedDept.id ? { ...d, status: 'Active' } : d));
    toast.success(`${selectedDept.name} has been reactivated.`);
    setIsReactivateModalOpen(false);
  };

  const getDeactivatedStyle = (status) => status === 'Deactivated' ? 'opacity-40 grayscale pointer-events-none' : '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-gabay-blue tracking-tight">Departments Management</h1>
        <p className="text-xs md:text-sm font-poppins text-gray-500">Main Menu &gt; Departments</p>
      </div>

      <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
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
          <button 
            onClick={handleAddNew}
            className="whitespace-nowrap flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-gabay-teal text-white font-medium font-poppins text-sm hover:bg-opacity-90 transition shadow-sm active:scale-95"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Department</span> 
            <span className="sm:hidden">Department</span> 
          </button>
        </div>

        <div className="flex flex-row gap-2 w-full lg:w-auto">
          <button onClick={() => exportToCSV(filteredData, 'Departments_List.csv')}
          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gabay-teal text-gabay-teal rounded-lg text-sm font-poppins font-medium hover:bg-teal-50 transition-colors">
            <Download size={16} /> Export as CSV
          </button>
          
          <div className="relative flex-1 lg:flex-none">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gabay-teal text-gabay-teal rounded-lg text-sm font-poppins font-medium hover:bg-teal-50 transition-colors"
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
                      <option value="status">Deactivated</option>
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
                      <label key={type} className="flex items-center text-gray-600 gap-2 text-sm font-poppins cursor-pointer">
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
                  <button onClick={() => setFilters({ sortKey: 'name', sortOrder: 'asc', deptType: [] })} 
                  className="flex-1 py-2 text-xs font-poppins font-medium border border-gray-400 rounded-lg text-gray-400 hover:text-red-500 transition-colors">Reset All</button>
                  <button onClick={() => setShowFilterDropdown(false)} 
                  className="flex-1 py-2 bg-gabay-blue text-white rounded-lg text-xs font-poppins font-medium shadow-md hover:bg-opacity-90 transition-all">Apply</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-gabay-blue font-poppins text-white select-none">
              <tr>
                <th className="px-4 py-4 text-center">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedIds.length === pagedData.filter(i => i.status !== 'Deactivated').length && pagedData.length > 0}
                    className="w-4 h-4 bg-gabay-blue"
                  />
                </th>
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
                <tr 
                  key={dept.id} 
                  className={`transition-colors ${dept.status === 'Deactivated' ? 'bg-gray-50/50' : 'hover:bg-gray-50 cursor-pointer'}`} 
                  onClick={() => toggleSelection(dept.id, dept.status)}
                >
                  <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      disabled={dept.status === 'Deactivated'}
                      checked={selectedIds.includes(dept.id)} 
                      onChange={() => toggleSelection(dept.id, dept.status)} 
                      className="w-4 h-4 bg-gabay-blue disabled:opacity-30" 
                    />
                  </td>
                  
                  <td className={`px-4 py-4 text-sm text-gray-700 font-medium font-poppins ${getDeactivatedStyle(dept.status)}`}>{dept.id}</td>
                  <td className={`px-4 py-4 text-sm font-poppins font-medium text-gabay-blue ${getDeactivatedStyle(dept.status)}`}>{dept.name}</td>
                  <td className={`px-4 py-4 text-center ${getDeactivatedStyle(dept.status)}`}>
                    <span className={`px-3 py-0.5 rounded-full text-[11px] font-poppins font-bold tracking-wider ${
                      dept.type === 'SPECIALTY' ? 'bg-orange-50 text-gabay-orange border border-orange-400' : 'bg-blue-50 text-blue-600 border border-blue-500'
                    }`}>
                      {dept.type}
                    </span>
                  </td>
                  <td className={`px-4 py-4 text-center text-sm text-gray-700 font-poppins ${getDeactivatedStyle(dept.status)}`}>{dept.doctors}</td>
                  <td className={`px-4 py-4 text-center text-sm text-gray-700 font-poppins ${getDeactivatedStyle(dept.status)}`}>{dept.staff}</td>
                  <td className={`px-4 py-4 text-center text-sm font-poppins font-semibold text-gray-600 ${getDeactivatedStyle(dept.status)}`}>
                    {dept.usedSlots}/{dept.totalSlots}
                  </td>

                  <td className="px-4 py-4 relative z-10" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center gap-3">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleEditClick(dept); 
                      }}
                      className="text-gabay-teal hover:scale-110 transition-transform"
                      title="Edit"
                    >
                      <Edit3 size={18}/>
                    </button>
                    
                    {dept.status === 'Deactivated' ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReactivateClick(dept);
                        }}
                        className="text-gabay-green hover:scale-110 transition-transform"
                        title="Reactivate"
                      >
                        <CircleCheckBig size={18}/>
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleDisableClick(dept); 
                        }}
                        className="text-red-400 hover:scale-110 transition-transform"
                        title="Disable"
                      >
                        <MinusCircle size={18}/>
                      </button>
                    )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded hover:bg-white disabled:opacity-30"><ChevronLeft size={20}/></button>
              <button className="w-8 h-8 rounded bg-gabay-blue text-white text-xs font-bold">1</button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded hover:bg-white disabled:opacity-30"><ChevronRight size={20}/></button>
           </div>
           <p className="text-[10px] md:text-xs text-gray-400 font-poppins">Showing {entryStart} - {entryEnd} of {filteredData.length} entries</p>
        </div>
      </div>

      {/* //EDIT: Passed onSave function to AddDepartment component */}
      <AddDepartment 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        editData={selectedDept} 
        onSave={handleSaveDepartment} 
      />
      <DisableModal isOpen={isDisableModalOpen} onClose={() => setIsDisableModalOpen(false)} title={`Disable ${selectedDept?.name}`} message={`Are you sure you want to deactivate the ${selectedDept?.name} department?`} onConfirm={handleDisableConfirm} />
      <ConfirmationModal isOpen={isReactivateModalOpen} onClose={() => setIsReactivateModalOpen(false)} onConfirm={handleReactivateConfirm} title="Reactivate Department" message={`Are you sure you want to reactivate the ${selectedDept?.name} department?`} type="info" />
    </div>
  );
}