import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  PlusCircle, Search, ChevronLeft, ChevronRight, 
  ChevronDown, CalendarDays, ChevronRight as ChevronRightIcon, 
  Check, Trash2 
} from 'lucide-react';
import Button from '../../components/button';
import SchedulePickerModal from '../../components/SchedulePickerModal';
import AddDoctorModal from '../../components/AddDoctorModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

export default function StaffDoctors() {
  const navigate = useNavigate();
  const { doctors: initialDoctors = [] } = useOutletContext() || {};

  const [doctors, setDoctors] = useState(initialDoctors);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

  const itemsPerPage = 10;

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, doctors]);

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const entryStart = filteredDoctors.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const entryEnd = Math.min(currentPage * itemsPerPage, filteredDoctors.length);

  const handleAddNewDoctor = (newDoctorData) => {
    const newDoctor = {
      id: Date.now(),
      ...newDoctorData,
      schedule: 'TBD',
      timePeriod: 'TBD',
      availability: 'Available'
    };
    setDoctors([newDoctor, ...doctors]);
  };

  const handleUpdateSchedule = (id, newDays, newTime) => {
    setDoctors(prev => prev.map(doc => 
      doc.id === id ? { ...doc, schedule: newDays, timePeriod: newTime } : doc
    ));
  };

  const handleStatusChange = (id, newStatus) => {
    setDoctors(prev => prev.map(doc => 
      doc.id === id ? { ...doc, availability: newStatus } : doc
    ));
    setActiveDropdown(null);
  };

  const handleDeleteClick = (doctor) => {
    setDoctorToDelete(doctor);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (doctorToDelete) {
      setDoctors(prev => prev.filter(doc => doc.id !== doctorToDelete.id));
      setIsDeleteModalOpen(false);
      setDoctorToDelete(null);
    }
  };

  const StatusPicker = ({ doctor }) => {
    const isOpen = activeDropdown === doctor.id;
    const isAvailable = doctor.availability === 'Available';
    
    return (
      <div className="relative inline-block text-left">
        <button 
          onClick={() => setActiveDropdown(isOpen ? null : doctor.id)}
          className={`inline-flex items-center gap-2 px-4 py-1 text-xs font-bold text-white rounded-full shadow-sm transition-all active:scale-95 ${
            isAvailable ? "bg-gabay-teal" : "bg-red-500"
          }`}
        >
          {doctor.availability.toUpperCase()}
          <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
            <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white shadow-xl ring-1 ring-black ring-opacity-5 z-20 overflow-hidden border border-gray-100">
              <div className="py-1">
                <button onClick={() => handleStatusChange(doctor.id, 'Available')} className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <span className="flex items-center gap-2 font-poppins"><div className="w-2 h-2 rounded-full bg-gabay-teal"></div>Available</span>
                  {isAvailable && <Check size={14} className="text-gabay-teal" />}
                </button>
                <button onClick={() => handleStatusChange(doctor.id, 'Not Available')} className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <span className="flex items-center gap-2 font-poppins"><div className="w-2 h-2 rounded-full bg-red-500"></div>Not Available</span>
                  {!isAvailable && <Check size={14} className="text-red-500" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gabay-blue px-6 py-6 mb-4 font-poppins">
        <div className="text-left">
          <h1 className="font-montserrat text-3xl font-bold text-white tracking-tight">Doctor List & Schedule</h1>
          <p className="text-sm text-white/90 mt-1">
            Doctors &gt; <span className="text-white font-medium underline underline-offset-4">Doctor List</span>
          </p>
        </div>
        <button 
          onClick={() => navigate('/staff/doctor-schedule')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-gabay-blue font-bold text-sm rounded-lg hover:bg-teal-50 transition-all shadow-lg active:scale-95 group"
        >
          View Doctor Schedules
          <ChevronRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="w-full pb-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-visible font-poppins">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <h2 className="font-montserrat text-2xl font-bold text-gabay-blue text-left">Doctor List</h2>
              <Button 
                variant="teal" 
                type="button" 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2"
              >
                <PlusCircle size={18} /> ADD DOCTOR
              </Button>
            </div>
            <div className="relative">
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                placeholder="Search doctor..." 
                className="border border-gray-300 rounded-md px-3 py-1.5 w-64 pr-10 focus:ring-2 focus:ring-gabay-teal/20 outline-none text-sm" 
              />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className='sticky top-0 z-10 bg-gray-50'>
                <tr className="text-gabay-teal font-bold border-b border-gray-100 text-sm uppercase tracking-wider">
                  <th className="px-6 py-5">Name</th>
                  <th className="px-6 py-5">Schedule</th>
                  <th className="px-6 py-5">Time Period</th>
                  <th className="px-6 py-5">Department</th>
                  <th className="px-6 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="font-semibold text-gabay-navy">{doctor.name}</div>
                        <div className="text-[10px] text-gray-400 font-normal uppercase">{doctor.role}</div>
                    </td>
                    <td className="px-6 py-4 text-gabay-navy font-medium">{doctor.schedule}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gabay-navy font-medium">
                        {doctor.timePeriod}
                        <button 
                          onClick={() => { setSelectedDoctor(doctor); setIsScheduleModalOpen(true); }}
                          className="p-1 text-gabay-teal opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        >
                          <CalendarDays size={20} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gabay-navy">{doctor.department}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <StatusPicker doctor={doctor} />
                        <button 
                          onClick={() => handleDeleteClick(doctor)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PERSONNEL STYLE PAGINATION FOOTER */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <p className="text-[10px] md:text-xs text-gray-400 font-poppins font-medium">
              Showing {entryStart} - {entryEnd} of {filteredDoctors.length} entries
            </p>
          </div>
        </div>
      </div>

      <SchedulePickerModal 
        isOpen={isScheduleModalOpen} 
        onClose={() => setIsScheduleModalOpen(false)} 
        doctor={selectedDoctor} 
        onSave={handleUpdateSchedule}
      />

      <AddDoctorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddNewDoctor}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        doctorName={doctorToDelete?.name}
      />
    </div>
  );
}