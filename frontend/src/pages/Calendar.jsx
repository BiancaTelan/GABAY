import { useState, useEffect, useContext } from 'react';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { AuthContext } from '../authContext';

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const weekDays = [
  { name: 'Sun', color: 'text-gabay-teal' },
  { name: 'Mon', color: 'text-gabay-blue' },
  { name: 'Tue', color: 'text-gabay-blue' },
  { name: 'Wed', color: 'text-gabay-blue' },
  { name: 'Thu', color: 'text-gabay-blue' },
  { name: 'Fri', color: 'text-gabay-blue' },
  { name: 'Sat', color: 'text-gabay-teal' }
];

export default function CalendarPage() {
  const { token } = useContext(AuthContext); 
  
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [showSidePanel, setShowSidePanel] = useState(false);
  
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- PAGINATION FOR SIDE PANEL ---
  const [eventPage, setEventPage] = useState(1);
  const itemsPerPage = 4;
  const totalEventPages = Math.max(1, Math.ceil(events.length / itemsPerPage));

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      if (!token) return;
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userEmail = payload.sub;

        const response = await fetch(`/api/appointments/history/${userEmail}`);
        if (response.ok) {
          const data = await response.json();
          
          const transformedEvents = data.appointments.map(appt => {
            const [month, day, year] = appt.date.split('/');
            const formattedDate = `${year}-${month}-${day}`;
            
            const apptDate = new Date(year, month - 1, day);
            const isPast = apptDate < new Date(today.setHours(0,0,0,0));

            return {
              id: appt.id,
              title: isPast ? 'Previous Appointment' : 'Scheduled Appointment',
              doctor: appt.doctor,
              department: appt.department,
              date: formattedDate,
              type: isPast ? 'Previous' : 'Scheduled',
              status: appt.status
            };
          });

          setEvents(transformedEvents);
        }
      } catch (error) {
        console.error("Failed to fetch calendar data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarEvents();
  }, [token]);

  const eventsByDate = events.reduce((acc, event) => {
    const [year, month, day] = event.date.split('-').map(Number);
    if (year === currentYear && month === currentMonth + 1) {
      if (!acc[day]) acc[day] = [];
      acc[day].push(event);
    }
    return acc;
  }, {});

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToEventPage = (page) => {
    if (page >= 1 && page <= totalEventPages) setEventPage(page);
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-[calc(100vh-64px)] px-4 py-8 bg-gray-50 animate-in fade-in duration-500">
      <div className="w-full max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">

          <div className="flex-1 bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-3 text-gray-600 hover:text-gabay-blue transition"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={24} />
                </button>
                <h2 className="font-montserrat font-bold text-2xl text-gabay-teal w-48 text-center">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-1 text-gray-600 hover:text-gabay-blue transition"
                  aria-label="Next month"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-poppins text-gabay-navy font-bold text-lg hidden sm:block">VIEW EVENT LIST</span>
                <button
                onClick={() => setShowSidePanel(!showSidePanel)}
                className={`p-2 text-gray-600 hover:text-gabay-navy transition flex items-center rounded-lg ${showSidePanel ? 'bg-gray-100' : ''}`}
                aria-label={showSidePanel ? 'Hide event list' : 'Show event list'}
                >
                <Menu size={25} />
                <ChevronLeft size={25} className={`transition-transform duration-300 ${showSidePanel ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2 text-center font-poppins font-semibold">
                {weekDays.map(({ name, color }) => (
                    <div key={name} className={`py-2 ${color}`}>{name}</div>
                ))}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-[400px]">
                <div className="w-8 h-8 border-4 border-gabay-teal border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-20 md:h-24" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayEvents = eventsByDate[day] || [];
                  const hasScheduled = dayEvents.some(e => e.type === 'Scheduled');
                  const hasPrevious = dayEvents.some(e => e.type === 'Previous');

                  let bgColor = '';
                  if (hasScheduled) bgColor = 'font-poppins bg-green-50 border-green-200';
                  else if (hasPrevious) bgColor = 'font-poppins bg-gray-50 border-gray-200';

                  return (
                    <div
                      key={day}
                      className={`h-20 md:h-24 flex flex-col items-start p-1.5 border border-gray-100 rounded-lg overflow-hidden transition-colors ${bgColor}`}
                    >
                      <span className={`font-poppins text-sm mb-1 ${hasScheduled ? 'text-green-800 font-bold' : 'text-gray-700'}`}>{day}</span>
                      {dayEvents.slice(0, 2).map((event, idx) => (
                        <span
                          key={idx}
                          className={`text-[10px] leading-tight truncate w-full mb-0.5 px-1 rounded ${
                            event.type === 'Scheduled' ? 'bg-green-100 text-green-700 font-semibold' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {event.type === 'Scheduled' ? 'Scheduled' : 'Previous'}
                        </span>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[10px] text-gray-500 font-medium">+{dayEvents.length - 2} more</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SIDE PANEL */}
          {showSidePanel && (
            <div className="lg:w-80 xl:w-96 flex flex-col animate-in slide-in-from-right-8 duration-300">
              <div className="bg-white rounded-xl shadow-md p-6 flex-1 flex flex-col">
                <h3 className="font-poppins font-bold text-xl text-gabay-navy mb-6 mt-3 flex items-center justify-between">
                  Event List
                  <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{events.length} Total</span>
                </h3>
                
                <div className="space-y-4 flex-1">
                  {events.length === 0 && !isLoading ? (
                    <p className="text-center text-gray-500 font-poppins mt-10">No appointments found.</p>
                  ) : (
                    events.slice((eventPage-1) * itemsPerPage, eventPage * itemsPerPage).map((event) => (
                      <div
                        key={event.id}
                        className={`border rounded-xl p-4 transition-all hover:shadow-md ${
                          event.type === 'Scheduled'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        >
                        <div className="flex justify-between items-start mb-1">
                          <p className={`font-poppins font-bold ${event.type === 'Scheduled' ? 'text-green-800' : 'text-gray-700'}`}>
                            {event.title}
                          </p>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                            event.status.includes('Pending') ? 'bg-yellow-200 text-yellow-800' : 
                            event.status.includes('Approved') ? 'bg-green-200 text-green-800' : 
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        <p className="font-poppins text-sm font-semibold text-gabay-navy">{event.doctor}</p>
                        <p className="font-poppins text-xs text-gray-600 mb-2">{event.department}</p>
                        <p className={`font-poppins text-xs font-bold inline-block px-2 py-1 rounded ${
                          event.type === 'Scheduled' ? 'bg-white text-gabay-teal' : 'bg-white text-gray-500'
                        }`}>
                          {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {events.length > 0 && (
                  <div className="flex items-center justify-center mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => goToEventPage(eventPage - 1)}
                      disabled={eventPage === 1}
                      className="p-1 text-gabay-blue hover:bg-gray-100 rounded-full disabled:text-gray-300 disabled:cursor-not-allowed transition"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="mx-4 font-poppins text-sm font-semibold text-gabay-navy">
                      Page {eventPage} of {totalEventPages}
                    </span>
                    <button
                      onClick={() => goToEventPage(eventPage + 1)}
                      disabled={eventPage === totalEventPages}
                      className="p-1 text-gabay-blue hover:bg-gray-100 rounded-full disabled:text-gray-300 disabled:cursor-not-allowed transition"
                      aria-label="Next page"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}