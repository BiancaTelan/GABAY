import React from 'react';
import { Bell, CheckCheck, Clock, ShieldAlert } from 'lucide-react';

export default function AdminNotifs() {
  const dummyNotifs = [
    { id: 1, title: "System Update", desc: "Server maintenance scheduled for Sunday at 2:00 AM.", type: "system", time: "2h ago" },
    { id: 2, title: "Security Alert", desc: "Multiple failed login attempts detected from IP 192.168.1.1.", type: "alert", time: "5h ago" },
    { id: 3, title: "New Personnel Added", desc: "Nurse Maria Santos has been added to the Pediatrics department.", type: "user", time: "1d ago" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 font-poppins animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-gabay-teal">Notifications</h1>
          <p className="text-gray-500">Stay updated with system activities</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-gabay-blue hover:underline">
          <CheckCheck size={18} /> Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {dummyNotifs.map((n) => (
          <div key={n.id} className="flex items-start gap-4 p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className={`p-3 rounded-lg ${n.type === 'alert' ? 'bg-red-50' : 'bg-blue-50'}`}>
              {n.type === 'alert' ? <ShieldAlert className="text-red-500" size={20} /> : <Bell className="text-gabay-blue" size={20} />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-gabay-blue">{n.title}</h3>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> {n.time}</span>
              </div>
              <p className="text-sm text-gray-600">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}