import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, User, Clock, FileText } from 'lucide-react';

const mockAuditLogs = [
  { id: 'LOG-881', user: 'Admin_Zack', action: 'Modified Personnel', target: 'DOC001', timestamp: '2026-03-26 14:30:05', ip: '192.168.1.45' },
  { id: 'LOG-880', user: 'Staff_Ana', action: 'Confirmed Appointment', target: 'APP-2026-001', timestamp: '2026-03-26 13:15:22', ip: '192.168.1.12' },
  { id: 'LOG-879', user: 'Admin_Zack', action: 'Deleted Department', target: 'Radiology', timestamp: '2026-03-26 11:00:10', ip: '192.168.1.45' },
  { id: 'LOG-878', user: 'System', action: 'Auto-Backup', target: 'Database_Main', timestamp: '2026-03-26 00:00:01', ip: 'Localhost' },
];

export default function AuditLogs() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-gabay-blue underline decoration-gabay-teal decoration-4">Audit Trail</h1>
        <p className="text-xs md:text-sm font-poppins text-gray-500">System &gt; User Activity Logs</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left font-poppins text-sm">
          <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Target ID</th>
              <th className="px-6 py-4 text-right">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockAuditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 text-xs font-mono text-gray-500">{log.timestamp}</td>
                <td className="px-6 py-4 flex items-center gap-2 font-medium text-gray-800">
                   <User size={14} className="text-gabay-teal" /> {log.user}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-[11px] font-bold uppercase">{log.action}</span>
                </td>
                <td className="px-6 py-4 font-mono text-blue-600">{log.target}</td>
                <td className="px-6 py-4 text-right text-xs text-gray-400">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}