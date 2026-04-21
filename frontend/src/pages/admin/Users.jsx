import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import AddPatient from '../../components/AddPatient';
import DisableModal from '../../components/DisableModal';
import ConfirmationModal from '../../components/ConfirmModal';
import { 
  Search, Download, Funnel, Plus, 
  Edit3, MinusCircle, ChevronLeft, ChevronRight, CircleCheckBig
} from 'lucide-react';
// import { highlightMatch, exportToCSV } from '../../utils/transformers';

// --- SAMPLE DATA ---
const rawUsersData = [
  { id: '26-154928', name: 'Juan Dela Cruz', email: 'juandelacruz@gmail.com', gender: 'Male', phone: '09191234567', status: 'Active', joinDate: '02/25/2026' },
  { id: '26-123456', name: 'Maria Dela Cruz', email: 'maria.delacruz@gmail.com', gender: 'Female', phone: '09191234567', status: 'Offline', joinDate: '03/10/2026' },
  { id: '26-177354', name: 'Rachel Mawac', email: 'rachelmawac@gmail.com', gender: 'Female', phone: '09194255324', status: 'Inactive', joinDate: '03/07/2026' },
  { id: '26-177355', name: 'Roberto Garcia', email: 'roberto.g@gmail.com', gender: 'Male', phone: '09171234455', status: 'Deactivated', joinDate: '01/30/2026' },
  { id: '26-188293', name: 'Elena Santos', email: 'elena.santos@gmail.com', gender: 'Female', phone: '09182223344', status: 'Active', joinDate: '03/12/2026' },
  { id: '26-199203', name: 'Ricardo Dalisay', email: 'carding@gmail.com', gender: 'Male', phone: '09159998877', status: 'Active', joinDate: '02/15/2026' },
  { id: '26-200394', name: 'Liza Soberano', email: 'liza.s@gmail.com', gender: 'Female', phone: '09164445566', status: 'Offline', joinDate: '03/01/2026' },
  { id: '26-211485', name: 'Bong Go', email: 'bong.go@gmail.com', gender: 'Male', phone: '09190001122', status: 'Inactive', joinDate: '03/20/2026' },
  { id: '26-222576', name: 'Sara Duterte', email: 'sara.d@gmail.com', gender: 'Female', phone: '09187776655', status: 'Active', joinDate: '02/28/2026' },
  { id: '26-233667', name: 'Vico Sotto', email: 'vico.p@gmail.com', gender: 'Male', phone: '09173332211', status: 'Active', joinDate: '03/05/2026' },
];

export default function Users() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // //EDIT: Moved data to state to allow automatic updates on the table (Requirement 6)
  const [usersData, setUsersData] = useState(rawUsersData);

  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setIsPatientModalOpen(true);
  };

  // //EDIT: Updated handleEditClick to split name and map phone/id/dob (Requirements 1, 2, 3, 4)
  const handleEditClick = (user) => {
    const nameParts = user.name.split(' ');
    const fName = nameParts[0] || '';
    const lName = nameParts.slice(1).join(' ') || '';

    const mappedData = {
      ...user,
      firstName: fName,
      lastName: lName,
      contactNumber: user.phone, // Requirement 4
      hospitalNumber: user.id,   // Requirement 3: Passed as 'hospitalNumber' so AddPatient can set field to View Only
      // //INSTRUCTION FOR BACKEND: Connect the 'dob' field from the database to this object
      dob: user.dob || ''        // Requirement 2
    };

    setSelectedPatient(mappedData);
    setIsPatientModalOpen(true);
  };

  // //EDIT: Added handleSaveUser to reflect changes on the table automatically (Requirement 5 & 6)
  // //INSTRUCTION FOR BACKEND: This function should be triggered after a successful PUT/PATCH API call.
  const handleSaveUser = (updatedData) => {
    setUsersData((prev) => 
      prev.map((u) => 
        u.id === updatedData.hospitalNumber 
          ? { 
              ...u, 
              ...updatedData, 
              name: `${updatedData.firstName} ${updatedData.lastName}`.trim(),
              phone: updatedData.contactNumber,
              // dob is automatically included via ...updatedData
            } 
          : u
      )
    );
  };

  const handleDisableClick = (user) => {
    setSelectedPatient(user);
    setIsDisableModalOpen(true);
  };

  const handleReactivateClick = (user) => {
    setSelectedPatient(user);
    setIsReactivateModalOpen(true);
  };

  const handleDisableConfirm = (reason) => {
    // //EDIT: Dynamic status update to Deactivated
    setUsersData(prev => prev.map(u => u.id === selectedPatient.id ? { ...u, status: 'Deactivated' } : u));
    toast.success(`${selectedPatient.name}'s account has been deactivated.`);
  };

  const handleReactivateConfirm = () => {
    // //EDIT: Dynamic status update to Offline (Restored)
    setUsersData(prev => prev.map(u => u.id === selectedPatient.id ? { ...u, status: 'Offline' } : u));
    toast.success(`${selectedPatient.name}'s account has been reactivated.`);
    setIsReactivateModalOpen(false);
  };
  
  const [filters, setFilters] = useState({
    sortKey: 'name',
    sortOrder: 'asc',
    emailFilter: '', 
    genders: ['Male', 'Female'], 
    statuses: ['Active', 'Offline', 'Inactive', 'Deactivated']
  });

  const itemsPerPage = 10;

  // //EDIT: useMemo now tracks usersData state instead of rawUsersData
  const filteredData = useMemo(() => {
    let result = usersData.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.id.toLowerCase().includes(search.toLowerCase())
    );

    if (filters.genders.length > 0) result = result.filter(i => filters.genders.includes(i.gender));
    if (filters.statuses.length > 0) result = result.filter(i => filters.statuses.includes(i.status));

    result.sort((a, b) => {
      let valA = a[filters.sortKey];
      let valB = b[filters.sortKey];
      const comparison = valA.localeCompare(valB, undefined, { 
        numeric: true, 
        sensitivity: 'base' 
      });
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [search, filters, usersData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pagedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const entryStart = (currentPage - 1) * itemsPerPage + 1;
  const entryEnd = Math.min(currentPage * itemsPerPage, filteredData.length);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(pagedData.map(i => i.id));
    else setSelectedIds([]);
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-gabay-blue tracking-tight">Users List</h1>
        <p className="text-xs md:text-sm font-poppins text-gray-500">Main Menu &gt; Users</p>
      </div>

      <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
        <div className="flex flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96">
            <input 
              type="text" 
              value={search}
              onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}}
              placeholder="Search Users..." 
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg font-poppins outline-none focus:ring-2 focus:ring-gabay-blue/20"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <button 
            onClick={handleAddPatient}
            className="whitespace-nowrap flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-gabay-teal text-white font-medium font-poppins text-sm hover:bg-opacity-90 transition shadow-sm active:scale-95"
          >
            <Plus size={16} /> 
            <span className="hidden sm:inline"> New Patient</span>
            <span className="sm:hidden">Patient</span>
          </button>
        </div>

        <div className="flex flex-row gap-2 w-full lg:w-auto">
          <button onClick={() => exportToCSV(filteredData, 'Users_List.csv')}
          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gabay-teal text-gabay-teal rounded-lg text-sm font-poppins font-medium hover:bg-teal-50 transition-colors">
            <Download size={16} /> Export as CSV
          </button>
          
          <div className="relative flex-1 lg:flex-none">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gabay-teal text-gabay-teal rounded-lg text-sm font-poppins font-medium hover:bg-teal-50 transition-colors"
            >
              <Funnel size={16} /> Filter ({filters.genders.length + filters.statuses.length})
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] p-5 space-y-5">
                <div>
                  <p className="text-[10px] font-bold font-poppins text-gray-400 uppercase tracking-widest mb-3">Sort By</p>
                  <div className="flex flex-col gap-2">
                    <select value={filters.sortKey} className="w-full text-sm font-poppins border rounded-lg p-2 outline-none" onChange={(e) => setFilters({...filters, sortKey: e.target.value})}>
                      <option value="name">Name</option>
                      <option value="id">Hospital Number</option>
                      <option value="joinDate">Date Joined</option>
                    </select>
                    <select value={filters.sortOrder} className="w-full text-sm font-poppins border rounded-lg p-2 outline-none" onChange={(e) => setFilters({...filters, sortOrder: e.target.value})}>
                      <option value="asc">Ascending (A-Z / Oldest)</option>
                      <option value="desc">Descending (Z-A / Newest)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold font-poppins text-gray-400 uppercase tracking-widest mb-3">Gender</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Male', 'Female'].map(g => (
                      <label key={g} className="flex items-center gap-2 text-sm text-gray-600 font-poppins cursor-pointer">
                        <input type="checkbox" checked={filters.genders.includes(g)} onChange={(e) => {
                          const newGenders = e.target.checked ? [...filters.genders, g] : filters.genders.filter(x => x !== g);
                          setFilters({...filters, genders: newGenders});
                        }} className="w-4 h-4 rounded accent-gabay-blue" /> {g}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold font-poppins text-gray-400 uppercase tracking-widest mb-3">Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Active', 'Offline', 'Inactive', 'Deactivated'].map(s => (
                      <label key={s} className="flex items-center gap-2 text-sm text-gray-600 font-poppins cursor-pointer">
                        <input type="checkbox" checked={filters.statuses.includes(s)} onChange={(e) => {
                          const newStatus = e.target.checked ? [...filters.statuses, s] : filters.statuses.filter(x => x !== s);
                          setFilters({...filters, statuses: newStatus});
                        }} className="w-4 h-4 rounded accent-gabay-blue" /> {s}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-2"> 
                  <button onClick={() => setFilters({ sortKey: 'name', sortOrder: 'asc', genders: [], statuses: [] })} className="flex-1 py-2 text-xs border border-gray-400 rounded-lg font-poppins font-medium text-gray-400 hover:text-red-500">Reset All</button>
                  <button onClick={() => setShowFilterDropdown(false)} className="flex-1 py-2 bg-gabay-blue text-white rounded-lg text-xs font-poppins font-medium hover:bg-opacity-90">Apply</button>
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
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === pagedData.length && pagedData.length > 0} className="w-4 h-4" />
                </th>
                <th className="px-4 py-4 text-[12px] md:text-xs font-bold uppercase tracking-wider">Hospital Number</th>
                <th className="px-4 py-4 text-[12px] md:text-xs font-bold uppercase tracking-wider">Name</th>
                <th className="px-4 py-4 text-[12px] md:text-xs font-bold uppercase tracking-wider">Email</th>
                <th className="px-4 py-4 text-[12px] md:text-xs font-bold uppercase tracking-wider text-center">Gender</th>
                <th className="px-4 py-4 text-[12px] md:text-xs font-bold uppercase tracking-wider">Phone Number</th>
                <th className="px-4 py-4 text-[12px] md:text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-[12px] md:text-xs font-bold uppercase tracking-wider">Join Date</th>
                <th className="px-4 py-4 text-[12px] md:text-xs font-bold uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedData.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(user.id) ? 'bg-blue-50/50' : ''}`} onClick={() => toggleSelection(user.id)}>
                  <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="w-4 h-4 rounded accent-gabay-blue" checked={selectedIds.includes(user.id)} onChange={() => toggleSelection(user.id)} />
                  </td>
                  <td className="px-4 py-4 text-xs md:text-sm font-poppins text-gray-700 font-medium">{user.id}</td>
                  <td className="px-4 py-4 text-xs md:text-sm font-poppins text-gabay-blue font-medium">{user.name}</td>
                  <td className="px-4 py-4 text-xs md:text-sm font-poppins text-gray-700">{user.email}</td>
                  <td className="px-4 py-4 text-xs md:text-sm font-poppins text-gray-700 text-center">{user.gender}</td>
                  <td className="px-4 py-4 text-xs md:text-sm font-poppins text-gray-700">{user.phone}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-[12px] uppercase font-poppins font-medium text-gray-700">
                      <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-gabay-green' : user.status === 'Deactivated' ? 'bg-gabay-orange' : user.status === 'Offline' ? 'bg-gray-400' : 'bg-gabay-red'}`} />
                      {user.status}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs md:text-sm font-poppins text-gray-700">{user.joinDate}</td>
                  <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEditClick(user)} className="p-1.5 text-gabay-teal rounded-lg transition-colors hover:scale-110" title="Edit"><Edit3 size={18}/></button>
                      
                      {user.status === 'Deactivated' ? (
                        <button onClick={() => handleReactivateClick(user)} className="p-1.5 text-gabay-green rounded-lg transition-colors hover:scale-110" title="Reactivate"><CircleCheckBig size={18}/></button>
                      ) : (
                        <button onClick={() => handleDisableClick(user)} className="p-1.5 text-red-400 rounded-lg transition-colors hover:scale-110" title="Deactivate"><MinusCircle size={18}/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="disabled:opacity-30 p-1 rounded-lg hover:bg-white transition-all"><ChevronLeft size={20}/></button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-poppins font-bold transition-all ${currentPage === i + 1 ? 'bg-gabay-blue text-white shadow-sm' : 'text-gray-500 hover:bg-white'}`}>{i + 1}</button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="disabled:opacity-30 p-1 rounded-lg hover:bg-white transition-all"><ChevronRight size={20}/></button>
          </div>
          <p className="text-[10px] md:text-xs text-gray-400 font-poppins font-medium">Showing {entryStart} - {entryEnd} of {filteredData.length} entries</p>
        </div>
      </div>

      <AddPatient 
        isOpen={isPatientModalOpen} 
        onClose={() => setIsPatientModalOpen(false)} 
        editData={selectedPatient} 
        // //EDIT: Passed handleSaveUser function (Requirement 5)
        onSave={handleSaveUser}
      />

      <DisableModal 
        isOpen={isDisableModalOpen}
        onClose={() => setIsDisableModalOpen(false)}
        title={`Deactivate ${selectedPatient?.name}`}
        message="This action will restrict the user from booking appointments and logging into the portal."
        onConfirm={handleDisableConfirm}
      />

      <ConfirmationModal 
        isOpen={isReactivateModalOpen}
        onClose={() => setIsReactivateModalOpen(false)}
        onConfirm={handleReactivateConfirm}
        title="Reactivate Patient"
        message={`Are you sure you want to restore access for ${selectedPatient?.name}?`}
        type="info"
      />
    </div>
  );
}