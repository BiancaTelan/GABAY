import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminCalendar() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 font-poppins animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-gabay-teal">Hospital Calendar</h1>
          <p className="text-gray-500 mt-1">Manage hospital-wide schedules and events</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft /></button>
          <span className="font-bold text-gabay-blue">April 2026</span>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight /></button>
        </div>
      </div>

      {/* Placeholder for the Calendar Grid */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm min-h-[600px] flex flex-col items-center justify-center text-center p-10">
        <div className="bg-teal-50 p-6 rounded-full mb-4">
          <CalendarIcon size={48} className="text-gabay-teal" />
        </div>
        <h2 className="text-xl font-semibold text-gabay-blue mb-2">Calendar Integration Pending</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          The interactive scheduling system is currently being synced with the hospital database. 
          Soon you'll be able to manage doctor shifts and department availability here.
        </p>
      </div>
    </div>
  );
}