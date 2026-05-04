import React, { useState, useRef } from 'react';
import { 
  Clock, Database, History, AlertTriangle, Save, Edit2, BellRing,
  Upload, Image as ImageIcon, Hourglass, X, CheckCircle2, HardHat
} from 'lucide-react';
import toast from 'react-hot-toast';
import gabayLogo from '../../assets/gabayLogo.png';

export default function AdminSettings() {
  // --- 1. STATE MANAGEMENT ---
  const [isEditMode, setIsEditMode] = useState(false);
  
  // //EDIT: Store a backup of settings to revert if user clicks Cancel
  const [settings, setSettings] = useState({
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    autoBackup: false,
    backupFrequency: "Weekly",
    backupTime: "12:00 AM",
    retentionValue: "3",
    retentionUnit: "years",
    maintenanceMode: false,
    appointmentBuffer: "15",
    downtimeReason: "Maintenance Mode",
    resumeTimer: "60",
  });

  const [tempSettings, setTempSettings] = useState({ ...settings });
  const [errors, setErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(gabayLogo);
  const fileInputRef = useRef(null);

  // --- 2. VALIDATION LOGIC ---
  const convertTo24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return parseInt(hours, 10);
  };

  const validate = () => {
    let newErrors = {};
    
    // Log Retention: Max 10 years / 12 months
    if (tempSettings.retentionUnit === 'years' && parseInt(tempSettings.retentionValue) > 10) {
      newErrors.retention = "Maximum retention is 10 years.";
    }
    if (tempSettings.retentionUnit === 'months' && parseInt(tempSettings.retentionValue) > 12) {
      newErrors.retention = "Months cannot exceed 12.";
    }

    // Operational Hours: 7AM - 7PM window & 8-hour cap
    const start24 = convertTo24Hour(tempSettings.startTime);
    const end24 = convertTo24Hour(tempSettings.endTime);

    if (start24 < 7) newErrors.hours = "Cannot start before 7:00 AM.";
    if (end24 > 19) newErrors.hours = "Cannot end after 7:00 PM.";
    if (end24 <= start24) newErrors.hours = "End time must be after start time.";
    if (end24 - start24 > 8) newErrors.hours = "Shift exceeds 8-hour maximum.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- 3. HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTempSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors) setErrors({});
  };

  const handleEdit = () => {
    setTempSettings({ ...settings }); // Sync temp with current saved settings
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setTempSettings({ ...settings }); // Revert temp settings
    setErrors({});
    setIsEditMode(false);
    toast("Changes cancelled.", { icon: 'ℹ️' });
  };

  const handleSave = () => {
    if (validate()) {
      setSettings({ ...tempSettings }); // Commit temp settings to actual state
      setIsEditMode(false);
      toast.success("System settings updated.");
    } else {
      toast.error("Error/s detected!");
    }
  };

  const timeOptions = [
    "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
  ];

  const backupTimeOptions = Array.from({ length: 24 }).map((_, i) => {
    const hour = i % 12 || 12;
    const ampm = i < 12 ? "AM" : "PM";
    return `${hour.toString().padStart(2, '0')}:00 ${ampm}`;
  });

  return (
    <div className="space-y-8 pb-10 font-poppins">
      {/* PLAIN HEADER (No Card) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-montserrat text-4xl font-bold text-gabay-blue">System Settings</h1>
          <p className="text-sm text-gray-500 mt-1 font-regular">Configure core settings for GABAY maintenance</p>
        </div>
        <div className="flex gap-3">
          {isEditMode ? (
            <>
              <button 
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gabay-teal text-gabay-teal rounded-full font-semibold text-sm hover:bg-gray-50 transition-all"
              >
                <X size={18} /> Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-gabay-teal text-white rounded-full font-semibold text-sm shadow-lg hover:bg-opacity-90 transition-all"
              >
                <Save size={18} /> Save Changes
              </button>
            </>
          ) : (
            <button 
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gabay-teal text-gabay-teal rounded-full font-semibold text-sm hover:bg-gray-50 transition-all"
            >
              <Edit2 size={18} /> Edit Settings
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. OPERATIONAL HOURS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-gabay-blue">
            <Clock className="p-1.5 bg-blue-50 rounded-lg" size={32} />
            <h4 className="font-montserrat font-bold text-lg">Operational Hours</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Start Time</label>
              <select 
                name="startTime"
                disabled={!isEditMode}
                value={tempSettings.startTime}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none disabled:opacity-60"
              >
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">End Time</label>
              <select 
                name="endTime"
                disabled={!isEditMode}
                value={tempSettings.endTime}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none disabled:opacity-60"
              >
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          {errors.hours && <p className="text-[11px] font-semibold text-red-500">{errors.hours}</p>}
        </div>

        {/* 2. LOG RETENTION */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-orange-500">
            <History className="p-1.5 bg-orange-50 rounded-lg" size={32} />
            <h4 className="font-montserrat font-bold text-lg text-gabay-blue">Log Retention</h4>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Purge Period</label>
              <input 
                type="text"
                name="retentionValue"
                disabled={!isEditMode}
                value={tempSettings.retentionValue}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none disabled:opacity-60"
              />
            </div>
            <select 
              name="retentionUnit"
              disabled={!isEditMode}
              value={tempSettings.retentionUnit}
              onChange={handleInputChange}
              className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm min-w-[150px] disabled:opacity-60"
            >
              <option value="years">Years</option>
              <option value="months">Months</option>
            </select>
          </div>
          {errors.retention && <p className="text-[11px] font-semibold text-red-500">{errors.retention}</p>}
        </div>

        {/* 3. DATABASE BACKUPS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-gabay-teal">
            <Database className="p-1.5 bg-teal-50 rounded-lg" size={32} />
            <h4 className="font-montserrat font-bold text-lg text-gabay-blue">System Backups</h4>
            </div>
            
            <div className="flex items-center gap-4">
            {/* Toggle moved to header for a cleaner layout */}
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                type="checkbox" 
                name="autoBackup" 
                disabled={!isEditMode} 
                checked={tempSettings.autoBackup} 
                onChange={handleInputChange} 
                className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gabay-teal"></div>
            </label>
            
            <button 
              disabled={!isEditMode} 
              className="text-[10px] font-bold text-gabay-teal border border-gabay-teal px-4 py-2 rounded-lg hover:bg-teal-50 disabled:opacity-30 transition-colors"
              onClick={async () => {
                  // // TO THE BACKEND DEV: This triggers the system-wide backup process. 
                  // // Please ensure the endpoint handles authentication, database dumping, 
                  // // and returns a 200 status once the process is successfully initiated.
                  try {
                      const response = await fetch('/api/admin/backup', { method: 'POST' });
                      if (response.ok) alert('Backup started successfully!');
                  } catch (err) {
                      console.error('Backup failed:', err);
                  }
              }}
          >
              BACKUP NOW
          </button>
            </div>
        </div>

        {/* SYSTEM BACKUP */}
        <div className={`grid grid-cols-2 gap-4 transition-opacity duration-300 ${tempSettings.autoBackup ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Frequency</label>
            <select 
                name="backupFrequency"
                disabled={!isEditMode}
                value={tempSettings.backupFrequency}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none disabled:opacity-60 focus:border-gabay-teal transition-all"
            >
                <option value="Daily">Daily</option>
                <option value="Every 3 days">Every 3 days</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-Weekly">Bi-Weekly</option>
                <option value="Monthly">Monthly</option>
            </select>
            </div>

            <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Scheduled Time</label>
            <select 
                name="backupTime"
                disabled={!isEditMode}
                value={tempSettings.backupTime}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none disabled:opacity-60 focus:border-gabay-teal transition-all"
            >
                {backupTimeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            </div>
        </div>
        
        {!tempSettings.autoBackup && isEditMode && (
            <p className="text-[10px] text-gray-400 italic text-center">
            Enable toggle to schedule automatic backups.
            </p>
        )}
        </div>

        {/* 4. SYSTEM DOWNTIME */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-red-500">
            <HardHat className="p-1.5 bg-red-50 rounded-lg" size={32} />
            <h4 className="font-montserrat font-bold text-lg text-gabay-blue">System Downtime</h4>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
            <input 
                type="checkbox" 
                name="maintenanceMode" 
                disabled={!isEditMode} 
                checked={tempSettings.maintenanceMode} 
                onChange={handleInputChange} 
                className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity duration-300 ${tempSettings.maintenanceMode ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block text-left">Downtime Reason</label>
            <select 
                name="downtimeReason"
                disabled={!isEditMode}
                value={tempSettings.downtimeReason}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none disabled:opacity-60"
            >
                <option value="Maintenance Mode">Maintenance Mode</option>
                <option value="Data Backup">Data Backup</option>
                <option value="System Optimization">System Optimization</option>
            </select>
            </div>
            <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block text-left">Auto-Resume In</label>
            <select 
                name="resumeTimer"
                disabled={!isEditMode}
                value={tempSettings.resumeTimer}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none disabled:opacity-60"
            >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="0">Never (Manual)</option>
            </select>
            </div>
        </div>

        {!tempSettings.maintenanceMode && isEditMode && (
            <p className="text-[10px] text-gray-400 italic text-center">
            Enable toggle if there is system downtime.
            </p>
        )}

        {tempSettings.maintenanceMode && (
            <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <p className="text-[11px] font-bold text-red-600 uppercase">
                GABAY is currently restricted for patients.
            </p>
            </div>
        )}
        </div>

      </div>
    </div>
  );
}