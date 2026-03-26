import React, { useState } from 'react';
import { 
  Search, Download, ListFilter, 
  AlertCircle, Info, XCircle, Activity, Server 
} from 'lucide-react';

// --- MOCK DATA (Server Events) ---
const mockSystemLogs = [
  { id: 1, level: 'ERROR', message: 'Failed to connect to SMS Gateway API', module: 'NotificationService', time: '2026-03-26 14:45:01' },
  { id: 2, level: 'WARNING', message: 'High memory usage detected (85%)', module: 'ServerCore', time: '2026-03-26 14:30:12' },
  { id: 3, level: 'INFO', message: 'New user registered via Mobile App', module: 'AuthModule', time: '2026-03-26 14:25:55' },
  { id: 4, level: 'ERROR', message: 'Database query timeout - 5000ms', module: 'DB_Adapter', time: '2026-03-26 14:10:00' },
  { id: 5, level: 'INFO', message: 'Weekly backup completed successfully', module: 'BackupSystem', time: '2026-03-26 00:00:05' },
];

const levelStyles = {
  ERROR: 'bg-red-50 text-red-600 border-red-100',
  WARNING: 'bg-amber-50 text-amber-600 border-amber-100',
  INFO: 'bg-blue-50 text-blue-600 border-blue-100',
};

export default function SystemLogs() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-gabay-blue">System Health Logs</h1>
        <p className="text-xs md:text-sm font-poppins text-gray-500">Maintenance &gt; System Logs</p>
      </div>

      {/* STATS OVERVIEW CARDS (Optional, but looks great for Admins) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Server size={24} /></div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400">Server Status</p>
            <p className="text-lg font-bold text-gray-800">Operational</p>
          </div>
        </div>
        <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Activity size={24} /></div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400">Avg Response Time</p>
            <p className="text-lg font-bold text-gray-800">124ms</p>
          </div>
        </div>
        <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg"><XCircle size={24} /></div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400">Critical Errors (24h)</p>
            <p className="text-lg font-bold text-gray-800">2</p>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-poppins text-sm">
            <thead className="bg-gabay-blue text-white uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockSystemLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-gray-400 whitespace-nowrap">{log.time}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded border text-[10px] font-bold ${levelStyles[log.level]}`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gabay-teal text-xs tracking-wide">{log.module}</td>
                  <td className="px-6 py-4 text-gray-600">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}