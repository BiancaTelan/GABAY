import React from 'react';
import { Bell, CheckCheck, Clock, Calendar, User, Info } from 'lucide-react';

export default function StaffNotifs() {
  const dummyNotifs = [
    { 
      id: 1, 
      title: "New Appointment Request", 
      desc: "A new booking has been made for Dr. Reyes in the Cardiology department.", 
      type: "appointment", 
      time: "15m ago" 
    },
    { 
      id: 2, 
      title: "Schedule Update", 
      desc: "Your shift for tomorrow has been updated by the Admin.", 
      type: "schedule", 
      time: "3h ago" 
    },
    { 
      id: 3, 
      title: "Patient Checked-in", 
      desc: "Patient Juan Dela Cruz has arrived for her 4:30 PM consultation.", 
      type: "status", 
      time: "5h ago" 
    },
    { 
      id: 4, 
      title: "System Maintenance", 
      desc: "The GABAY portal will be undergoing a quick update tonight at 11:00 PM.", 
      type: "system", 
      time: "1d ago" 
    },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="text-gabay-blue" size={20} />;
      case 'schedule':
        return <Clock className="text-orange-500" size={20} />;
      case 'status':
        return <User className="text-green-500" size={20} />;
      default:
        return <Info className="text-gray-500" size={20} />;
    }
  };
  
  const getBgColor = (type) => {
    switch (type) {
      case 'appointment': return 'bg-blue-50';
      case 'schedule': return 'bg-orange-50';
      case 'status': return 'bg-green-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 font-poppins animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-10 text-left">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-gabay-teal">Notifications</h1>
          <p className="text-gray-500">Manage your daily tasks and updates</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-gabay-blue hover:underline">
          <CheckCheck size={18} /> Mark all as read
        </button>
      </div>

      <div className="space-y-4 text-left">
        {dummyNotifs.map((n) => (
          <div 
            key={n.id} 
            className="flex items-start gap-4 p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className={`p-3 rounded-lg transition-colors ${getBgColor(n.type)}`}>
              {getIcon(n.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-gabay-blue group-hover:text-gabay-teal transition-colors">
                  {n.title}
                </h3>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12}/> {n.time}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{n.desc}</p>
            </div>
          </div>
        ))}
        
        {dummyNotifs.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Bell className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500">No new notifications at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}