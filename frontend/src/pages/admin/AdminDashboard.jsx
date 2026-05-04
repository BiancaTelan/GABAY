import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileCheck, Stethoscope, ShieldPlus, ClipboardList, Download,
  Plus, DownloadCloud, ExternalLink, CircleAlert, TriangleAlert,
  ChevronDown, ChevronLeft, ChevronRight, Filter, Calendar as CalIcon
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import AddEvent from '../../components/AddEvent';
import toast from 'react-hot-toast';

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

  // --- CALENDAR LOGIC (Requirement 1) ---
  const [viewDate, setViewDate] = useState(new Date()); 
  const today = new Date(); // Real-time date detection
  
  // //INSTRUCTION FOR BACKEND: These arrays must be synced with AdminCalendar.jsx database
  const [holidays, setHolidays] = useState([2, 3, 9]); 
  const [events, setEvents] = useState([15, 28]);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));

  // --- MOCK DATA (Requirement 3, 4, 5) ---
  // //INSTRUCTION FOR BACKEND: Retrieve only those with status === 'ONLINE' from Personnel table
  const mockPersonnel = [
    { name: 'Alex Simon', dept: 'PEDIATRICS', role: 'STAFF', phone: '09335557777', email: 'alex@gmail.com' },
    { name: 'Ana Batungbakal', dept: 'GENERAL IM', role: 'STAFF', phone: '09223334444', email: 'alex@gmail.com' },
    { name: 'Bernice Castro', dept: 'DERMATOLOGY', role: 'DOCTOR', phone: '09335557777', email: 'bernice@gmail.com' },
    { name: 'Dante Estacio', dept: 'N/A', role: 'ADMIN', phone: '09556667777', email: 'dante@gmail.com' },
    { name: 'Gina Gomez', dept: 'PEDIATRICS', role: 'STAFF', phone: '09778889999', email: 'gina@gmail.com' },
  ];

  // //INSTRUCTION FOR BACKEND: Sync with SystemLogs.jsx API
  const mockSystemLogs = [
    { date: '04/02/2026', time: '12:40 PM', type: 'PERFORMANCE', module: 'Slow loading', priority: 'HIGH' },
    { date: '04/02/2026', time: '9:23 AM', type: 'SECURITY', module: 'DatabaseFirewall', priority: 'CRITICAL' },
    { date: '04/01/2026', time: '3:12 PM', type: 'MEMORY', module: 'ServerProcesses', priority: 'MEDIUM' },
    { date: '03/31/2026', time: '11:36 AM', type: 'STORAGE', module: 'BackupSystem', priority: 'LOW' },
    { date: '03/31/2026', time: '10:58 AM', type: 'REPORT', module: 'WebsiteCrashes', priority: 'MEDIUM' },
    { date: '04/02/2026', time: '12:40 PM', type: 'PERFORMANCE', module: 'Slow loading', priority: 'HIGH' },
    { date: '04/02/2026', time: '9:23 AM', type: 'SECURITY', module: 'DatabaseFirewall', priority: 'CRITICAL' },
  ];

  // //INSTRUCTION FOR BACKEND: Sync with AuditLogs.jsx API
  const mockAuditLogs = [
    { name: 'Geraldine Bardon', ip: '192.168.1.12', role: 'STAFF', desc: 'Updated doctor schedule', time: '04/23/2026 4:45:20 PM' },
    { name: 'Juan Dela Cruz', ip: '192.168.1.45', role: 'PATIENT', desc: 'User has logged in', time: '04/23/2026 2:12:33 PM' },
    { name: 'Rachel Mawac', ip: '192.168.1.17', role: 'ADMIN', desc: 'Deactivate user Maria Dela Cruz', time: '04/23/2026 12:26:49 PM' },
    { name: 'Camila Garcia', ip: '192.168.1.47', role: 'STAFF', desc: 'Approved reservation for Julia Santos', time: '04/23/2026 10:51:08 AM' },
    { name: 'GABAY System', ip: 'Localhost', role: 'SYSTEM', desc: 'Automatic backup complete', time: '04/23/2026 9:45:20 AM' },
  ];

  // --- 4. CHART & FILTER LOGIC ---
  const filterableDatasets = {
    Daily: { labels: ['6AM', '12PM', '6PM'], counts: [5, 12, 8], capacity: 18, step: 5 },
    Weekly: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], counts: [12, 19, 15, 8, 22, 30, 10], capacity: 15, step: 10 },
    Monthly: { labels: ['W1', 'W2', 'W3', 'W4'], counts: [85, 92, 78, 110], capacity: 10, step: 20 },
    Annually: { labels: ['Jan', 'Jun', 'Dec'], counts: [450, 610, 590], capacity: 12, step: 100 }
  };

  const activeData = filterableDatasets[timeFilter];
  const avgUsed = activeData.capacity;
  const usedPercentage = Math.round((avgUsed / 25) * 100);
  const maxValue = Math.max(...activeData.counts);

  // //FIX: Custom step size logic and suggestedMax to prevent overflow
  const chartOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        // Adds 20% padding above the highest point so it doesn't touch the border
        suggestedMax: maxValue + (maxValue * 0.2),
        beginAtZero: true,
        ticks: { 
          stepSize: activeData.step, 
          font: { size: 10, family: 'Poppins' }, 
          color: '#9ca3af' 
        },
        grid: { color: '#f3f4f6', drawBorder: false }
      },
      x: { grid: { display: false }, ticks: { font: { size: 10, family: 'Poppins' }, color: '#9ca3af' } }
    }
  };

  const timelineData = {
    labels: activeData.labels,
    datasets: [{
      label: 'Appointments',
      data: activeData.counts,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
    }]
  };

  const capacityData = {
    labels: ['Taken', 'Available'],
    datasets: [{
      data: [avgUsed, 25 - avgUsed],
      backgroundColor: ['#EF4444', '#22C55E'],
      borderWidth: 0,
    }]
  };

  const handleGenerateReport = () => {
    try {
      toast.loading("Preparing report...");

      // 1. Create the CSV Content starting with Header & General Stats
      let csvContent = `GABAY ADMIN SYSTEM REPORT\n`;
      csvContent += `Generated on: ${new Date().toLocaleString()}\n`;
      csvContent += `Filter Applied: ${timeFilter}\n\n`;

      csvContent += `DASHBOARD OVERVIEW\n`;
      csvContent += `Stat,Value\n`;
      csvContent += `Appointments Completed,127\n`;
      csvContent += `System Health,95%\n`;
      csvContent += `Avg Slot Capacity,${usedPercentage}% (${avgUsed}/25)\n\n`;

      // 2. Add Timeline Data
      csvContent += `APPOINTMENT TIMELINE (${timeFilter})\n`;
      csvContent += `Time/Day,Appointments\n`;
      activeData.labels.forEach((label, i) => {
        csvContent += `${label},${activeData.counts[i]}\n`;
      });
      csvContent += `\n`;

      // 3. Add Active Personnel
      csvContent += `ACTIVE PERSONNEL\n`;
      csvContent += `Name,Role,Department,Email\n`;
      mockPersonnel.forEach(p => {
        csvContent += `"${p.name}","${p.role}","${p.dept}","${p.email}"\n`;
      });
      csvContent += `\n`;

      // 4. Add Audit Logs
      csvContent += `RECENT AUDIT LOGS\n`;
      csvContent += `User,Role,Action,Timestamp\n`;
      mockAuditLogs.forEach(log => {
        csvContent += `"${log.name}","${log.role}","${log.desc}","${log.time}"\n`;
      });

      // 5. Trigger Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Gabay_Report_${timeFilter}_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.dismiss();
      toast.success("Report downloaded!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate report.");
      console.error(error);
    }
  };

  return (
    <div className="space-y-8 font-poppins">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-montserrat text-4xl font-bold text-gabay-blue">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">Main Menu &gt; <span className="text-gray-500">Dashboard</span></p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className="flex items-center gap-2 px-3 py-2 bg-white border border-gabay-teal text-gabay-teal font-semibold text-sm rounded-lg hover:bg-gray-50 transition min-w-[180px]">
              <Filter size={18} /> Filter By: {timeFilter}
              <ChevronDown size={16} className="ml-auto" />
            </button> 
            {showFilterDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                {['Daily', 'Weekly', 'Monthly', 'Annually'].map((o) => (
                  <button key={o} onClick={() => { setTimeFilter(o); setShowFilterDropdown(false); }} className="w-full text-left px-4 py-2 text-sm font-semibold text-gabay-teal hover:bg-teal-50 transition">{o}</button>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleGenerateReport} className="flex items-center gap-2 px-4 py-2 rounded-full bg-gabay-teal text-white font-semibold text-sm hover:bg-gabay-teal2 transition shadow-md">
            <Download size={18} /> Generate Reports
          </button>
        </div> 
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Appointments Completed" value="127" icon={FileCheck} color="teal" />
        <StatCard title="Issues Detected" value="0 Errors" icon={CircleAlert} color="red" />
        <StatCard title="System Health" value="95%" icon={ShieldPlus} color="blue" />
        <StatCard title="Active Personnel" value="12" icon={Stethoscope} color="green" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2.2fr_1.5fr_1.2fr] gap-6 items-stretch">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:col-span-2 content-start">
          
          {/* APPOINTMENT TIMELINE */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-montserrat text-xl font-bold text-gabay-blue mb-6">Appointment Timeline</h4>
            <div className="h-[280px]">
              <Line data={timelineData} options={chartOptions} />
            </div>
          </div>

          {/* SLOT CAPACITY */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center relative">
             <div className="flex justify-between w-full mb-6">
               <h4 className="font-montserrat text-xl font-bold text-gabay-blue">Avg. Slot Capacity</h4>
               <span className="bg-gray-100 px-3 py-1.5 rounded-md text-[12px] font-semibold text-gray-500 border border-gray-200">{avgUsed}/25 SLOTS</span>
             </div>
             <div className="w-56 h-56 relative mb-4">
               <Pie data={capacityData} options={{ plugins: { legend: { display: false } } }} />
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="font-bold text-white text-3xl">{usedPercentage}%</span>
               </div>
             </div>
             <div className="flex gap-8 text-[12px] font-semibold uppercase tracking-wider text-gray-400">
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Taken</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Available</div>
             </div>
          </div>

          {/* ACTIVE PERSONNEL */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-6">
              <h4 className="font-montserrat text-xl font-bold text-gabay-blue">Active Personnel</h4>
              <button onClick={() => navigate('/admin/personnel')} className="text-sm font-regular text-gray-400 hover:underline">See all</button>
            </div>
            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {mockPersonnel.map((person, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                    <div>
                      <p className="text-[13px] font-semibold text-gabay-blue">{person.name}</p>
                      <p className="text-[10px] text-gabay-teal font-medium uppercase">{person.dept} – {person.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-medium">{person.phone}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{person.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AUDIT LOGS */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 md:col-span-2">
             <div className="flex justify-between items-center mb-8">
              <h4 className="font-montserrat text-2xl font-bold text-gabay-blue">Audit Logs</h4>
              <button onClick={() => navigate('/admin/audit-logs')} className="text-sm font-regular text-gray-400 hover:underline">See all</button>
            </div>
            <div className="space-y-6">
              {mockAuditLogs.map((log, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div className="w-1/4">
                    <p className="font-semibold text-gabay-navy text-[13px] md:text-sm">{log.name}</p>
                    <p className="text-[11px] text-gabay-blue font-medium">{log.ip}</p>
                  </div>
                  <div className="w-20">
                    <span className={`text-[9px] md:text-[10px] font-bold px-3 py-1 rounded-full border ${
                      log.role === 'ADMIN' ? 'border-blue-400 bg-blue-50 text-blue-600' : 
                      log.role === 'STAFF' ? 'border-teal-400 bg-teal-50 text-teal-600' : 
                      log.role === 'PATIENT' ? 'border-purple-400 bg-purple-50 text-purple-600' : 'border-gray-400 bg-gray-50 text-gray-600'
                    }`}>{log.role}</span>
                  </div>
                  <div className="flex-1 px-3 italic text-gray-500 text-xs  md:text-sm"> "{log.desc}" </div>
                  <div className="text-right text-[10px] md:text-[11px] text-gray-400 font-medium w-20"> {log.time} </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6 flex flex-col h-full">
          {/* CALENDAR */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-montserrat text-xl font-bold text-gabay-blue uppercase tracking-tighter">
                {viewDate.toLocaleString('default', { month: 'long' })} {viewDate.getFullYear()}
              </h4>
              <div className="flex gap-2">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"><ChevronLeft size={20}/></button>
                <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"><ChevronRight size={20}/></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gabay-navy mb-4">
              {['S','M','T','W','TH','F','S'].map(d => <div key={d} className="opacity-70">{d}</div>)}
              <div className="col-span-7 h-[1px] bg-gray-200 my-2"></div>
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const isToday = viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear() && day === today.getDate();
                const isHoliday = holidays.includes(day);
                const isEvent = events.includes(day);
                return (
                  <div key={day} className={`p-2 rounded-md text-sm font-medium flex items-center justify-center cursor-default transition-all ${
                    isToday ? 'bg-gray-200 text-gabay-navy' : 
                    isHoliday ? 'bg-red-500 text-white' : 
                    isEvent ? 'bg-gabay-teal text-white' : 'text-gray-600'
                  }`}> {day} </div>
                );
              })}
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => { setModalDefaultType('HOLIDAY'); setIsEventModalOpen(true); }} className="flex-1 py-2 bg-red-500 text-white text-sm font-semibold rounded-full uppercase tracking-tight hover:bg-red-600 transition-color">+ Holiday</button>
              <button onClick={() => { setModalDefaultType('EVENT'); setIsEventModalOpen(true); }} className="flex-1 py-2 bg-gabay-teal text-white text-sm font-semibold rounded-full uppercase tracking-tight hover:bg-teal-600 transition-color">+ Event</button>
            </div>
          </div>

          {/* SYSTEM LOGS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-grow">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-montserrat text-xl font-bold text-gabay-blue">System Logs</h4>
              <button onClick={() => navigate('/admin/system-logs')} className="text-sm font-regular text-gray-400 hover:underline">See all</button>
            </div>
            <div className="space-y-4">
              {mockSystemLogs.slice(0, 7).map((log, i) => (
                <div key={i} className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm hover:shadow-md transition cursor-default">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-[11px] font-bold text-gabay-navy uppercase">{log.type}</p>
                      <p className="text-[10px] text-gabay-blue font-medium">{log.module}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      log.priority === 'CRITICAL' ? 'border-red-500 bg-red-50 text-red-600' : 
                      log.priority === 'HIGH' ? 'border-orange-400 bg-orange-50 text-orange-600' :
                      log.priority === 'MEDIUM' ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-gabay-green bg-green-50 text-green-600'
                    }`}>{log.priority}</span>
                  </div>
                  <p className="text-[9px] text-gray-500 font-medium">{log.date} • {log.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AddEvent isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} 
        onSave={(data) => console.log("Added:", data)} defaultType={modalDefaultType} />
    </div>
  );
}