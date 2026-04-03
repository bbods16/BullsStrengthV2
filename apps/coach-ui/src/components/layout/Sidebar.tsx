import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export const Sidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Athletes', path: '/athletes' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="glass-panel w-64 h-screen fixed left-0 top-0 p-4 flex flex-col">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="w-8 h-8 bg-[#8251EE] rounded-lg shadow-[0_0_15px_rgba(130,81,238,0.5)] flex items-center justify-center font-bold text-white">
          W
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">WeightRoom</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2 rounded-lg transition-all
              ${isActive 
                ? 'bg-[#8251EE] text-white shadow-[0_0_15px_rgba(130,81,238,0.3)]' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-white/5">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/5 w-full transition-all">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
