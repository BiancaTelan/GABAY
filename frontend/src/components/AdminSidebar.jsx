import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserRoundCog, Building2, 
  CalendarCheck, Activity, Terminal, FileBarChart, 
  LogOut, Settings, Menu 
} from 'lucide-react';

export default function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  const menuGroups = [
    {
      title: "MAIN MENU",
      items: [
        { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={22} /> },
        { name: 'Users', path: '/admin/users', icon: <Users size={22} /> },
        { name: 'Personnel', path: '/admin/personnel', icon: <UserRoundCog size={22} /> },
        { name: 'Departments', path: '/admin/departments', icon: <Building2 size={22} /> },
        { name: 'Appointments', path: '/admin/appointments', icon: <CalendarCheck size={22} /> },
      ]
    },
    {
      title: "SYSTEM",
      items: [
        { name: 'Audit Logs', path: '/admin/audit-logs', icon: <Activity size={22} /> },
        { name: 'System Logs', path: '/admin/system-logs', icon: <Terminal size={22} /> },
        { name: 'Reports', path: '/admin/reports', icon: <FileBarChart size={22} /> },
      ]
    }
  ];

  return (
    <aside className="flex flex-col h-full py-6 transition-all duration-300">
      {/* Menu Toggle */}
      <div className={`px-6 mb-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
        <Menu 
          className="text-gray-400 cursor-pointer hover:text-[#3B82F6] transition-colors" 
          size={24} 
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-8">
        {menuGroups.map((group) => (
          <div key={group.title}>
            {!isCollapsed && (
              <p className="text-[11px] font-bold text-gray-400 tracking-widest mb-4 px-2">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  title={isCollapsed ? item.name : ""}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg transition-all duration-300 text-sm font-poppins font-medium ${
                      isActive ? 'bg-[#EBF2FF] text-[#3B82F6]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <div className="flex-shrink-0 w-5 flex justify-center">
                    {item.icon}
                  </div>

                  <span 
                    className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
                      ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100 delay-100'}`}>
                    {item.name}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 mt-auto pt-5 border-t border-gray-100 space-y-1">
        <button className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 w-full font-poppins text-gray-500 hover:text-gray-900 text-sm transition-all`}>
          <Settings size={22} /> 
          {!isCollapsed && <span>Settings</span>}
        </button>
        <button className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 w-full font-poppins text-gabay-teal hover:bg-teal-50 rounded-lg text-sm transition-all font-semibold`}>
          <LogOut size={22} /> 
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}