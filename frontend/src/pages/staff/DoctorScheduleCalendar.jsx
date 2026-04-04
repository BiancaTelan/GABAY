import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Plus, ChevronLeft as ChevronLeftIcon } from 'lucide-react';

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const weekDays = [
  { name: 'Sun', color: 'text-gabay-teal', dayCode: 'S' },
  { name: 'Mon', color: 'text-gabay-blue', dayCode: 'M' },
  { name: 'Tue', color: 'text-gabay-blue', dayCode: 'T' },
  { name: 'Wed', color: 'text-gabay-blue', dayCode: 'W' },
  { name: 'Thu', color: 'text-gabay-blue', dayCode: 'TH' },
  { name: 'Fri', color: 'text-gabay-blue', dayCode: 'F' },
  { name: 'Sat', color: 'text-gabay-teal', dayCode: 'ST' }
];

export default function DoctorScheduleCalendar() {
  const navigate = useNavigate();
  const { doctors = [] } = useOutletContext() || {};
  
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

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

  const getDoctorsForDay = (dayIndex) => {
    const dayMap = ['S', 'M', 'T', 'W', 'TH', 'F', 'ST'];
    const currentDayCode = dayMap[dayIndex];
    return doctors.filter(doc => 
        doc.schedule?.split(',').map(s => s.trim()).includes(currentDayCode)
    );
  };

  return (
    <div className="space-y-6 font-poppins">
      {/* Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gabay-blue px-6 py-6 mb-4">
        <div className="text-left">
          <h1 className="font-montserrat text-3xl font-bold text-white tracking-tight">Doctor List & Schedule</h1>
          <p className="font-poppins text-sm text-white/90 mt-1">
            Doctors &gt; <span className="text-white font-medium underline underline-offset-4">Doctors Schedule</span>
          </p>
        </div>
        <button 
          onClick={() => navigate('/staff/doctors')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-gabay-blue font-bold text-sm rounded-lg hover:bg-teal-50 transition-all shadow-lg active:scale-95 group"
        >
          <ChevronLeftIcon size={18} className="group-hover:-translate-x-1 transition-transform" />
          Return to Doctor List
        </button>
      </div>

      <div className="w-full pb-8">
        <div className="bg-white rounded-xl shadow-md p-6 overflow-hidden">
          
          {/* CALENDAR NAV */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-3 text-gray-600 hover:text-gabay-blue transition"
                aria-label="Previous month"
              >
                <ChevronLeft size={24} />
              </button>
              <h2 className="font-montserrat font-bold text-2xl text-gabay-teal w-64 text-center uppercase tracking-widest">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={nextMonth}
                className="p-3 text-gray-600 hover:text-gabay-blue transition"
                aria-label="Next month"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* WEEKDAY LABELS */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center font-semibold">
            {weekDays.map(({ name, color }) => (
              <div key={name} className={`py-2 ${color} uppercase text-xs tracking-widest`}>{name}</div>
            ))}
          </div>

          {/* CALENDAR GRID */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for previous month */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 md:h-32 bg-gray-50/30 border border-gray-50 rounded-lg" />
            ))}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(currentYear, currentMonth, day);
              const onDuty = getDoctorsForDay(dateObj.getDay());
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

              return (
                <div
                  key={day}
                  className={`h-24 md:h-32 flex flex-col items-start p-2 border border-gray-100 rounded-lg overflow-hidden transition-colors ${
                    isToday ? 'bg-teal-50 border-teal-200' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-sm mb-1 font-bold ${isToday ? 'text-gabay-teal' : 'text-gray-700'}`}>
                    {day}
                  </span>
                  
                  <div className="w-full space-y-1 overflow-y-auto custom-scrollbar">
                    {onDuty.map((doc) => (
                      <div 
                        key={doc.id} 
                        className="px-1.5 py-1 rounded bg-white border border-gray-200 shadow-sm border-l-4 border-l-gabay-teal truncate"
                      >
                        <p className="text-[9px] font-bold text-gray-800 truncate leading-tight uppercase">
                          {doc.name.split(',')[0]}
                        </p>
                        <div className="flex items-center gap-0.5 text-gray-400">
                          <Clock size={7} />
                          <span className="text-[7px] italic font-medium truncate">
                            {doc.timePeriod?.split('–')[0]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}