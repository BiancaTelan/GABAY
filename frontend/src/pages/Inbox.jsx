import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Mail, Info, Check, X } from 'lucide-react';

export default function Inbox({ userInfo }) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  const notifications = {
    all: [
      {
        id: 1,
        type: 'appointment',
        title: 'Upcoming Appointment',
        date: '03/16/2026',
        department: 'Internal Medicine',
        doctor: 'Dr. Ritchie Cruz',
        status: 'APPROVED',
        icon: Calendar,
      },
      {
        id: 2,
        type: 'reservation',
        title: 'Reservation Submitted',
        submissionDate: '02/27/2026',
        status: 'FOR APPROVAL',
        message: 'Please check your email address for further updates with regards to your reserved appointment.',
        icon: Mail,
      },
      {
        id: 3,
        type: 'system',
        title: 'System Update Ver. 1.0',
        content: 'What’s New? Fixed errors in calendar schedule...',
        icon: Info,
      },
    ],
    system: [
      {
        id: 3,
        type: 'system',
        title: 'System Update Ver. 1.0',
        content: 'What’s New? Fixed errors in calendar schedule...',
        icon: Info,
      },
    ],
    schedule: [
      {
        id: 1,
        type: 'appointment',
        title: 'Upcoming Appointment',
        date: '03/16/2026',
        department: 'Internal Medicine',
        doctor: 'Dr. Ritchie Cruz',
        status: 'APPROVED',
        icon: Calendar,
      },
    ],
  };

  const filteredNotifications = notifications[activeFilter] || notifications.all;

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleApprove = (note) => {
    navigate('/appointment-confirmed', {
      state: {
        patientName: userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'Patient',
        department: note.department,
        date: note.date,
        doctor: note.doctor,
      },
    });
  };

  const handleReject = (note) => {
  navigate('/appointment-cancelled', {
    state: {
      id: note.id,
      patientName: userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'Patient',
      department: note.department,
      date: note.date,
      doctor: note.doctor,
    },
  });
};

  return (
    <main className="flex flex-col items-center justify-start min-h-[calc(100vh-64px)] px-4 py-12 bg-gray-50">
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

        <div className="space-y-4">
          {filteredNotifications.map((note) => {
            const Icon = note.icon;
            return (
              <div
                key={note.id}
                className="bg-white rounded-xl shadow-md p-6 border-l-8 border-gray-200 hover:shadow-xl hover:border-gabay-blue hover:scale-[1.02] transition-all duration-200 h-full"
              >
                <div className="flex items-start gap-3">
                  {Icon && (
                    <div className="text-gabay-blue mt-1">
                      <Icon size={20} />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-poppins font-semibold text-lg text-gabay-blue mb-2">
                      {note.title}
                    </h3>
                    {note.type === 'appointment' && (
                      <div className="relative">
                        <div className="absolute bottom-3 right-1 flex gap-2">
                          <button
                            onClick={() => handleApprove(note)}
                            className="p-4 text-green-800 hover:bg-green-300 rounded-full transition"
                            title="Approve"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => handleReject(note)}
                            className="p-4 text-red-800 hover:bg-red-300 rounded-full transition"
                            title="Reject"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <div className="space-y-1 font-poppins text-sm text-gabay-navy grid grid-cols-1 md:grid-cols-2">
                          <p>
                            <span className="font-medium">Appointment Date:</span> {note.date}
                          </p>
                          <p>
                            <span className="font-medium">Department:</span> {note.department}
                          </p>
                          <p>
                            <span className="font-medium">Appointed Doctor:</span> {note.doctor}
                          </p>
                          <p>
                            <span className="font-medium">Status:</span>{' '}
                            <span className="text-gabay-teal font-bold">{note.status}</span>
                          </p>
                        </div>
                      </div>
                    )}
                    {note.type === 'reservation' && (
                      <div className="space-y-1 font-poppins text-sm text-gabay-navy grid grid-cols-1 md:grid-cols-2">
                        <p>
                          <span className="font-medium">Date of Submission:</span> {note.submissionDate}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span>{' '}
                          <span className="text-yellow-500 font-bold">{note.status}</span>
                        </p>
                        <p className="text-gray-600">{note.message}</p>
                      </div>
                    )}
                    {note.type === 'system' && (
                      <p className="font-poppins text-sm text-gabay-navy">{note.content}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center mt-8">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 text-gray-600 hover:text-gabay-blue disabled:text-gray-300 disabled:cursor-not-allowed focus:outline-none transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="mx-4 font-poppins text-gabay-navy">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 text-gray-600 hover:text-gabay-blue disabled:text-gray-300 disabled:cursor-not-allowed focus:outline-none transition-colors"
            aria-label="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </main>
  );
}