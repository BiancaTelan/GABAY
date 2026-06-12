import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Calendar, User as UserIcon, Building2, FileText, Activity } from 'lucide-react';
import { AuthContext } from '../authContext'; 
import toast from 'react-hot-toast';

export default function AppointmentHistory() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext); 
  
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);
  
  // --- PAGINATION LOGIC ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 
  
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const totalPages = Math.max(1, Math.ceil(safeAppointments.length / itemsPerPage));
  const currentAppointments = safeAppointments.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // --- DATA FETCHING ---
  const fetchHistory = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userEmail = payload.sub;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/history/${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Failed to fetch appointment data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  // --- MODAL HANDLERS ---
  const handleViewDetails = (appointment) => setSelectedAppointment(appointment);
  const closeModal = () => setSelectedAppointment(null);

  const openCancelModal = (appointment) => {
    setAppointmentToCancel(appointment);
    setCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setAppointmentToCancel(null);
    setCancelReason("");
    setCancelModalOpen(false);
  };

  // --- CANCELLATION SUBMISSION ---
  const handleCancelSubmit = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation.");
      return;
    }
    
    setIsCanceling(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/${appointmentToCancel.id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: cancelReason })
      });
      
      if (response.ok) {
        toast.success("Appointment successfully canceled.");
        closeCancelModal();
        fetchHistory(); 
      } else {
        const data = await response.json();
        toast.error(data.detail || "Failed to cancel appointment.");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("An error occurred while canceling.");
    } finally {
      setIsCanceling(false);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getStatusStyle = (status) => {
    if (!status) return 'bg-gray-100 text-gray-700 border-gray-200';
    
    const s = status.toLowerCase();
    if (s.includes('pending')) return 'bg-gray-100 text-gray-600 font-medium border-gray-200';
    if (s.includes('approved')) return 'bg-green-500 text-white font-bold border-green-600 shadow-sm';
    if (s.includes('rescheduled')) return 'bg-yellow-100 text-yellow-800 font-bold border-yellow-300';
    if (s.includes('booked')) return 'bg-blue-100 text-blue-800 font-bold border-blue-300';
    if (s.includes('denied') || s.includes('cancel')) return 'bg-red-100 text-red-800 font-bold border-red-200';
    
    return 'bg-gray-100 text-gray-700 font-medium border-gray-200';
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-[calc(100vh-64px)] px-4 py-12 bg-gray-50 animate-in fade-in duration-500 relative">
      
      {/* --- DETAILS MODAL --- */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-gabay-blue p-5 flex items-center justify-between">
              <h2 className="text-white font-montserrat font-bold text-xl">Reservation Details</h2>
              <button onClick={closeModal} className="text-white/80 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
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
                  {selectedAppointment.type && (
                    <span className="text-xs text-gray-400 font-bold uppercase">{selectedAppointment.type} OPD</span>
                  )}
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
                <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider border ${getStatusStyle(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>

              <div>
                <span className="font-semibold text-gabay-navy mb-2 block">Reason for Booking</span>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-700 text-sm leading-relaxed">
                  {selectedAppointment.reason || "No reason provided."}
                </div>
              </div>

              {(selectedAppointment.referral || selectedAppointment.referral_doc) && (
                <div className="bg-teal-50 p-4 rounded-lg flex items-center justify-between border border-teal-100">
                  <div className="flex items-center gap-2 text-gabay-teal">
                    <FileText size={20} />
                    <span className="font-semibold text-sm">Medical Referral Attached</span>
                  </div>
                </div>
              )}
            </div>

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

      {/* --- CANCELLATION MODAL --- */}
      {cancelModalOpen && appointmentToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-red-500 p-5 flex items-center justify-between">
              <h2 className="text-white font-montserrat font-bold text-lg">Cancel Appointment</h2>
              <button onClick={closeCancelModal} className="text-white/80 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 font-poppins space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to cancel your appointment with <strong>{appointmentToCancel.doctor}</strong> on <strong>{appointmentToCancel.date}</strong>?
              </p>
              <div>
                <label className="block text-sm font-semibold text-gabay-navy mb-2">Reason for Cancellation</label>
                <textarea
                  rows="3"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please tell us why you are canceling..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  required
                />
              </div>
            </div>
            
            <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={closeCancelModal}
                disabled={isCanceling}
                className="px-5 py-2 text-gray-600 font-semibold text-sm hover:bg-gray-200 rounded-full transition-colors"
              >
                Keep Appointment
              </button>
              <button 
                onClick={handleCancelSubmit}
                disabled={isCanceling}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold rounded-full transition-colors text-sm shadow-md"
              >
                {isCanceling ? "Canceling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <div className="w-full max-w-5xl">
        <h1 className="font-montserrat font-bold text-[40px] text-gabay-teal text-left mb-2">
          Appointment Management
        </h1>
        <p className="font-poppins text-gray-600 text-left text-lg mb-12">
          Manage your upcoming and past appointments with GABAY here
        </p>

        <div className="bg-white shadow-lg overflow-hidden border border-gabay-blue rounded-t-xl">
          <div className="overflow-x-auto min-h-[300px]">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-4 border-gabay-teal border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : safeAppointments.length === 0 ? (
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
                    <th className="px-6 py-4 font-poppins font-semibold text-white text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAppointments.map((appt, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/50 transition duration-200">
                      <td className="px-6 py-5 font-poppins text-gabay-navy font-medium">{appt.date}</td>
                      <td className="px-6 py-5 font-poppins text-gray-600">{appt.doctor}</td>
                      <td className="px-6 py-5 font-poppins text-gray-600">
                        {appt.department}
                        {appt.type && (
                          <span className="block text-[10px] text-gabay-teal mt-1 uppercase font-bold tracking-wider">
                            {appt.type} OPD
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 font-poppins">
                        <span className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider border ${getStatusStyle(appt.status)}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right space-x-4">
                        <button
                          onClick={() => handleViewDetails(appt)}
                          className="font-poppins text-gabay-blue hover:text-gabay-teal hover:underline font-semibold text-sm transition-colors"
                        >
                          View
                        </button>
                        
                        {(appt.status?.toLowerCase().includes('approved') || appt.status?.toLowerCase().includes('pending')) && (
                          <button
                            onClick={() => openCancelModal(appt)}
                            className="font-poppins text-red-500 hover:text-red-700 hover:underline font-semibold text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!isLoading && safeAppointments.length > 0 && (
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