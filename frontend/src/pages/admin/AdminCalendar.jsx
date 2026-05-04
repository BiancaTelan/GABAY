import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Eye, Plus, X, Check, Edit2 } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import AddEvent from '../../components/AddEvent';

export default function AdminCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dailyCapacity, setDailyCapacity] = useState(25);
  const [isEditingCapacity, setIsEditingCapacity] = useState(false);
  
  const modalRef = useRef(null);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState('EVENT');

  const [appointments, setAppointments] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [events, setEvents] = useState([]);
  const handleInputChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) {
      val = val.substring(0, 2) + "/" + val.substring(2, 6);
    }
    e.target.value = val;
  };

  const handleJumpToDate = (e) => {
    const val = e.target.value;
    if (!val) {
      setCurrentMonth(new Date());
      return;
    }

  const [month, year] = val.split('/');
    if (month && year && year.length === 4) {
      const newDate = new Date(parseInt(year), parseInt(month) - 1);
      if (!isNaN(newDate.getTime())) {
        setCurrentMonth(newDate);
      }
    }
  };

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
    setAppointments([
      { date: new Date(2026, 3, 13), confirmed: 3, canceled: 2, noShow: 2, completed: 17 },
      { date: new Date(2026, 3, 14), confirmed: 2, canceled: 1, noShow: 0, completed: 4 },
      { date: new Date(2026, 3, 17), confirmed: 5, canceled: 3, noShow: 1, completed: 4 },
    ]);
  };

  const getDayData = (day) => {
    const data = appointments.find(a => isSameDay(day, a.date));
    if (!data) return { total: 0, confirmed: 0, canceled: 0, noShow: 0, completed: 0 };
    return {
      ...data,
      total: data.confirmed + data.canceled + data.noShow + data.completed
    };
  };

  const handleDateClick = (day) => setSelectedDate(day);
  const handleDoubleClick = (day) => { setSelectedDate(day); setIsModalOpen(true); };

  // --- LOGIC: FUNCTIONAL HOLIDAYS & EVENTS ---
  const handleAddHoliday = () => {
    const title = prompt("Enter Holiday Name (e.g., Labor Day):");
    if (title) {
      const newHoliday = { date: selectedDate, title: title.toUpperCase() };
      // BACKEND DEV: POST /api/admin/holidays { date: selectedDate, title }
      setHolidays(prev => [...prev, newHoliday]);
    }
  };

  const handleAddEvent = () => {
    const title = prompt("Enter Event Name (e.g., Blood Drive):");
    if (title) {
      const newEvent = { date: selectedDate, title: title.toUpperCase() };
      // BACKEND DEV: POST /api/admin/events { date: selectedDate, title }
      setEvents(prev => [...prev, newEvent]);
    }
  };

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setIsModalOpen(false);
    }
  };

  const renderHeader = () => (
    <div className="flex items-center justify-center gap-4 md:gap-8 mb-4">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="text-gray-400" /></button>
      <h2 className="text-2xl md:text-4xl font-montserrat font-extrabold text-gabay-blue uppercase tracking-tight select-none">
        {format(currentMonth, 'MMMM yyyy')}
      </h2>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight className="text-gray-400" /></button>
    </div>
  );

  const renderDays = () => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return (
      <div className="grid grid-cols-7 border-b">
        {days.map(d => (
          <div key={d} className="py-2 md:py-3 text-center font-semibold font-montserrat text-white bg-gabay-blue border-x border-white/10 text-[10px] md:text-base">
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
            className={`min-h-[80px] md:min-h-[110px] border p-1 md:p-2 transition-all cursor-pointer relative font-poppins flex flex-col group
              ${!isSameMonth(day, monthStart) ? 'bg-gray-50 text-gray-300' : 'text-gabay-blue'}
              ${isSelected ? 'ring-2 ring-inset ring-gray-400 z-10' : 'hover:bg-teal-50/30'}`}
            onClick={() => handleDateClick(cloneDay)}
            onDoubleClick={() => handleDoubleClick(cloneDay)}
          >
            <span className="font-bold text-sm md:text-base">{format(day, 'd')}</span>
            
            <div className="mt-1 space-y-1 flex-1 overflow-hidden">
              {holiday && (
                <div className="bg-gabay-red text-white text-[7px] md:text-[9px] p-0.5 md:p-1 rounded font-medium text-center leading-tight uppercase truncate">
                  {holiday.title}
                </div>
              )}
              {event && (
                <div className="bg-gabay-teal text-white text-[7px] md:text-[9px] p-0.5 md:p-1 rounded font-medium text-center leading-tight uppercase truncate">
                  {event.title}
                </div>
              )}
              {dayStats.total > 0 && (
                <div className="bg-gray-200 text-gray-600 text-[7px] md:text-[9px] p-0.5 md:p-1 rounded font-medium text-center uppercase mt-auto truncate">
                  {dayStats.total} <span className="hidden md:inline">APPOINTMENTS</span><span className="md:hidden">APPT.</span>
                </div>
              )}
            </div>
            
            {isSelected && (
              <button onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }} className="absolute top-1 right-1 p-1 bg-gabay-blue/80 text-white rounded-full hover:bg-gabay-blue transition-all">
                <Eye size={17} />
              </button>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7" key={day}>{daysInRow}</div>);
    }
    return <div className="border border-t-0 shadow-sm rounded-sm overflow-hidden">{rows}</div>;
  };

  const selectedDayStats = getDayData(selectedDate);
  const selectedDayHoliday = holidays.find(h => isSameDay(selectedDate, h.date));
  const selectedDayEvent = events.find(e => isSameDay(selectedDate, e.date));

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 font-poppins select-none animate-in fade-in duration-500">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      {/* FOOTER SECTION */}
      <div className="mt-4 flex flex-row justify-between items-center gap-2">
        
        {/* LEFT: Slots */}
        <div className="flex items-center gap-1.5 text-gabay-teal font-semibold text-[10px] sm:text-base md:text-lg">
          <span className="whitespace-nowrap">Daily Capacity:</span>
          <div className="flex items-center gap-1">
            <input 
              type="number" 
              disabled={!isEditingCapacity}
              value={dailyCapacity}
              onChange={(e) => setDailyCapacity(Number(e.target.value))}
              className={`w-8 md:w-10 text-center focus:outline-none transition-all ${
                isEditingCapacity ? 'border-b border-gabay-teal bg-white font-bold' : 'bg-transparent text-gray-500'
              }`}
            />
            {!isEditingCapacity ? (
              <button onClick={() => setIsEditingCapacity(true)} className="text-gabay-teal p-1 border border-gabay-teal rounded hover:bg-teal-50"><Edit2 size={15}/></button>
            ) : (
              <div className="flex gap-1">
                <button onClick={() => setIsEditingCapacity(false)} className="text-orange-500"><X size={17}/></button>
                <button onClick={() => setIsEditingCapacity(false)} className="text-green-500"><Check size={17}/></button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Go to Month */}
        <div className="flex items-center gap-1.5 text-gray-400 font-semibold text-[10px] sm:text-base md:text-lg">
          <span className="whitespace-nowrap uppercase tracking-tighter">Go to:</span>
          <input 
            type="text" 
            placeholder="MM/YYYY"
            maxLength={7}
            defaultValue={format(currentMonth, 'MM/yyyy')}
            key={format(currentMonth, 'MM/yyyy')} 
            onChange={handleInputChange}
            onBlur={handleJumpToDate}
            onKeyDown={(e) => { if (e.key === 'Enter') handleJumpToDate(e); }}
            className="border border-gray-200 rounded-lg px-2 py-1 text-gabay-teal font-medium focus:outline-none focus:border-gabay-teal bg-white w-[85px] md:w-28 text-center"
          />
        </div>
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={handleOverlayClick}
        >
          <div 
            ref={modalRef}
            className="bg-white rounded-2xl w-full max-w-sm p-6 md:p-8 relative animate-in zoom-in duration-200 shadow-2xl border border-gray-100"
          >
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"><X size={20}/></button>
            
            <div className="flex items-center justify-center gap-4 mb-6">
               <ChevronLeft className="text-gray-300 cursor-pointer hover:text-gabay-blue transition-colors" onClick={() => setSelectedDate(prev => addDays(prev, -1))} />
               <h2 className="text-2xl md:text-3xl font-bold text-gabay-blue uppercase tracking-tight">{format(selectedDate, 'MMMM d')}</h2>
               <ChevronRight className="text-gray-300 cursor-pointer hover:text-gabay-blue transition-colors" onClick={() => setSelectedDate(prev => addDays(prev, 1))} />
            </div>

            {(selectedDayHoliday || selectedDayEvent) && (
              <div className="mb-6 flex flex-wrap justify-center gap-2">
                {selectedDayHoliday && <span className="px-3 py-1 bg-red-50 text-gabay-red text-xs font-bold rounded-full uppercase tracking-wider border border-gabay-red">{selectedDayHoliday.title}</span>}
                {selectedDayEvent && <span className="px-3 py-1 bg-teal-50 text-teal-600 text-xs font-bold rounded-full uppercase tracking-wider border border-teal-100">{selectedDayEvent.title}</span>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 md:gap-8 mb-1 text-center pb-5">
               <div>
                 <p className="text-[12px] text-gray-400 font-medium uppercase tracking-widest mb-1">Confirmed</p>
                 <p className="text-gabay-teal font-bold text-lg">{selectedDayStats.confirmed}</p>
                 <p className="text-[12px] text-gray-400 font-medium uppercase tracking-widest mt-4 mb-1">Canceled</p>
                 <p className="text-red-500 font-bold text-lg">{selectedDayStats.canceled}</p>
               </div>
               <div>
                 <p className="text-[12px] text-gray-400 font-medium uppercase tracking-widest mb-1">No-Show</p>
                 <p className="text-gray-500 font-bold text-lg">{selectedDayStats.noShow}</p>
                 <p className="text-[12px] text-gray-400 font-medium uppercase tracking-widest mt-4 mb-1">Completed</p>
                 <p className="text-green-500 font-bold text-lg">{selectedDayStats.completed}</p>
               </div>
            </div>
            <h3 className="text-sm font-semibold uppercase text-gabay-blue text-center mb-3  tracking-wide">Total Appointments: {selectedDayStats.total}</h3>
            
            <div className="text-center mb-6 ">
              <div className="inline-block font-montserrat bg-gray-50 border border-gray-100 px-4 py-1.5 rounded-lg text-gray-600 font-bold text-xs">
                 SLOTS AVAILABLE: {Math.max(0, dailyCapacity - selectedDayStats.total)} / {dailyCapacity}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => { setModalDefaultType('HOLIDAY'); setIsEventModalOpen(true); }}
                className="w-full py-1.5 bg-gabay-red text-white rounded-full font-semibold font-poppins uppercase text-md hover:bg-red-700 transition-colors shadow-sm"
              >
                + Mark as Holiday
              </button>
              <button 
                onClick={() => { setModalDefaultType('EVENT'); setIsEventModalOpen(true); }}
                className="w-full py-1.5 bg-gabay-teal text-white rounded-full font-semibold font-poppins uppercase text-md hover:bg-teal-600 transition-colors shadow-sm"
              >
                + Add Event
              </button>
            </div>
          </div>
        </div>
      )}
      <AddEvent 
              isOpen={isEventModalOpen} 
              onClose={() => setIsEventModalOpen(false)} 
              onSave={(data) => console.log("New Event Data:", data)} 
              defaultType={modalDefaultType}
            />
    </div>
  );
}