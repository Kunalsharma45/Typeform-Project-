'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import {
  ChevronRight,
  Share2,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';

const FormsIcon = () => (
  <svg
    className="w-5 h-5 text-gray-700 stroke-[1.8]"
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
  publicSlug?: string | null;
  status?: 'draft' | 'published';
  onTitleChange?: (newTitle: string) => void;
  onPublish?: (updatedForm: any) => void;
}

export default function BuilderTopBar({
  formId,
  formTitle,
  publicSlug,
  onTitleChange,
  onPublish,
}: BuilderTopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(formTitle);
  const [isPublishing, setIsPublishing] = useState(false);
  
  let activeTab = 'Content';
  if (pathname?.includes('/workflow')) activeTab = 'Workflow';
  if (pathname?.includes('/connect')) activeTab = 'Connect';
  if (pathname?.includes('/results')) activeTab = 'Results';

  const tabs = ['Content', 'Workflow', 'Connect', 'Results'];

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

  const handleTogglePublish = async () => {
    try {
      setIsPublishing(true);
      if (status === 'published') {
        const updatedForm = await api.forms.unpublish(formId);
        toast.success('Form unpublished successfully!');
        if (onPublish) {
          onPublish(updatedForm);
        } else {
          window.location.reload();
        }
      } else {
        const updatedForm = await api.forms.publish(formId);
        toast.success('Form published successfully!');
        if (onPublish) {
          onPublish(updatedForm);
        } else {
          window.location.reload();
        }
      }
    } catch (e) {
      toast.error(status === 'published' ? 'Failed to unpublish form' : 'Failed to publish form');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <header className="w-full bg-white px-8 py-3.5 flex items-center justify-between z-30 sticky top-0">
      {/* Left: Breadcrumbs (Forms > My new form) */}
      <div className="flex items-center gap-2 text-[15px]">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 font-semibold cursor-pointer transition-colors"
        >
          <FormsIcon />
          <span>Forms</span>
        </button>

        <ChevronRight className="w-5 h-5 text-gray-400 stroke-[2]" />

        {editingTitle ? (
          <input
            className="text-[15px] font-semibold text-gray-900 bg-transparent border-b-2 border-black outline-none px-1 py-0.5"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => {
              setEditingTitle(false);
              if (titleDraft.trim() && titleDraft !== formTitle && onTitleChange) {
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
      <nav className="flex items-center gap-2 text-[15px] font-semibold">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                if (tab === 'Content') router.push(`/forms/${formId}/edit`);
                if (tab === 'Workflow') router.push(`/forms/${formId}/workflow`);
                if (tab === 'Connect') showComingSoon();
                if (tab === 'Results') router.push(`/forms/${formId}/results`);
              }}
              className={`relative px-4 py-1.5 transition-colors z-10 cursor-pointer ${
                isActive ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab}
              {isActive && (
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-gray-100 rounded-md -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute top-[-14px] left-1/2 -translate-x-1/2 w-12 h-[3px] bg-black rounded-b-sm"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Preview, Share, View Plans, Help, Avatar */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (publicSlug) {
              window.open(`/f/${publicSlug}`, '_blank');
            } else {
              toast('Publish your form first to preview it!', { icon: '👁️' });
            }
          }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Eye className="w-4 h-4 stroke-[2]" />
          <span>Preview</span>
        </button>

        <button
          onClick={handleShare}
          className="border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-gray-600 stroke-[2]" />
          <span>Share</span>
        </button>

        <button
          onClick={showComingSoon}
          className="bg-[#046a38] hover:bg-[#02522b] text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors shadow-xs cursor-pointer"
        >
          View plans
        </button>

        <button
          onClick={handleTogglePublish}
          disabled={isPublishing}
          className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            status === 'published' 
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {isPublishing ? '...' : status === 'published' ? 'Unpublish' : 'Publish'}
        </button>

        <button
          onClick={showComingSoon}
          className="p-1 text-gray-600 hover:text-gray-900 transition-colors rounded-full cursor-pointer"
          title="Help"
        >
          <HelpCircle className="w-5 h-5 stroke-[2]" />
        </button>

        <div className="w-8 h-8 rounded-full bg-[#f8c8c8] text-[#4a2626] font-bold text-sm flex items-center justify-center flex-shrink-0 cursor-pointer shadow-xs">
          KS
        </div>
      </div>
    </header>
  );
}
