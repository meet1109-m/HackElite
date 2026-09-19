import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Trash2, 
  Camera, 
  Truck, 
  BarChart3, 
  Recycle, 
  FlaskConical, 
  Bot, 
  Sparkles,
  Sliders,
  CalendarDays,
  Globe
} from 'lucide-react';
import { useWasteData } from '../../context/WasteDataContext';

export const Sidebar = ({ currentPage, activeTab, onNavigate, onTabChange }) => {
  const currentTab = currentPage || activeTab || 'command-center';
  const handleNav = onNavigate || onTabChange;
  const { bins } = useWasteData();
  const criticalCount = bins.filter(b => b.status === 'Critical' || b.status === 'Overflow Risk').length;

  const navItems = [
    { id: 'landing', label: 'Public Portal', icon: <Globe className="w-4 h-4" /> },
    { id: 'command-center', label: 'Command Center', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'operations', label: 'Live Operations', icon: <Map className="w-4 h-4" /> },
    { 
      id: 'bins', 
      label: 'Bin Intelligence', 
      icon: <Trash2 className="w-4 h-4" />,
      badge: criticalCount > 0 ? criticalCount : null,
      badgeColor: 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]'
    },
    { id: 'vision', label: 'Waste Vision AI', icon: <Camera className="w-4 h-4" /> },
    { id: 'routes', label: 'Route Optimizer', icon: <Truck className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics & Hotspots', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'recycling', label: 'Recycling & Circularity', icon: <Recycle className="w-4 h-4" /> },
    { id: 'simulator', label: 'What-If Simulator', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'events', label: 'Events & AI Placement', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'ai-assistant', label: 'AI Waste Manager', icon: <Bot className="w-4 h-4 text-[#16845B]" /> },
    { id: 'settings', label: 'Priority Weights & IoT', icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-white/60 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none shadow-sm">
      <div className="p-3 space-y-1 overflow-y-auto flex-1">
        <div className="px-3 py-2 text-[10px] uppercase tracking-widest font-extrabold text-[#66736C]">
          Command Modules
        </div>
        {navItems.map(item => {
          const isActive = currentTab === item.id || (item.id === 'command-center' && currentTab === 'command') || (item.id === 'ai-assistant' && currentTab === 'ai-manager');
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-[#16845B] text-white shadow-md shadow-[#16845B]/20 font-bold'
                  : 'text-[#66736C] hover:text-[#17201B] hover:bg-white/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`${isActive ? 'text-white' : 'text-[#66736C] group-hover:text-[#16845B]'} transition-colors`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Status Footer & Operator Login Switch */}
      <div className="p-4 border-t border-white/60 bg-white/40 backdrop-blur-md space-y-2">
        <div className="flex items-center justify-between text-[11px] text-[#66736C]">
          <span className="flex items-center gap-1.5 font-semibold text-[#17201B]">
            <span className="w-2 h-2 rounded-full bg-[#16845B]"></span>
            Ahmedabad AMC Node
          </span>
          <span className="font-mono font-bold text-[#16845B]">ONLINE</span>
        </div>
        
        <button
          onClick={() => handleNav('login')}
          className="w-full py-1.5 px-2 bg-white/80 hover:bg-white border border-[#E3EAE6] hover:border-[#BBF7D0] rounded-lg text-[11px] font-bold text-[#17201B] hover:text-[#0B5D3B] transition flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>Operator Portal Login</span>
        </button>

        <div className="text-[10px] text-[#94A39D] text-center truncate">
          SmartBinX v1.0 • Closed-Loop AI
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
