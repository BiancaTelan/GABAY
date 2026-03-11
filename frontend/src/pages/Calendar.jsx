import { useState } from 'react';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';

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

const dummyEvents = [
  { id: 1, title: 'Scheduled Appointment', doctor: 'Dr. Ritchie Cruz', department: 'Internal Medicine', date: '2026-03-16', type: 'Scheduled' },
  { id: 2, title: 'Previous Appointment', doctor: 'Dr. Joseph Nieto', department: 'Orthopedic Surgery', date: '2026-03-02', type: 'Previous' },
  { id: 3, title: 'Previous Appointment', doctor: 'Dr. Vinhcent Sandoval', department: 'Cardiology', date: '2026-01-17', type: 'Previous' },
  { id: 4, title: 'Scheduled Appointment', doctor: 'Dr. Maria Santos', department: 'Pediatrics', date: '2026-03-20', type: 'Scheduled' },
  { id: 5, title: 'Follow‑up', doctor: 'Dr. Anna Reyes', department: 'Internal Medicine', date: '2026-03-09', type: 'Scheduled' },
];

export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [eventPage, setEventPage] = useState(1);
  const totalEventPages = 4;

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const eventsByDate = dummyEvents.reduce((acc, event) => {
    const [year, month, day] = event.date.split('-').map(Number);
    if (year === currentYear && month === currentMonth + 1) {
      if (!acc[day]) acc[day] = [];
      acc[day].push(event);
    }
    return acc;
  }, {});

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
    <main className="flex flex-col items-center justify-start min-h-[calc(100vh-64px)] px-4 py-8 bg-gray-50">
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
                <h2 className="font-montserrat font-bold text-2xl text-gabay-teal">
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
                <span className="font-poppins text-gabay-navy font-bold text-lg">VIEW EVENT LIST</span>
                <button
                onClick={() => setShowSidePanel(!showSidePanel)}
                className="p-1 text-gray-600 hover:text-gabay-navy transition flex items-center"
                aria-label={showSidePanel ? 'Hide event list' : 'Show event list'}
                >
                <Menu size={25} />
                <ChevronLeft size={25} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2 text-center font-poppins font-semibold">
                {weekDays.map(({ name, color }) => (
                    <div key={name} className={`py-2 ${color}`}>{name}</div>
                ))}
            </div>

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
                if (hasScheduled) bgColor = 'font-poppins bg-green-100';
                else if (hasPrevious) bgColor = 'font-poppins bg-gray-200';

                return (
                  <div
                    key={day}
                    className={`h-20 md:h-24 flex flex-col items-start p-1 border border-gray-100 rounded-lg overflow-hidden ${bgColor}`}
                  >
                    <span className="font-poppins text-sm text-gray-700 mb-1">{day}</span>
                    {dayEvents.slice(0, 2).map((event, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] leading-tight text-gabay-blue truncate w-full"
                      >
                        {event.type === 'Scheduled' ? 'Schedul...' : 'Previous...'}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] text-gray-500">+{dayEvents.length - 2}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {showSidePanel && (
            <div className="lg:w-80 xl:w-96 flex flex-col">
              <div className="bg-white rounded-xl shadow-md p-6 flex-1 flex flex-col">
                <h3 className="font-poppins font-bold text-xl text-gabay-navy mb-6 mt-3">
                  Event List
                </h3>
                <div className="space-y-4 flex-1">
                  {dummyEvents.slice((eventPage-1)*4, eventPage*4).map((event) => (
                    <div
                      key={event.id}
                      className={`border rounded-lg p-3 transition ${
                        event.type === 'Scheduled'
                          ? 'bg-green-50 border-green-300'
                          : event.type === 'Previous'
                          ? 'bg-gray-100 border-gray-200'
                          : 'bg-white border-gray-200'
                      } hover:shadow-sm`}
                      >
                      <p className="font-poppins font-semibold text-gray-800">{event.title}</p>
                      <p className="font-poppins text-sm text-gray-600">{event.doctor}</p>
                      <p className="font-poppins text-sm text-gray-600">{event.department}</p>
                      <p className="font-poppins text-xs text-gabay-blue mt-1">
                        {new Date(event.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center mt-6">
                  <button
                    onClick={() => goToEventPage(eventPage - 1)}
                    disabled={eventPage === 1}
                    className="p-1 text-gray-600 hover:text-gabay-blue disabled:text-gray-300 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="mx-4 font-poppins text-sm text-gray-700">
                    Page {eventPage} of {totalEventPages}
                  </span>
                  <button
                    onClick={() => goToEventPage(eventPage + 1)}
                    disabled={eventPage === totalEventPages}
                    className="p-1 text-gray-600 hover:text-gabay-blue disabled:text-gray-300 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}