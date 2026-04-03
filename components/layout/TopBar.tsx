"use client";

import { Bell, Search } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
      <div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="text-slate-400 hover:text-white transition-colors">
          <Search size={18} />
        </button>
        <button className="relative text-slate-400 hover:text-white transition-colors">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white">
          RG
        </div>
      </div>
    </div>
  );
}
