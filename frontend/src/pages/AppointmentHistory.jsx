import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Calendar, User as UserIcon, Building2, FileText, Activity } from 'lucide-react';
import { AuthContext } from '../authContext'; 

export default function AppointmentHistory() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext); 
  
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // --- PAGINATION LOGIC ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 
  
  const totalPages = Math.max(1, Math.ceil(appointments.length / itemsPerPage));
  const currentAppointments = appointments.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userEmail = payload.sub;

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/history/${userEmail}`);
        if (response.ok) {
          const data = await response.json();
          setAppointments(data.appointments);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const closeModal = () => {
    setSelectedAppointment(null);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-[calc(100vh-64px)] px-4 py-12 bg-gray-50 animate-in fade-in duration-500 relative">
      
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gabay-blue p-5 flex items-center justify-between">
              <h2 className="text-white font-montserrat font-bold text-xl">Reservation Details</h2>
              <button onClick={closeModal} className="text-white/80 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-8 font-poppins space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="text-gabay-teal" size={20} />
                  <span className="font-semibold text-gabay-navy">Date</span>
                </div>
                <span className="font-medium">{selectedAppointment.date}</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Building2 className="text-gabay-teal" size={20} />
                  <span className="font-semibold text-gabay-navy">Department</span>
                </div>
                <div className="text-right">
                  <span className="font-medium block">{selectedAppointment.department}</span>
                  <span className="text-xs text-gray-400 font-bold uppercase">{selectedAppointment.type} OPD</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <UserIcon className="text-gabay-teal" size={20} />
                  <span className="font-semibold text-gabay-navy">Doctor</span>
                </div>
                <span className="font-medium">{selectedAppointment.doctor}</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Activity className="text-gabay-teal" size={20} />
                  <span className="font-semibold text-gabay-navy">Status</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedAppointment.status.includes('Pending') ? 'bg-yellow-100 text-yellow-700' : 
                  selectedAppointment.status.includes('Approved') ? 'bg-green-100 text-green-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedAppointment.status}
                </span>
              </div>

              <div>
                <span className="font-semibold text-gabay-navy mb-2 block">Reason for Booking</span>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-700 text-sm leading-relaxed">
                  {selectedAppointment.reason}
                </div>
              </div>

              {selectedAppointment.referral && (
                <div className="bg-teal-50 p-4 rounded-lg flex items-center justify-between border border-teal-100">
                  <div className="flex items-center gap-2 text-gabay-teal">
                    <FileText size={20} />
                    <span className="font-semibold text-sm">Medical Referral Attached</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={closeModal}
                className="px-6 py-2 bg-gabay-teal hover:bg-teal-600 text-white font-bold rounded-full transition-colors text-sm uppercase tracking-wide shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="w-full max-w-5xl">
        <h1 className="font-montserrat font-bold text-[40px] text-gabay-teal text-left mb-2">
          Appointment History
        </h1>
        <p className="font-poppins text-gray-600 text-left text-lg mb-12">
          See your previous appointments from GABAY here
        </p>

        <div className="bg-white shadow-lg overflow-hidden border border-gabay-blue rounded-t-xl">
          <div className="overflow-x-auto min-h-[300px]">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-4 border-gabay-teal border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex justify-center items-center h-64 font-poppins text-gray-500">
                You have no appointment records yet.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gabay-blue border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-poppins font-semibold text-white">Date</th>
                    <th className="px-6 py-4 font-poppins font-semibold text-white">Doctor</th>
                    <th className="px-6 py-4 font-poppins font-semibold text-white">Department</th>
                    <th className="px-6 py-4 font-poppins font-semibold text-white">Status</th>
                    <th className="px-6 py-4 font-poppins text-white"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentAppointments.map((appt, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/50 transition duration-200">
                      <td className="px-6 py-5 font-poppins text-gabay-navy font-medium">{appt.date}</td>
                      <td className="px-6 py-5 font-poppins text-gray-600">{appt.doctor}</td>
                      <td className="px-6 py-5 font-poppins text-gray-600">
                        {appt.department}
                        <span className="block text-[10px] text-gabay-teal mt-1 uppercase font-bold tracking-wider">{appt.type} OPD</span>
                      </td>
                      <td className="px-6 py-5 font-poppins">
                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          appt.status.includes('Pending') ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                          appt.status.includes('Approved') ? 'bg-green-100 text-green-700 border border-green-200' : 
                          'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleViewDetails(appt)}
                          className="font-poppins text-gabay-blue hover:text-gabay-teal hover:underline font-semibold text-sm transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!isLoading && appointments.length > 0 && (
            <div className="flex items-center justify-center py-5 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gabay-blue hover:bg-gray-200 rounded-full disabled:text-gray-300 disabled:bg-transparent disabled:cursor-not-allowed focus:outline-none transition-all"
                aria-label="Previous page"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="mx-6 font-poppins text-gabay-navy text-sm font-semibold tracking-wide">
                PAGE {currentPage} OF {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gabay-blue hover:bg-gray-200 rounded-full disabled:text-gray-300 disabled:bg-transparent disabled:cursor-not-allowed focus:outline-none transition-all"
                aria-label="Next page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}