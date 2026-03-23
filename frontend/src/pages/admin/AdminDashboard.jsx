import React from 'react';
import { 
  FileCheck, ClipboardX, Percent, ClipboardList, 
  FileText, Plus, DownloadCloud, ExternalLink 
} from 'lucide-react';
import StatCard from '../../components/StatCard';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-montserrat text-3xl font-bold text-[#1F2937]">
            Dashboard
          </h1>
          <p className="font-poppins text-sm text-gray-500 mt-1">
            Home &gt; <span className="text-gray-900 font-medium">Dashboard</span>
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium font-poppins text-sm rounded-lg hover:bg-gray-50 transition">
            {/* Filter */}
            Filter By: This Month
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#14B8A6] text-[#14B8A6] font-medium font-poppins text-sm rounded-lg hover:bg-teal-50 transition">
            <Plus size={18} />
            Generate Reports
          </button>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Appointments Completed" 
          value="127" 
          icon={FileCheck} 
          color="green"  
        />
        <StatCard 
          title="Appointments Cancelled" 
          value="04" 
          icon={ClipboardX} 
          color="red" 
        />
        <StatCard 
          title="System Health" 
          value="95%" 
          icon={Percent} 
          color="blue" 
        />
        <StatCard 
          title="Appointments For Approval" 
          value="12" 
          icon={ClipboardList} 
          color="gray" 
        />
      </div>

      <div className="grid grid-cols-[2fr_1.5fr_1fr] gap-6 items-start">
        {/* COLUMN 2 */}
        <div className="col-span-2 grid grid-cols-2 gap-6">
          
          {/* Appointment Timeline */}
          <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
            <div className="flex justify-between mb-4">
              <h4 className="font-montserrat text-lg font-bold text-[#3B82F6]">
                Appointment Timeline <ExternalLink size={16} className="inline ml-1 text-gray-400" />
              </h4>
              <span className="text-sm text-gray-500 font-poppins">Filter: This Month</span>
            </div>
            {/* Chart */}
          </div>

          {/* Slot Capacity */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[200px]">
             <h4 className="font-montserrat text-lg font-bold text-[#3B82F6]">
              Slot Capacity <ExternalLink size={16} className="inline ml-1 text-gray-400" />
            </h4>
          </div>

          {/* Placeholder */}
          <div className="bg-transparent min-h-[200px]"></div>

          {/* Audit Logs */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
             <div className="flex justify-between items-center mb-6">
              <h4 className="font-montserrat text-lg font-bold text-[#3B82F6]">
                Audit Logs <ExternalLink size={16} className="inline ml-1 text-gray-400" />
              </h4>
              <button className="text-sm text-[#3B82F6] font-medium font-poppins hover:underline">
                See all
              </button>
            </div>
            {/* Log items */}
          </div>

           {/* Online Users */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
             <div className="flex justify-between items-center mb-6">
              <h4 className="font-montserrat text-lg font-bold text-[#3B82F6]">
                Online Users <ExternalLink size={16} className="inline ml-1 text-gray-400" />
              </h4>
              <button className="text-sm text-[#3B82F6] font-medium font-poppins hover:underline">
                See all
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 3 */}
        <div className="space-y-6">
          {/* Calendar */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[250px]">
            <h4 className="font-montserrat text-lg font-bold text-[#3B82F6]">Calendar</h4>
            {/* Calendar component */}
          </div>

          {/* System Logs */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-montserrat text-lg font-bold text-[#3B82F6] mb-6">System Logs</h4>
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