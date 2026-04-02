import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Mail, Info, Check, X } from 'lucide-react';
import { AuthContext } from '../authContext'; 

export default function Inbox({ userInfo }) {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const [allNotifications, setAllNotifications] = useState([]);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchInboxData = async () => {
      if (!token) return;
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userEmail = payload.sub;

        const response = await fetch(`/api/appointments/history/${userEmail}`);
        if (response.ok) {
          const data = await response.json();
          
          const dynamicNotifications = data.appointments.map(appt => {
            const isPending = appt.status.includes('Pending');
            
            return {
              id: appt.id,
              type: isPending ? 'reservation' : 'appointment',
              title: isPending ? 'Reservation Submitted' : 'Upcoming Appointment',
              date: appt.date,
              submissionDate: appt.createdAt,
              department: appt.department,
              doctor: appt.doctor,
              status: isPending ? 'FOR APPROVAL' : 'APPROVED',
              message: isPending ? 'Please check your email address for further updates with regards to your reserved appointment.' : '',
              icon: isPending ? Mail : Calendar,
            };
          });

          const isVerified = data.is_verified;

          const notificationsArray = [];

          if (!isVerified) {
            notificationsArray.push({
              id: 'sys-verify-1',
              type: 'system',
              title: 'Action Required: Verify Your Email',
              content: 'Please check your email inbox (including spam/junk) to verify your email address. You will not receive schedule updates until your email is verified.',
              icon: Mail, // You'll need to import AlertCircle or just use Mail
              isAlert: true 
            });
          }

          notificationsArray.push({
            id: 'sys-1',
            type: 'system',
            title: 'System Update Ver. 1.0',
            content: 'What’s New? Fixed errors in calendar schedule formatting and optimized the backend booking engine.',
            icon: Info,
          });

          setAllNotifications([...notificationsArray, ...dynamicNotifications]);
        }
      } catch (error) {
        console.error("Failed to fetch inbox notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInboxData();
  }, [token]);

  // --- FILTERING LOGIC ---
  const filteredNotifications = allNotifications.filter(note => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'system') return note.type === 'system';
    if (activeFilter === 'schedule') return note.type === 'appointment' || note.type === 'reservation';
    return true;
  });

  // --- PAGINATION LOGIC ---
  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / itemsPerPage));
  const currentNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); 
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleApprove = async (note) => {
    try {
      const response = await fetch(`/api/appointments/${note.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Confirmed' })
      });

      if (!response.ok) {
        throw new Error("Failed to confirm appointment. Please try again.");
      }

      navigate('/appointment-confirmed', {
        state: {
          patientName: userInfo ? `${userInfo.firstname} ${userInfo.surname}` : 'Patient',
          department: note.department,
          date: note.date,
          doctor: note.doctor,
        },
      });
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleReject = async (note) => {
    try {
      const response = await fetch(`/api/appointments/${note.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' })
      });

      if (!response.ok) {
        throw new Error("Failed to cancel appointment. Please try again.");
      }

      navigate('/appointment-cancelled', {
        state: {
          id: note.id,
          patientName: userInfo ? `${userInfo.firstname} ${userInfo.surname}` : 'Patient',
          department: note.department,
          date: note.date,
          doctor: note.doctor,
        },
      });
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-[calc(100vh-64px)] px-4 py-12 bg-gray-50 animate-in fade-in duration-500">
      <div className="w-full max-w-5xl">
        <h1 className="font-montserrat font-bold text-[40px] text-gabay-teal text-left mb-2">
          Inbox
        </h1>
        <p className="font-poppins text-gray-600 text-left text-lg mb-6">
          See account notifications and updates here
        </p>
        
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 font-poppins text-sm font-medium rounded-md transition ${
                activeFilter === 'all'
                  ? 'bg-white shadow text-gabay-blue'
                  : 'text-gray-600 hover:text-gabay-blue'
              }`}
            >
              View All
            </button>
            <button
              onClick={() => handleFilterChange('system')}
              className={`px-4 py-2 font-poppins text-sm font-medium rounded-md transition ${
                activeFilter === 'system'
                  ? 'bg-white shadow text-gabay-blue'
                  : 'text-gray-600 hover:text-gabay-blue'
              }`}
            >
              System Notifications
            </button>
            <button
              onClick={() => handleFilterChange('schedule')}
              className={`px-4 py-2 font-poppins text-sm font-medium rounded-md transition ${
                activeFilter === 'schedule'
                  ? 'bg-white shadow text-gabay-blue'
                  : 'text-gray-600 hover:text-gabay-blue'
              }`}
            >
              Schedule Updates
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-gabay-teal border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : currentNotifications.length === 0 ? (
          <div className="flex justify-center items-center h-64 font-poppins text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            No notifications in this category.
          </div>
        ) : (
          <div className="space-y-4 min-h-[350px]">
            {currentNotifications.map((note) => {
              const Icon = note.icon;
              return (
                <div
                  key={note.id}
                  className={`bg-white rounded-xl shadow-md p-6 border-l-8 hover:shadow-xl hover:scale-[1.01] transition-all duration-200 h-full ${
                    note.type === 'reservation' ? 'border-yellow-400' : 
                    note.type === 'appointment' ? 'border-gabay-teal' : 'border-gray-400'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {Icon && (
                      <div className={`mt-1 p-2 rounded-full ${
                        note.type === 'reservation' ? 'bg-yellow-50 text-yellow-600' : 
                        note.type === 'appointment' ? 'bg-teal-50 text-gabay-teal' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon size={24} />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-poppins font-semibold text-lg text-gabay-navy mb-3">
                        {note.title}
                      </h3>
                      
                      {note.type === 'appointment' && (
                        <div className="relative">
                          <div className="absolute bottom-1 right-1 flex gap-2">
                            <button
                              onClick={() => handleApprove(note)}
                              className="p-3 text-green-700 bg-green-50 hover:bg-green-200 rounded-full transition shadow-sm"
                              title="Acknowledge / Approve"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => handleReject(note)}
                              className="p-3 text-red-700 bg-red-50 hover:bg-red-200 rounded-full transition shadow-sm"
                              title="Cancel / Reject"
                            >
                              <X size={18} />
                            </button>
                          </div>
                          <div className="space-y-2 font-poppins text-sm text-gray-700 grid grid-cols-1 md:grid-cols-2 bg-gray-50 p-4 rounded-lg">
                            <p><span className="font-semibold text-gabay-navy">Date:</span> {note.date}</p>
                            <p><span className="font-semibold text-gabay-navy">Department:</span> {note.department}</p>
                            <p><span className="font-semibold text-gabay-navy">Doctor:</span> {note.doctor}</p>
                            <p><span className="font-semibold text-gabay-navy">Status:</span>{' '}
                              <span className="text-gabay-teal font-bold">{note.status}</span>
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {note.type === 'reservation' && (
                        <div className="space-y-2 font-poppins text-sm text-gray-700 grid grid-cols-1 md:grid-cols-2 bg-yellow-50/50 p-4 rounded-lg">
                          <p><span className="font-semibold text-gabay-navy">Submission Date:</span> {note.submissionDate}</p>
                          <p><span className="font-semibold text-gabay-navy">Status:</span>{' '}
                            <span className="text-yellow-600 font-bold">{note.status}</span>
                          </p>
                          <p className="col-span-1 md:col-span-2 text-gray-600 mt-2 font-medium italic">{note.message}</p>
                        </div>
                      )}
                      
                      {note.type === 'system' && (
                        <div className={`p-4 rounded-lg border ${note.isAlert ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                          <p className={`font-poppins text-sm leading-relaxed ${note.isAlert ? 'text-red-700 font-medium' : 'text-gray-700'}`}>
                            {note.content}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {!isLoading && filteredNotifications.length > 0 && (
          <div className="flex items-center justify-center mt-10">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 text-gabay-blue hover:bg-gray-200 rounded-full disabled:text-gray-300 disabled:bg-transparent disabled:cursor-not-allowed focus:outline-none transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="mx-6 font-poppins font-semibold text-gabay-navy tracking-wide">
              PAGE {currentPage} OF {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 text-gabay-blue hover:bg-gray-200 rounded-full disabled:text-gray-300 disabled:bg-transparent disabled:cursor-not-allowed focus:outline-none transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}