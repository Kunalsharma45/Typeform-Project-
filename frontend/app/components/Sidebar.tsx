'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

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
    <aside className="w-[280px] min-w-[280px] bg-white flex flex-col justify-between pt-6 px-6 pb-6 border-r border-gray-100 min-h-[calc(100vh-57px)]">
      <div className="space-y-6">
        {/* Create Form Button */}
        <button
          onClick={onCreateForm}
          className="w-full bg-[#191919] hover:bg-black text-white font-semibold text-[15px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
            <path fill="currentColor" d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
          Create form
        </button>

        {/* Search */}
        <div className="flex items-center gap-3 px-2 py-1 cursor-pointer group">
          <div className="text-gray-400 group-hover:text-gray-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path fill="currentColor" d="M7.219 2.5a4.719 4.719 0 1 0 0 9.438 4.719 4.719 0 0 0 0-9.438M1 7.219a6.219 6.219 0 1 1 11.115 3.835l2.665 2.666a.75.75 0 1 1-1.06 1.06l-2.666-2.665A6.219 6.219 0 0 1 1 7.219" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-[15px] bg-transparent border-0 focus:outline-none placeholder-gray-500 text-gray-900 font-medium"
          />
        </div>

        {/* Workspaces Section */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2 py-1 text-[13px] font-semibold text-gray-500 uppercase tracking-wide">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path fill="currentColor" d="M3.324 1H6.75a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-.75.75h-5A.75.75 0 0 1 1 6.75V3.324c0-.258 0-.494.016-.692.018-.213.057-.446.175-.676a1.75 1.75 0 0 1 .765-.765c.23-.118.463-.157.676-.175C2.83 1 3.066 1 3.324 1M2.63 2.53h.001zm.002-.001a.6.6 0 0 1 .121-.018c.13-.01.304-.011.596-.011H6V6H2.5V3.35c0-.292 0-.467.011-.596a.6.6 0 0 1 .018-.12.25.25 0 0 1 .104-.105m-.103.102v.001zm10.716-.12a8 8 0 0 0-.596-.011H10V6h3.5V3.35c0-.292 0-.467-.011-.596a.6.6 0 0 0-.018-.12.25.25 0 0 0-.104-.105.6.6 0 0 0-.121-.018m.123.019h-.001zm.101.1v.002zm-.102-1.614c.213.018.446.057.676.175.33.168.598.435.765.765.118.23.158.463.175.676.016.198.016.434.016.692V6.75a.75.75 0 0 1-.75.75h-5a.75.75 0 0 1-.75-.75v-5A.75.75 0 0 1 9.25 1h3.426c.258 0 .494 0 .692.016M1 9.25a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-.75.75H3.324c-.258 0-.494 0-.692-.016a1.8 1.8 0 0 1-.676-.175 1.75 1.75 0 0 1-.765-.764 1.8 1.8 0 0 1-.175-.677C1 13.17 1 12.934 1 12.676zm1.5.75v2.65c0 .292 0 .467.011.596a.6.6 0 0 0 .018.12.25.25 0 0 0 .104.105.6.6 0 0 0 .121.018c.13.01.304.011.596.011H6V10zm.13 3.47h.002zm-.1-.1v-.002zM8.5 9.25a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 .75.75v3.426c0 .258 0 .494-.016.692a1.8 1.8 0 0 1-.175.676 1.75 1.75 0 0 1-.764.765c-.23.118-.464.158-.677.175-.198.016-.434.016-.692.016H9.25a.75.75 0 0 1-.75-.75zM10 10v3.5h2.65c.292 0 .467 0 .596-.011a.6.6 0 0 0 .12-.018.25.25 0 0 0 .105-.104.6.6 0 0 0 .018-.121c.01-.13.011-.304.011-.596V10zm3.47 3.37v-.002zm-.1.1h-.002z" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
            Workspaces
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsPrivateOpen(!isPrivateOpen)}
              className="w-full flex items-center justify-between text-[15px] font-medium text-gray-700 py-1.5 px-2 rounded hover:bg-gray-50 transition-colors"
            >
              <span>Private</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16" className={`text-gray-400 transition-transform ${isPrivateOpen ? '' : 'rotate-180'}`}>
                <path fill="currentColor" d="M7.232 5.922 4.367 9.36A1 1 0 0 0 5.135 11h5.73a1 1 0 0 0 .768-1.64L8.768 5.922a1 1 0 0 0-1.536 0"></path>
              </svg>
            </button>

            {isPrivateOpen && (
              <div className="pl-3 mt-1">
                <div className="bg-[#eaeaea] text-gray-900 rounded-lg px-3 py-2 text-[15px] font-medium flex items-center justify-between cursor-pointer">
                  <span>My workspace</span>
                  <span className="text-[13px] text-gray-600">
                    {formCount}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-6 pt-6">
        {/* Responses Collected Widget */}
        <div className="bg-[#f9f9f9] border border-gray-100 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-[13px] font-semibold text-gray-600">
            <span>Responses collected</span>
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[15px] text-gray-900 font-medium">
            {totalResponses} <span className="text-gray-500 font-normal">/ {responseLimit}</span>
          </div>
          <button
            onClick={showComingSoon}
            className="w-full border border-gray-300 text-gray-900 bg-white text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
          >
            Increase response limit
          </button>
        </div>

        {/* Ask Typeform AI */}
        <div
          onClick={showComingSoon}
          className="border border-purple-200 bg-white rounded-xl p-2.5 flex items-center justify-between cursor-pointer shadow-[0_2px_12px_rgba(107,33,168,0.06)] hover:shadow-[0_2px_16px_rgba(107,33,168,0.1)] transition-all group"
        >
          <div className="flex flex-col flex-1 pl-1">
            <div className="flex items-center justify-between w-full">
              <span className="text-[15px] text-gray-500 group-hover:text-gray-800">Ask Typeform AI</span>
              <div className="flex gap-2">
                <button className="text-gray-400 group-hover:text-purple-600 p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path fill="currentColor" d="M4 4c0-2.194 1.806-4 4-4s4 1.806 4 4v3c0 2.195-1.807 3.996-4 3.996S4 9.196 4 7zm4-2.5A2.52 2.52 0 0 0 5.5 4v3A2.517 2.517 0 0 0 8 9.497c1.366 0 2.5-1.133 2.5-2.497V4A2.52 2.52 0 0 0 8 1.5M1.842 9.787a.75.75 0 0 1 1.037.221c.832 1.282 2.502 2.88 5.12 2.88 2.62 0 4.29-1.598 5.122-2.88a.75.75 0 1 1 1.258.817c-.915 1.41-2.755 3.25-5.63 3.528v.897a.75.75 0 0 1-1.5 0v-.897c-2.874-.278-4.713-2.117-5.628-3.528a.75.75 0 0 1 .22-1.038" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </button>
                <button className="text-gray-300 group-hover:text-purple-600 bg-gray-50 group-hover:bg-purple-50 p-1.5 rounded-lg border border-gray-100 group-hover:border-purple-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path fill="currentColor" d="M2.55 4.041c-.363-1.45 1.143-2.658 2.48-1.99l8.766 4.384c1.29.645 1.29 2.485 0 3.13L5.03 13.95c-1.337.668-2.843-.54-2.48-1.99L3.54 8zM4.898 8.75l-.893 3.573a.25.25 0 0 0 .354.284l8.767-4.383a.25.25 0 0 0 0-.448L4.359 3.393a.25.25 0 0 0-.354.284l.893 3.573h1.758a.75.75 0 0 1 0 1.5z" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
