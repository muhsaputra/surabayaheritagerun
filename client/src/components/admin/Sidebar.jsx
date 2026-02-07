import React from "react";
import {
  LayoutDashboard,
  QrCode,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "scan", label: "Scan QR Check-in", icon: QrCode },
    // { id: "logs", label: "Activity Logs", icon: ClipboardList },
    { id: "settings", label: "Pengaturan Event", icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col fixed left-0 top-0 z-50 shadow-2xl hidden md:flex border-r border-slate-800">
      <div className="p-8 border-b border-slate-800">
        <h2 className="text-2xl font-serif font-bold tracking-tight">
          Admin<span className="text-red-600 italic">Panel</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Surabaya Heritage Run 2026
        </p>
      </div>
      <nav className="flex-1 py-6 space-y-2 px-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
              activeTab === item.id
                ? "bg-red-600 text-white shadow-lg shadow-red-900/50 font-bold translate-x-1"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <item.icon size={20} /> {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-xl transition text-sm font-bold"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
