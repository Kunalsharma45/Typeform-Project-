'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { FormListItem } from '../lib/types';
import {
  MoreHorizontal,
  Grid2x2Plus,
  Plus,
  Edit2,
  Copy,
  Trash2,
  BarChart2,
  Eye,
  Send,
  FolderPlus,
} from 'lucide-react';

interface FormsTableProps {
  forms: FormListItem[];
  onEdit: (formId: number) => void;
  onDuplicate: (formId: number) => void;
  onDelete: (form: FormListItem) => void;
  onPublishToggle: (form: FormListItem) => void;
  onRename: (form: FormListItem) => void;
  onCreateForm: () => void;
}

export default function FormsTable({
  forms,
  onEdit,
  onDuplicate,
  onDelete,
  onPublishToggle,
  onRename,
  onCreateForm,
}: FormsTableProps) {
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close overflow menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showComingSoon = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast('Coming soon', { icon: '🚧' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (forms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
          <FolderPlus className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Create your first form
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          Build surveys, quizzes, and questionnaires with a beautiful
          one-question-at-a-time experience.
        </p>
        <button
          onClick={onCreateForm}
          className="bg-[#262627] hover:bg-black text-white font-semibold text-sm py-2.5 px-5 rounded-full flex items-center gap-2 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create form
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-1">
      {/* Table Header Row */}
      <div className="flex items-center px-4 py-2 text-xs font-semibold text-gray-400 border-b border-gray-100">
        <div className="flex-1"></div>
        <div className="w-24 text-right">Responses</div>
        <div className="w-24 text-right">Completed</div>
        <div className="w-32 text-right">Updated</div>
        <div className="w-28 text-center">Integrations</div>
        <div className="w-10"></div>
      </div>

      {/* Table Body Rows */}
      <div className="space-y-1.5 pt-1">
        {forms.map((form) => {
          const accentColor = form.theme?.accent_color || '#cc5550';
          const isPublished = form.status === 'published';

          return (
            <div
              key={form.id}
              onClick={() => onEdit(form.id)}
              className="flex items-center px-4 py-3.5 rounded-xl bg-white hover:bg-gray-50/80 border border-transparent hover:border-gray-200 transition-all cursor-pointer group shadow-xs relative"
            >
              {/* Form Title & Swatch */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-xs"
                  style={{ background: accentColor }}
                />

                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-gray-900 text-sm truncate group-hover:text-black">
                    {form.title}
                  </span>

                  {/* Status Badge */}
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 border ${
                      isPublished
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              {/* Responses Count */}
              <div className="w-24 text-right text-sm text-gray-500 font-medium">
                {form.response_count > 0 ? form.response_count : '–'}
              </div>

              {/* Completed Count */}
              <div className="w-24 text-right text-sm text-gray-500 font-medium">
                {(form.completed_count ?? 0) > 0 ? form.completed_count : '–'}
              </div>

              {/* Updated Date */}
              <div className="w-32 text-right text-sm text-gray-500 font-medium">
                {formatDate(form.updated_at)}
              </div>

              {/* Integrations Stub */}
              <div className="w-28 flex justify-center">
                <button
                  onClick={showComingSoon}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Integrations"
                >
                  <Grid2x2Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Overflow Menu Button */}
              <div
                className="w-10 flex justify-end relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === form.id ? null : form.id)
                  }
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {/* Overflow Dropdown */}
                {openMenuId === form.id && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-9 z-30 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-1 text-xs font-medium text-gray-700 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        onEdit(form.id);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        onRename(form);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                      Rename
                    </button>
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        router.push(`/forms/${form.id}/results`);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-gray-500" />
                      Results
                    </button>
                    {isPublished && (
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          window.open(`/f/${form.public_slug}`, '_blank');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                        Preview live
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        onDuplicate(form.id);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        onPublishToggle(form);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5 text-gray-500" />
                      {isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <div className="my-1 border-t border-gray-100" />
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        onDelete(form);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
