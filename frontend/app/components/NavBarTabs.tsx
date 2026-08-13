'use client';

import toast from 'react-hot-toast';
import {
  FileText,
  Users,
  Workflow,
  BookOpen,
  FilePlus,
} from 'lucide-react';

export default function NavBarTabs() {
  const showComingSoon = () => {
    toast('Coming soon', { icon: '🚧' });
  };

  return (
    <div className="w-full bg-[#f6f6f6] border-b border-gray-200/80 px-6 py-2 flex items-center gap-4 text-xs font-semibold text-gray-600">
      {/* Forms Tab (Active) */}
      <button className="bg-gray-200/70 text-gray-900 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-xs border-b-2 border-gray-900 font-bold transition-all">
        <FileText className="w-4 h-4 text-gray-800 stroke-[2]" />
        <span>Forms</span>
      </button>

      {/* Contacts Tab */}
      <button
        onClick={showComingSoon}
        className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg flex items-center gap-2 transition-all"
      >
        <Users className="w-4 h-4 text-gray-500 stroke-[2]" />
        <span>Contacts</span>
      </button>

      {/* Automations Tab */}
      <button
        onClick={showComingSoon}
        className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg flex items-center gap-2 transition-all"
      >
        <Workflow className="w-4 h-4 text-gray-500 stroke-[2]" />
        <span>Automations</span>
      </button>

      {/* Pages Tab */}
      <button
        onClick={showComingSoon}
        className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg flex items-center gap-2 transition-all"
      >
        <BookOpen className="w-4 h-4 text-gray-500 stroke-[2]" />
        <span>Pages</span>
        <span className="text-[10px] font-semibold bg-[#e0f2fe] text-[#0284c7] px-1.5 py-0.5 rounded-full border border-[#bae6fd]">
          Beta
        </span>
      </button>

      {/* Vertical Divider */}
      <div className="w-px h-4 bg-gray-300 mx-1" />

      {/* Research Flow Tab */}
      <button
        onClick={showComingSoon}
        className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg flex items-center gap-2 transition-all"
      >
        <FilePlus className="w-4 h-4 text-gray-500 stroke-[2]" />
        <span>Research Flow</span>
        <span className="text-[10px] font-semibold bg-[#e0f2fe] text-[#0284c7] px-1.5 py-0.5 rounded-full border border-[#bae6fd]">
          Demo
        </span>
      </button>
    </div>
  );
}
