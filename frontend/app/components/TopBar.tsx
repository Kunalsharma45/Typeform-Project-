'use client';

import toast from 'react-hot-toast';
import { Grid2x2Plus, Palette, HelpCircle, ChevronDown } from 'lucide-react';

export default function TopBar() {
  const showComingSoon = () => {
    toast('Coming soon', { icon: '🚧' });
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      {/* Left section: Workspace & Navigation Tabs */}
      <div className="flex items-center gap-8">
        {/* Workspace Brand / Account Switcher */}
        <button
          onClick={showComingSoon}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-6 h-6 rounded bg-[#cc5550] text-white font-bold text-xs flex items-center justify-center">
            K
          </div>
          <span className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
            kunalsharma1165
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {/* Top Header Navigation Tabs */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <button className="text-gray-900 font-semibold border-b-2 border-gray-900 pb-1.5 pt-1 px-1">
            Forms
          </button>
          <button
            onClick={showComingSoon}
            className="text-gray-500 hover:text-gray-900 transition-colors pb-1.5 pt-1 px-1"
          >
            Contacts
          </button>
          <button
            onClick={showComingSoon}
            className="text-gray-500 hover:text-gray-900 transition-colors pb-1.5 pt-1 px-1"
          >
            Automations
          </button>
          <button
            onClick={showComingSoon}
            className="text-gray-500 hover:text-gray-900 transition-colors pb-1.5 pt-1 px-1 flex items-center gap-1.5"
          >
            Pages
            <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200">
              Beta
            </span>
          </button>
          <button
            onClick={showComingSoon}
            className="text-gray-500 hover:text-gray-900 transition-colors pb-1.5 pt-1 px-1 flex items-center gap-1.5"
          >
            Research Flow
            <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100">
              Demo
            </span>
          </button>
        </nav>
      </div>

      {/* Right section: Integrations, Brand Kit, View Plans, Help, Avatar */}
      <div className="flex items-center gap-5">
        <button
          onClick={showComingSoon}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
        >
          <Grid2x2Plus className="w-4 h-4 text-gray-600" />
          Integrations
        </button>

        <button
          onClick={showComingSoon}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
        >
          <Palette className="w-4 h-4 text-gray-600" />
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
          className="p-1 text-gray-500 hover:text-gray-900 transition-colors rounded-full"
          title="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="w-7 h-7 rounded-full bg-[#d98b88] text-white font-semibold text-xs flex items-center justify-center flex-shrink-0 cursor-pointer shadow-xs">
          KS
        </div>
      </div>
    </header>
  );
}
