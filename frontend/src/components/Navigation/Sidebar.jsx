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

export const Sidebar = ({ activeTab, onTabChange }) => {
  const { bins } = useWasteData();
  const criticalCount = bins.filter(b => b.status === 'Critical' || b.status === 'Overflow Risk').length;

  const navItems = [
    { id: 'landing', label: 'Public Portal', icon: <Globe className="w-4 h-4" /> },
    { id: 'command', label: 'Command Center', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'operations', label: 'Live Operations', icon: <Map className="w-4 h-4" /> },
    { 
      id: 'bins', 
      label: 'Bin Intelligence', 
      icon: <Trash2 className="w-4 h-4" />,
      badge: criticalCount > 0 ? criticalCount : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    { id: 'vision', label: 'Waste Vision AI', icon: <Camera className="w-4 h-4" /> },
    { id: 'routes', label: 'Route Optimizer', icon: <Truck className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics & Hotspots', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'recycling', label: 'Recycling & Circularity', icon: <Recycle className="w-4 h-4" /> },
    { id: 'simulator', label: 'What-If Simulator', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'events', label: 'Events & AI Placement', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'ai-manager', label: 'AI Waste Manager', icon: <Bot className="w-4 h-4 text-emerald-400" /> },
    { id: 'settings', label: 'Priority Weights & IoT', icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-3 space-y-1 overflow-y-auto flex-1">
        <div className="px-3 py-2 text-[10px] uppercase tracking-widest font-extrabold text-slate-500">
          Command Modules
        </div>
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'} transition-colors`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-slate-800 text-slate-200'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Ahmedabad AMC Node
          </span>
          <span className="font-mono font-bold text-emerald-400">ONLINE</span>
        </div>
        <div className="text-[10px] text-slate-500 truncate">
          v1.0.0 • Closed-Loop Intelligence
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
