import React from 'react';
import { 
  FileCheck, Stethoscope, ShieldPlus, ClipboardList, 
  Plus, DownloadCloud, ExternalLink 
} from 'lucide-react';
import StatCard from '../../components/StatCard';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-montserrat text-3xl font-bold text-gabay-blue">Dashboard</h1>
          <p className="font-poppins text-sm text-gray-500 mt-1">
            Home &gt; <span className="text-gray-700 font-medium">Dashboard</span>
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium font-poppins text-sm rounded-lg hover:bg-gray-50 transition">
            Filter By: This Month
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gabay-teal text-gabay-teal font-medium font-poppins text-sm rounded-lg hover:bg-teal-50 transition">
            <Plus size={18} />
            Generate Reports
          </button>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Appointments Completed" value="127" icon={FileCheck} color="teal" />
        <StatCard title="Slot Capacity" value="12/25" icon={ClipboardList} color="orange" />
        <StatCard title="System Health" value="95%" icon={ShieldPlus} color="blue" />
        <StatCard title="Active Personnel" value="12" icon={Stethoscope} color="green" />
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1.5fr_1fr] gap-6 items-start">
        
        {/* LEFT & CENTER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:col-span-2">
          
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
            <div className="flex justify-between mb-4">
              <h4 className="font-montserrat text-lg font-bold text-gabay-blue flex items-center gap-2">
                Appointment Timeline <ExternalLink size={16} className="text-gray-400" />
              </h4>
              <span className="text-sm text-gray-outline font-poppins">Filter: This Month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[200px]">
             <h4 className="font-montserrat text-lg font-bold text-gabay-blue flex items-center gap-2">
              Slot Capacity <ExternalLink size={16} className="text-gray-400" />
            </h4>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-6">
              <h4 className="font-montserrat text-lg font-bold text-gabay-blue flex items-center gap-2">
                Online Staff <ExternalLink size={16} className="text-gray-400" />
              </h4>
              <button className="text-sm text-gray-outline font-medium font-poppins hover:underline">See all</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
             <div className="flex justify-between items-center mb-6">
              <h4 className="font-montserrat text-lg font-bold text-gabay-blue flex items-center gap-2">
                Audit Logs <ExternalLink size={16} className="text-gray-400" />
              </h4>
              <button className="text-sm text-gray-outline font-medium font-poppins hover:underline">See all</button>
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[250px]">
            <h4 className="font-montserrat text-lg font-bold text-gabay-blue">Calendar</h4>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-montserrat text-lg font-bold text-gabay-blue mb-6">System Logs</h4>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                  <div className="space-y-1">
                    <p className="font-poppins text-sm font-semibold text-gray-900">Version 1.5</p>
                    <p className="font-poppins text-xs text-gray-500">System Update &nbsp; 9:30 AM</p>
                  </div>
                  <DownloadCloud size={18} className="text-gray-400 cursor-pointer hover:text-gray-700" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}