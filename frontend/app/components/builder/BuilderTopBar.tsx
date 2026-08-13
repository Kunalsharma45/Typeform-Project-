'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ChevronRight,
  Share2,
  HelpCircle,
} from 'lucide-react';

const FormsIcon = () => (
  <svg
    className="w-4 h-4 text-gray-700 stroke-[1.8]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="7" y1="8" x2="17" y2="8" strokeLinecap="round" />
    <line x1="7" y1="12" x2="17" y2="12" strokeLinecap="round" />
    <line x1="7" y1="16" x2="13" y2="16" strokeLinecap="round" />
  </svg>
);

interface BuilderTopBarProps {
  formId: number;
  formTitle: string;
  publicSlug: string | null;
  status: 'draft' | 'published';
  onTitleChange: (newTitle: string) => void;
}

export default function BuilderTopBar({
  formId,
  formTitle,
  publicSlug,
  onTitleChange,
}: BuilderTopBarProps) {
  const router = useRouter();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(formTitle);

  const showComingSoon = () => {
    toast('Coming soon', { icon: '🚧' });
  };

  const handleShare = () => {
    if (publicSlug) {
      const url = `${window.location.origin}/f/${publicSlug}`;
      navigator.clipboard.writeText(url);
      toast.success('Public form link copied to clipboard!');
    } else {
      toast('Form must be published to share', { icon: 'ℹ️' });
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-200/80 px-4 py-2.5 flex items-center justify-between z-30 sticky top-0">
      {/* Left: Breadcrumbs (Forms > My new form) */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 font-semibold cursor-pointer transition-colors"
        >
          <FormsIcon />
          <span>Forms</span>
        </button>

        <ChevronRight className="w-4 h-4 text-gray-400 stroke-[2]" />

        {editingTitle ? (
          <input
            className="text-sm font-semibold text-gray-900 bg-transparent border-b-2 border-black outline-none px-1 py-0.5"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => {
              setEditingTitle(false);
              if (titleDraft.trim() && titleDraft !== formTitle) {
                onTitleChange(titleDraft.trim());
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'Escape') {
                setEditingTitle(false);
                setTitleDraft(formTitle);
              }
            }}
            autoFocus
          />
        ) : (
          <span
            onClick={() => {
              setEditingTitle(true);
              setTitleDraft(formTitle);
            }}
            className="font-semibold text-gray-900 cursor-pointer hover:text-black transition-colors max-w-[200px] truncate"
            title="Click to edit form title"
          >
            {formTitle}
          </span>
        )}
      </div>

      {/* Center: Navigation Tabs (Content, Workflow, Connect) */}
      <nav className="flex items-center gap-6 text-sm font-semibold">
        <button className="text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-md transition-all">
          Content
        </button>
        <button
          onClick={() => router.push(`/forms/${formId}/workflow`)}
          className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          Workflow
        </button>
        <button
          onClick={showComingSoon}
          className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          Connect
        </button>
      </nav>

      {/* Right: Share, View Plans, Help, Avatar */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleShare}
          className="border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-gray-600 stroke-[2]" />
          <span>Share</span>
        </button>

        <button
          onClick={showComingSoon}
          className="bg-[#046a38] hover:bg-[#02522b] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors shadow-xs cursor-pointer"
        >
          View plans
        </button>

        <button
          onClick={showComingSoon}
          className="p-1 text-gray-600 hover:text-gray-900 transition-colors rounded-full cursor-pointer"
          title="Help"
        >
          <HelpCircle className="w-4 h-4 stroke-[2]" />
        </button>

        <div className="w-7 h-7 rounded-full bg-[#f8c8c8] text-[#4a2626] font-bold text-xs flex items-center justify-center flex-shrink-0 cursor-pointer shadow-xs">
          KS
        </div>
      </div>
    </header>
  );
}
