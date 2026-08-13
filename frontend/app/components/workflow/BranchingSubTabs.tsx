'use client';

import toast from 'react-hot-toast';
import { Settings } from 'lucide-react';

interface BranchingSubTabsProps {
  activeTab?: 'branching';
}

const TABS = [
  { id: 'branching', label: 'Branching', active: true },
  { id: 'scoring', label: 'Scoring', active: false },
  { id: 'tagging', label: 'Tagging', active: false },
  { id: 'outcome', label: 'Outcome quiz', active: false },
];

export default function BranchingSubTabs({}: BranchingSubTabsProps) {
  const handleComingSoon = () => toast('Coming soon', { icon: '🚧' });

  return (
    <div className="w-full bg-white border-b border-gray-200/80 px-4 py-1.5 flex items-center justify-between">
      <div className="flex items-center gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={tab.active ? undefined : handleComingSoon}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              tab.active
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <button
        onClick={handleComingSoon}
        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
}
