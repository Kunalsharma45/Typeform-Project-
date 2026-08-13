'use client';

import toast from 'react-hot-toast';
import {
  Grid2x2Plus,
  Palette,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

export default function TopBar() {
  const showComingSoon = () => {
    toast('Coming soon', { icon: '🚧' });
  };

  return (
    <header className="w-full bg-white border-b border-gray-200/80 px-4 py-2.5 flex items-center justify-between z-30 sticky top-0">
      {/* Far Left: Vertical black accent bar + Workspace Switcher */}
      <div className="flex items-center gap-3">
        {/* Vertical black indicator pill */}
        <div className="w-1.5 h-6 bg-[#18181b] rounded-full flex-shrink-0" />

        {/* Workspace Account Switcher */}
        <button
          onClick={showComingSoon}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-[#d9534f] text-white font-bold text-xs flex items-center justify-center shadow-xs">
            K
          </div>
          <span className="text-sm font-semibold text-gray-900 tracking-tight">
            kunalsharma1165
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 stroke-[2.5]" />
        </button>
      </div>

      {/* Far Right: Integrations, Brand Kit, View Plans, Help, User Avatar */}
      <div className="flex items-center gap-5">
        <button
          onClick={showComingSoon}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
        >
          <Grid2x2Plus className="w-4 h-4 text-gray-600 stroke-[2]" />
          Integrations
        </button>

        <button
          onClick={showComingSoon}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
        >
          <Palette className="w-4 h-4 text-gray-600 stroke-[2]" />
          Brand kit
        </button>

        <button
          onClick={showComingSoon}
          className="bg-[#026440] hover:bg-[#015233] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors shadow-xs"
        >
          View plans
        </button>

        <button
          onClick={showComingSoon}
          className="p-1 text-gray-600 hover:text-gray-900 transition-colors rounded-full"
          title="Help"
        >
          <HelpCircle className="w-4 h-4 stroke-[2]" />
        </button>

        <div className="w-7 h-7 rounded-full bg-[#f4bcbc] text-[#5c2b2b] font-bold text-xs flex items-center justify-center flex-shrink-0 cursor-pointer shadow-xs">
          KS
        </div>
      </div>
    </header>
  );
}
