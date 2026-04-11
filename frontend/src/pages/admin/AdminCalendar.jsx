import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Eye, Plus, X, Check, Edit2 } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';

export default function AdminCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dailyCapacity, setDailyCapacity] = useState(25);
  const [isEditingCapacity, setIsEditingCapacity] = useState(false);
  
  const modalRef = useRef(null); // For clicking outside to exit

  // Data States
  const [appointments, setAppointments] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // BACKEND DEV: API: GET /api/admin/calendar-data?month=${format(currentMonth, 'yyyy-MM')}
    fetchDummyData();
  }, [currentMonth]);

  const fetchDummyData = () => {
    setHolidays([
      { date: new Date(2026, 3, 2), title: "Maundy Thursday" },
      { date: new Date(2026, 3, 3), title: "Good Friday" },
      { date: new Date(2026, 3, 9), title: "Araw ng Kagitingan" },
    ]);
    setEvents([{ date: new Date(2026, 3, 7), title: "SYSTEM UPDATE" }]);
    
    // Updated with full status breakdown to ensure data consistency
    setAppointments([
      { 
        date: new Date(2026, 3, 13), 
        confirmed: 3, canceled: 2, noShow: 2, completed: 17 
      },
      { 
        date: new Date(2026, 3, 14), 
        confirmed: 2, canceled: 1, noShow: 0, completed: 4 
      },
      { 
        date: new Date(2026, 3, 17), 
        confirmed: 5, canceled: 3, noShow: 1, completed: 4 
      },
    ]);
  };

  // Helper to calculate total from breakdown
  const getDayData = (day) => {
    const data = appointments.find(a => isSameDay(day, a.date));
    if (!data) return { total: 0, confirmed: 0, canceled: 0, noShow: 0, completed: 0 };
    return {
      ...data,
      total: data.confirmed + data.canceled + data.noShow + data.completed
    };
  };

  const handleDateClick = (day) => setSelectedDate(day);
  const handleDoubleClick = (day) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  // Close modal on outside click
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setIsModalOpen(false);
    }
  };

  const renderHeader = () => (
    <div className="flex items-center justify-center gap-4 md:gap-8 mb-4">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft className="text-gray-400" /></button>
      <h2 className="text-2xl md:text-4xl font-black text-gabay-blue uppercase tracking-tighter">
        {format(currentMonth, 'MMMM yyyy')}
      </h2>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight className="text-gray-400" /></button>
    </div>
  );

  const renderDays = () => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return (
      <div className="grid grid-cols-7 border-b">
        {days.map(d => (
          <div key={d} className="py-2 md:py-3 text-center font-bold text-white bg-gabay-blue border-x border-white/10 text-[10px] md:text-xs">
            {d}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const rows = [];
    let day = startDate;

    while (day <= endDate) {
      let daysInRow = [];
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const holiday = holidays.find(h => isSameDay(cloneDay, h.date));
        const event = events.find(e => isSameDay(cloneDay, e.date));
        const dayStats = getDayData(cloneDay);
        const isSelected = isSameDay(cloneDay, selectedDate);

        daysInRow.push(
          <div
            key={day}
            className={`min-h-[80px] md:min-h-[110px] border p-1 md:p-2 transition-all cursor-pointer relative flex flex-col
              ${!isSameMonth(day, monthStart) ? 'bg-gray-50 text-gray-300' : 'text-gabay-blue'}
              ${isSelected ? 'ring-2 ring-inset ring-gabay-teal z-10' : ''}`}
            onClick={() => handleDateClick(cloneDay)}
            onDoubleClick={() => handleDoubleClick(cloneDay)}
          >
            <span className="font-bold text-sm md:text-base">{format(day, 'd')}</span>
            
            <div className="mt-1 space-y-1 flex-1">
              {holiday && (
                <div className="bg-red-500 text-white text-[8px] md:text-[9px] p-0.5 md:p-1 rounded font-bold text-center leading-tight uppercase">
                  {holiday.title}
                </div>
              )}
              {event && (
                <div className="bg-gabay-teal text-white text-[8px] md:text-[9px] p-0.5 md:p-1 rounded font-bold text-center leading-tight uppercase">
                  {event.title}
                </div>
              )}
              {dayStats.total > 0 && (
                <div className="bg-gray-200 text-gray-600 text-[8px] md:text-[9px] p-0.5 md:p-1 rounded font-bold text-center uppercase mt-auto">
                  {dayStats.total} APPOINTMENTS
                </div>
              )}
            </div>
            
            {isSelected && (
              <button onClick={() => setIsModalOpen(true)} className="absolute top-1 right-1 p-1 bg-gabay-blue/80 text-white rounded-full hover:bg-gabay-blue">
                <Eye size={12} />
              </button>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7" key={day}>{daysInRow}</div>);
    }
    return <div className="border shadow-sm rounded-sm overflow-hidden">{rows}</div>;
  };

  const selectedDayStats = getDayData(selectedDate);
  const selectedDayHoliday = holidays.find(h => isSameDay(selectedDate, h.date));
  const selectedDayEvent = events.find(e => isSameDay(selectedDate, e.date));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 font-poppins">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gabay-teal font-semibold text-xs md:text-sm">
          <span>Daily Slot Capacity:</span>
          <input 
            type="number" 
            disabled={!isEditingCapacity}
            value={dailyCapacity}
            onChange={(e) => setDailyCapacity(Number(e.target.value))}
            className={`w-12 border rounded text-center ${isEditingCapacity ? 'border-gabay-teal bg-white' : 'border-transparent bg-transparent'}`}
          />
          {!isEditingCapacity ? (
            <button onClick={() => setIsEditingCapacity(true)} className="p-1 bg-gabay-teal text-white rounded"><Edit2 size={12}/></button>
          ) : (
            <div className="flex gap-1">
              <button onClick={() => setIsEditingCapacity(false)} className="p-1 bg-red-500 text-white rounded"><X size={12}/></button>
              <button onClick={() => setIsEditingCapacity(false)} className="p-1 bg-green-500 text-white rounded"><Check size={12}/></button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={handleOverlayClick}
        >
          <div 
            ref={modalRef}
            className="bg-white rounded-2xl w-full max-w-md p-6 md:p-8 relative animate-in zoom-in duration-200 shadow-2xl"
          >
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            
            <div className="flex items-center justify-center gap-4 mb-6">
               <ChevronLeft className="text-gray-300 cursor-pointer hover:text-gabay-blue" onClick={() => setSelectedDate(prev => addDays(prev, -1))} />
               <h2 className="text-2xl md:text-3xl font-bold text-gabay-blue uppercase">{format(selectedDate, 'MMMM d')}</h2>
               <ChevronRight className="text-gray-300 cursor-pointer hover:text-gabay-blue" onClick={() => setSelectedDate(prev => addDays(prev, 1))} />
            </div>

            {/* Display Active Holiday/Event on Modal */}
            {(selectedDayHoliday || selectedDayEvent) && (
              <div className="mb-6 flex flex-wrap justify-center gap-2">
                {selectedDayHoliday && <span className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase tracking-wider">{selectedDayHoliday.title}</span>}
                {selectedDayEvent && <span className="px-3 py-1 bg-teal-100 text-teal-600 text-[10px] font-bold rounded-full uppercase tracking-wider">{selectedDayEvent.title}</span>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 md:gap-8 mb-8 text-center border-b pb-6">
               <div>
                 <p className="text-gabay-teal font-bold text-sm mb-0.5">CONFIRMED: {selectedDayStats.confirmed}</p>
                 <p className="text-red-500 font-bold text-sm">CANCELED: {selectedDayStats.canceled}</p>
               </div>
               <div>
                 <p className="text-gray-400 font-bold text-sm mb-0.5">NO-SHOW: {selectedDayStats.noShow}</p>
                 <p className="text-green-500 font-bold text-sm">COMPLETED: {selectedDayStats.completed}</p>
               </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-lg font-bold text-gabay-blue mb-3">TOTAL APPOINTMENTS: {selectedDayStats.total}</h3>
              <div className="inline-block bg-gray-100 px-4 py-1.5 rounded-lg text-gray-500 font-bold text-sm">
                 SLOTS AVAILABLE: {Math.max(0, dailyCapacity - selectedDayStats.total)}/{dailyCapacity}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex-1 py-2.5 bg-red-500 text-white rounded-full font-bold uppercase text-[10px] hover:bg-red-600">
                + Mark as Holiday
              </button>
              <button className="flex-1 py-2.5 bg-gabay-teal text-white rounded-full font-bold uppercase text-[10px] hover:bg-teal-600">
                + Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}