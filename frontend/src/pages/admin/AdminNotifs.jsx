import React, { useState, useEffect, useRef, useContext } from 'react';
import { Bell, CheckCheck, Clock, Filter, ChevronLeft, ChevronRight, ShieldAlert, UserPlus } from 'lucide-react';
import { AuthContext } from '../../authContext';
import toast from 'react-hot-toast';

export default function AdminNotifs() {
  const { token } = useContext(AuthContext);
  
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('None');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const rowsPerPage = 8;

  // --- ADDED: SHORTHAND TIME HELPER ---
  const formatTimeShort = (hoursOffset) => {
    if (hoursOffset === 0) return "1m ago";
    if (hoursOffset < 24) return `${hoursOffset}h ago`;
    
    const days = Math.floor(hoursOffset / 24);
    if (days < 7) return `${days}d ago`;
    
    const weeks = Math.floor(days / 7);
    if (days < 30) return `${weeks}w ago`;
    
    const months = Math.floor(days / 30);
    if (days < 365) return `${months}mo ago`;
    
    const years = Math.floor(days / 365);
    return `${years}y ago`;
  };

  const filterOptions = [
    { label: 'Filter: None', value: 'None' },
    { label: 'System Updates', value: 'system' },
    { label: 'Security Alerts', value: 'alert' },
    { label: 'Personnel Activity', value: 'personnel' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredNotifications = notifications.filter(n => {
    if (filter === "None") return true;
    return n.type === filter;
  });

  const handleMarkAllRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Could not update notifications");
    }
  };

  // --- EDITED: DUMMY DATA FOR TESTING SHORTHAND ---
  const dummyData = Array.from({ length: 40 }).map((_, i) => {
    // Multiplying i to simulate time jumping forward across categories
    const hoursOffset = i * 20; 

    return {
      id: i + 1,
      title: i % 5 === 0 ? "Security Alert" : i % 3 === 0 ? "New Personnel Added" : "System Update",
      timeAgo: formatTimeShort(hoursOffset),
      description: i % 5 === 0 ? "Multiple failed login attempts detected from IP 192.168.1.1." : "The scheduled maintenance will take place 3 hours from now.",
      isRead: i > 2,
      type: i % 5 === 0 ? "alert" : i % 3 === 0 ? "personnel" : "system"
    };
  });

  useEffect(() => {
    setNotifications(dummyData);
  }, [filter]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredNotifications.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredNotifications.length / rowsPerPage);

  const getIcon = (type) => {
    switch(type) {
      case 'alert': return { icon: <ShieldAlert size={18} />, bg: 'bg-red-50', text: 'text-red-500' };
      case 'personnel': return { icon: <UserPlus size={18} />, bg: 'bg-blue-50', text: 'text-gabay-blue' };
      default: return { icon: <Bell size={18} />, bg: 'bg-blue-50', text: 'text-gabay-blue' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 font-poppins text-left animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-gabay-blue leading-tight">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">Stay updated with system alerts</p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 pl-3 pr-8 py-1.5 border border-gabay-teal rounded-lg text-xs font-medium text-gabay-teal bg-white hover:bg-teal-50 transition-all duration-200"
            >
              <Filter size={14} className="text-gabay-teal" />
              <span>{filterOptions.find(opt => opt.value === filter)?.label}</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full mt-2 w-full min-w-[180px] bg-white shadow-xl rounded-xl overflow-hidden z-50 border-none animate-in fade-in slide-in-from-top-1 duration-200">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilter(option.value);
                      setCurrentPage(1);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                      filter === option.value 
                      ? 'bg-gabay-teal text-white' 
                      : 'text-gabay-teal hover:bg-teal-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-gabay-teal text-xs font-semibold hover:text-gabay-teal2 underline transition-colors"
          >
            <CheckCheck size={16} /> Mark all as read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 min-h-[500px]">
        {currentRows.map((n) => {
          const style = getIcon(n.type);
          return (
            <div 
              key={n.id} 
              className={`group flex items-center gap-4 p-3 md:p-4 bg-white border border-gray-100 rounded-md shadow-sm hover:shadow-md transition-all cursor-pointer ${!n.isRead ? 'border-l-4 border-l-gabay-blue' : 'opacity-75'}`}
            >
              <div className={`shrink-0 p-2.5 rounded-md ${style.bg} ${style.text}`}>
                {style.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="font-bold text-gabay-blue text-sm md:text-base truncate mr-2">
                    {n.title}
                  </h3>
                  {/* --- EDITED: WHITESPACE-NOWRAP FOR SHORTHAND --- */}
                  <span className="shrink-0 flex items-center gap-1 text-[10px] md:text-xs text-gray-400 font-medium whitespace-nowrap">
                    <Clock size={12} /> {n.timeAgo}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-500 truncate md:whitespace-normal line-clamp-1 md:line-clamp-2">
                  {n.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Container */}
      <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-6">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 text-gabay-blue disabled:text-gray-200"
          >
            <ChevronLeft size={18} />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-7 h-7 rounded-md text-sm font-bold transition-all ${
                currentPage === i + 1 ? 'bg-gabay-blue text-white shadow-sm' : 'text-gabay-blue hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 text-gabay-blue disabled:text-gray-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">
          Showing {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredNotifications.length)} of {filteredNotifications.length} entries
        </p>
      </div>
    </div>
  );
}