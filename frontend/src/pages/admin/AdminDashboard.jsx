import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileCheck, Stethoscope, ShieldPlus, ClipboardList, 
  Plus, DownloadCloud, ExternalLink, CircleAlert, TriangleAlert,
  ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import AddEvent from '../../components/AddEvent';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState('Weekly');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState('EVENT');

  // --- CALENDAR LOGIC (Requirement 1 & 5) ---
  // //EDIT: Dynamic calendar state and navigation
  const [viewDate, setViewDate] = useState(new Date(2026, 3, 22)); // Initialized to April 2026
  const today = new Date(2026, 3, 22); // Mocking "Today" as April 22, 2026
  
  // //INSTRUCTION FOR BACKEND: Connect these arrays to your global Calendar/Holidays API
  const [holidays, setHolidays] = useState([25]); 
  const [events, setEvents] = useState([15]);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));

  // --- MOCK DATA FOR DYNAMIC MODULES ---
  // //INSTRUCTION FOR BACKEND: Replace these with actual fetch() calls. 
  // Personnel data should be filtered by status === 'Online'
  const mockPersonnel = Array(12).fill({
    name: 'Dr. Zack Arias', role: 'DOCTOR', dept: 'General IM', email: 'zack@gmail.com', status: 'Online'
  });

  // //EDIT: System Logs matching reference image (Requirement 4)
  const mockSystemLogs = [
    { date: '04/02/2026', time: '12:40 PM', type: 'Performance', module: 'Slow loading', priority: 'HIGH' },
    { date: '04/02/2026', time: '9:23 AM', type: 'Security', module: 'DatabaseFirewall', priority: 'CRITICAL' },
    { date: '04/01/2026', time: '3:12 PM', type: 'Memory', module: 'ServerProcesses', priority: 'MEDIUM' },
    { date: '03/31/2026', time: '11:36 AM', type: 'Storage', module: 'BackupSystem', priority: 'LOW' },
    { date: '03/31/2026', time: '10:58 AM', type: 'Report', module: 'WebsiteCrashes', priority: 'MEDIUM' },
  ];

  const mockAuditLogs = [
    { name: 'Rachel Mawac', role: 'ADMIN', desc: 'Updated slot capacity for Cardiology', time: '04/22/2026 10:30 AM' },
    { name: 'Juan Dela Cruz', role: 'PATIENT', desc: 'Booked an appointment', time: '04/22/2026 09:15 AM' },
    { name: 'System', role: 'SYSTEM', desc: 'Automatic database backup successful', time: '04/21/2026 11:00 PM' },
    { name: 'Dr. Harvey', role: 'DOCTOR', desc: 'Logged into the portal', time: '04/21/2026 08:00 AM' },
    { name: 'Maria Dela Cruz', role: 'STAFF', desc: 'Approved a patient registration', time: '04/20/2026 02:45 PM' },
  ];

  // --- CHART LOGIC (Requirement 2 & 6) ---
  const filterableDatasets = {
    Daily: { labels: ['6AM', '12PM', '6PM'], counts: [5, 12, 8], capacity: 18 },
    Weekly: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], counts: [12, 19, 15, 8, 22, 30, 10], capacity: 15 },
    Monthly: { labels: ['W1', 'W2', 'W3', 'W4'], counts: [85, 92, 78, 110], capacity: 20 },
    Annually: { labels: ['Jan', 'Jun', 'Dec'], counts: [450, 610, 590], capacity: 12 }
  };

  const activeData = filterableDatasets[timeFilter];
  const avgUsed = activeData.capacity;
  const usedPercentage = Math.round((avgUsed / 25) * 100);

  const timelineData = {
    labels: activeData.labels,
    datasets: [{
      label: 'Appointments',
      data: activeData.counts,
      borderColor: '#0284c7',
      backgroundColor: 'rgba(2, 132, 199, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  const capacityData = {
    labels: ['Taken Slots', 'Available Slots'],
    datasets: [{
      data: [avgUsed, 25 - avgUsed],
      backgroundColor: ['#33AFAE', '#f3f4f6'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-montserrat text-3xl font-bold text-gabay-blue">Dashboard</h1>
          <p className="font-poppins text-sm text-gray-500 mt-1">Home &gt; Dashboard</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gabay-teal font-medium font-poppins text-sm rounded-lg hover:bg-gray-50 transition min-w-[160px]"
            >
              Filter By: {timeFilter}
              <ChevronDown size={16} className="ml-auto" />
            </button> 
            {showFilterDropdown && (
              <div className="absolute text-gabay-teal font-medium top-full right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                {['Daily', 'Weekly', 'Monthly', 'Annually'].map((option) => (
                  <button 
                    key={option}
                    onClick={() => { setTimeFilter(option); setShowFilterDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-sm font-poppins hover:bg-blue-50 transition"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gabay-teal text-white font-medium font-poppins text-sm hover:bg-opacity-90 shadow-sm transition">
            <Plus size={18} /> Generate Reports
          </button>
        </div> 
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Appointments Completed" value="127" icon={FileCheck} color="teal" />
        <StatCard title="Issues Detected" value="0 Errors" icon={CircleAlert} color="red" />
        <StatCard title="System Health" value="95%" icon={ShieldPlus} color="blue" />
        <StatCard title="Active Personnel" value={mockPersonnel.length.toString()} icon={Stethoscope} color="green" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2.2fr_1.5fr_1.2fr] gap-6 items-start">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:col-span-2">
          
          {/* APPOINTMENT TIMELINE */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-montserrat text-lg font-bold text-gabay-blue mb-4">Appointment Timeline</h4>
            <div className="h-[280px]">
              <Line data={timelineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>

          {/* //EDIT: Requirement 2 - Dynamic Pie Chart with Legends */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
             <h4 className="font-montserrat text-lg font-bold text-gabay-blue mb-6 self-start">Avg. Slot Capacity</h4>
             <div className="w-52 h-52 relative mb-6">
               <Pie data={capacityData} options={{ plugins: { legend: { display: false } } }} />
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="font-bold text-gabay-navy text-3xl">{usedPercentage}%</span>
                 <span className="text-[11px] text-gabay-navy font-bold uppercase">{avgUsed}/25 taken</span>
               </div>
             </div>
             <div className="flex gap-4 text-xs font-poppins font-medium">
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gabay-teal"></div> Taken</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-100"></div> Available</div>
             </div>
          </div>

          {/* //EDIT: Requirement 3 - Scrollable Active Personnel (10 Most Recent) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-6">
              <h4 className="font-montserrat text-lg font-bold text-gabay-blue">Active Personnel</h4>
              <button onClick={() => navigate('/admin/personnel')} className="text-sm font-poppins text-gabay-teal font-medium hover:underline">See all</button>
            </div>
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {mockPersonnel.slice(0, 10).map((person, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <div>
                      <p className="font-poppins text-sm font-bold text-gabay-blue">{person.name}</p>
                      <p className="font-poppins text-[10px] text-gray-400 font-medium uppercase">{person.dept} • {person.role}</p>
                    </div>
                  </div>
                  <p className="font-poppins text-[10px] text-gray-500 font-poppins hidden md:block">{person.email}</p>
                </div>
              ))}
            </div>
          </div>

          {/* //EDIT: Requirement 5 - Dynamic Audit Logs */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2 overflow-x-auto">
             <div className="flex justify-between items-center mb-6">
              <h4 className="font-montserrat text-lg font-bold text-gabay-blue">Audit Logs</h4>
              <button onClick={() => navigate('/admin/audit-logs')} className="font-poppins text-sm text-gabay-teal font-medium hover:underline">See all</button>
            </div>
            <div className="space-y-4">
              {mockAuditLogs.map((log, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                  <div className="flex-1">
                    <p className="font-poppins font-semibold text-gabay-blue">{log.name} <span className="text-[10px] font-medium text-gray-400 border px-1.5 rounded-full ml-2">{log.role}</span></p>
                    <p className="font-poppins text-gray-500 text-xs italic">"{log.desc}"</p>
                  </div>
                  <p className="font-poppins text-right text-[10px] text-gray-400 font-medium">{log.time}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          {/* //EDIT: Requirement 1 - Dynamic Calendar with Chevrons and Highlights */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-montserrat text-lg font-bold text-gabay-blue">
                {viewDate.toLocaleString('default', { month: 'long' })} {viewDate.getFullYear()}
              </h4>
              <div className="flex gap-1">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft size={16}/></button>
                <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight size={16}/></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-poppins font-bold text-gray-300 mb-2">
              {['S','M','T','W','T','F','S'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const isToday = viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear() && day === today.getDate();
                const isHoliday = holidays.includes(day);
                const isEvent = events.includes(day);
                return (
                  <div key={day} className={`p-2 rounded-full text-[11px] font-semibold flex items-center justify-center cursor-default ${
                    isToday ? 'bg-gray-100 text-gabay-blue' : 
                    isHoliday ? 'bg-red-500 text-white' : 
                    isEvent ? 'bg-gabay-teal text-white' : 'text-gray-600'
                  }`}>
                    {day}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex flex-row gap-2">
              {/* Requirement 1: + buttons for navigation/functionality */}
              <button onClick={() => { setModalDefaultType('HOLIDAY'); setIsEventModalOpen(true); }} className="flex-1 py-2 bg-red-500 text-white text-xs font-bold rounded-lg uppercase">+ Holiday</button>
              <button onClick={() => { setModalDefaultType('EVENT'); setIsEventModalOpen(true); }} className="flex-1 py-2 bg-gabay-teal text-white text-xs font-bold rounded-lg uppercase">+ Event</button>
            </div>
          </div>

          {/* //EDIT: Requirement 4 - System Logs matching image style */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-montserrat text-lg font-bold text-gabay-blue">System Logs</h4>
              <button onClick={() => navigate('/admin/system-logs')} className="font-poppins text-sm text-gabay-teal font-medium hover:underline">See all</button>
            </div>
            <div className="space-y-3">
              {mockSystemLogs.map((log, i) => (
                <div key={i} className="p-3 border border-gray-100 rounded-xl bg-gray-50/30">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-[11px] font-bold text-gabay-blue uppercase">{log.type}</p>
                      <p className="text-[10px] text-gray-500">{log.module}</p>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                      log.priority === 'CRITICAL' ? 'border-red-500 text-red-500' : 
                      log.priority === 'HIGH' ? 'border-orange-400 text-orange-500' : 'border-blue-400 text-blue-500'
                    }`}>{log.priority}</span>
                  </div>
                  <p className="text-[9px] text-gray-400 font-medium">{log.date} • {log.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AddEvent 
        isOpen={isEventModalOpen} 
        onClose={() => setIsEventModalOpen(false)} 
        onSave={(data) => console.log("New Event Data:", data)} 
        defaultType={modalDefaultType}
      />
    </div>
  );
}