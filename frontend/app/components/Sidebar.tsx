'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Mic,
  Send,
} from 'lucide-react';

interface SidebarProps {
  formCount: number;
  totalResponses: number;
  onCreateForm: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function Sidebar({
  formCount,
  totalResponses,
  onCreateForm,
  searchQuery,
  onSearchChange,
}: SidebarProps) {
  const [isPrivateOpen, setIsPrivateOpen] = useState(true);

  const showComingSoon = () => {
    toast('Coming soon', { icon: '🚧' });
  };

  const responseLimit = 10;
  const progressPercent = Math.min(
    Math.round((totalResponses / responseLimit) * 100),
    100
  );

  return (
    <aside className="w-[280px] min-w-[280px] bg-white border-r border-gray-200 flex flex-col justify-between p-5 min-h-[calc(100vh-57px)]">
      {/* Top section */}
      <div className="space-y-6">
        {/* Create Form Button */}
        <button
          onClick={onCreateForm}
          className="w-full bg-[#262627] hover:bg-black text-white font-semibold text-sm py-2.5 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create form
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-transparent border-0 focus:outline-none placeholder-gray-400 text-gray-900"
          />
        </div>

        {/* Workspaces Section */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
            <span className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-gray-500" />
              Workspaces
            </span>
            <button
              onClick={showComingSoon}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
              title="Add workspace"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Private Group */}
          <div className="space-y-1">
            <button
              onClick={() => setIsPrivateOpen(!isPrivateOpen)}
              className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 py-1 hover:text-gray-700 transition-colors"
            >
              <span>Private</span>
              {isPrivateOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {isPrivateOpen && (
              <div className="pl-1">
                <div className="bg-gray-100/90 rounded-md px-3 py-2 text-sm font-semibold text-gray-900 flex items-center justify-between cursor-pointer">
                  <span>My workspace</span>
                  <span className="text-xs text-gray-500 font-medium">
                    {formCount}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Widgets */}
      <div className="space-y-5 pt-6 border-t border-gray-100 mt-auto">
        {/* Responses Collected Widget */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-gray-500">
            Responses collected
          </span>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 font-medium">
            {totalResponses} / {responseLimit}
          </div>
          <button
            onClick={showComingSoon}
            className="border border-gray-300 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors cursor-pointer inline-block"
          >
            Increase response limit
          </button>
        </div>

        {/* Ask Typeform AI Input Box (Stub) */}
        <div
          onClick={showComingSoon}
          className="border border-purple-200 bg-white hover:border-purple-300 rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 group-hover:text-purple-700">
            <Mic className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
            <span>Ask Typeform AI</span>
          </div>
          <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
            <Send className="w-3 h-3" />
          </div>
        </div>
      </div>
    </aside>
  );
}
