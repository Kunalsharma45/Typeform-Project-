'use client';

import { Panel } from '@xyflow/react';
import { ArrowDownRight, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PullDataPanel() {
  const showComingSoon = () => toast('Coming soon', { icon: '🚧' });

  return (
    <Panel position="top-left" className="m-6 z-10">
      <div className="w-[240px] bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <ArrowDownRight className="w-5 h-5 text-gray-600 mb-3" strokeWidth={2} />
        <h3 className="text-gray-800 font-semibold text-sm mb-1.5">Pull data in</h3>
        <p className="text-gray-500 text-xs leading-relaxed mb-4">
          Track sources, identify respondents, and personalize the form content and flow with URL parameters.
        </p>
        <button
          onClick={showComingSoon}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors bg-white shadow-sm"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </Panel>
  );
}
