'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Share2, HelpCircle } from 'lucide-react';

interface WorkflowTabsProps {
  formId: number;
  formTitle: string;
}

export default function WorkflowTabs({ formId, formTitle }: WorkflowTabsProps) {
  const router = useRouter();

  return (
    <header className="w-full bg-white border-b border-gray-200/80 px-4 py-2.5 flex items-center justify-between z-30 sticky top-0">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-700 hover:text-gray-900 font-semibold cursor-pointer transition-colors"
        >
          Forms
        </button>
        <span className="text-gray-400">›</span>
        <span
          className="font-semibold text-gray-900 max-w-[200px] truncate cursor-pointer"
          onClick={() => router.push(`/forms/${formId}/edit`)}
          title={formTitle}
        >
          {formTitle}
        </span>
      </div>

      {/* Center: tabs */}
      <nav className="flex items-center gap-6 text-sm font-semibold">
        <button
          onClick={() => router.push(`/forms/${formId}/edit`)}
          className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          Content
        </button>
        <button className="text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-md transition-all">
          Workflow
        </button>
        <button
          onClick={() => toast('Coming soon', { icon: '🚧' })}
          className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          Connect
        </button>
      </nav>

      {/* Right: actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => toast('Coming soon', { icon: '🚧' })}
          className="border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share
        </button>
        <button
          onClick={() => toast('Coming soon', { icon: '🚧' })}
          className="bg-[#046a38] hover:bg-[#02522b] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors"
        >
          View plans
        </button>
        <HelpCircle className="w-4 h-4 text-gray-500" />
        <div className="w-7 h-7 rounded-full bg-[#f8c8c8] text-[#4a2626] font-bold text-xs flex items-center justify-center">
          KS
        </div>
      </div>
    </header>
  );
}
