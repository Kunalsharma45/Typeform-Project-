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
          className="bg-[#262627] hover:bg-black text-white font-semibold text-sm py-2.5 px-5 rounded-full flex items-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create form
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-1">
      {/* Table Header Row — Strict Proportional CSS Grid matching data rows */}
      <div className="grid grid-cols-[2.5fr_1fr_1fr_1.2fr_1fr_40px] items-center px-4 py-2 text-[14px] text-gray-500 gap-6">
        <div></div>
        <div className="text-right">Responses</div>
        <div className="text-right">Completed</div>
        <div className="text-right flex items-center justify-end gap-1 cursor-pointer hover:text-gray-900 transition-colors">
          Updated
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
            <path fill="currentColor" d="M8 10.375-3.5-3.5.75-.75L8 8.875l2.75-2.75.75.75-3.5 3.5Z" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
        </div>
        <div className="text-center">Integrations</div>
        <div></div>
      </div>

      {/* Table Data Rows */}
      <div className="space-y-3 pt-4">
        {forms.map((form) => {
          const accentColor = form.theme?.accent_color || '#d9534f';
          const isPublished = form.status === 'published';

          return (
            <div
              key={form.id}
              onClick={() => onEdit(form.id)}
              className="grid grid-cols-[2.5fr_1fr_1fr_1.2fr_1fr_40px] items-center px-4 py-3.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer group shadow-sm relative gap-6"
            >
              {/* Form Swatch & Title */}
              <div className="flex items-center gap-3.5 min-w-0 pr-2">
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
                  style={{ background: accentColor }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <g clipPath="url(#clip0_3779_9717)">
                      <path fillRule="evenodd" clipRule="evenodd" d="M-19.001 16C-19.001 9.87176 -19.001 6.80764 -17.0972 4.90383L-17.0971 4.90379C-15.1933 3 -12.1292 3 -6.00098 3H2.6659C8.79415 3 11.8583 3 13.7621 4.90379L13.7621 4.90383C14.4325 5.57425 14.8669 6.38854 15.1482 7.42986C15.2012 7.62592 15.3761 7.76662 15.5792 7.76662V7.76662C15.7823 7.76662 15.9572 7.62592 16.0102 7.42986C16.2916 6.38854 16.7259 5.57425 17.3963 4.90383L17.3964 4.90379C19.3002 3 22.3643 3 28.4925 3H37.1594C43.2877 3 46.3518 3 48.2556 4.90379L48.2556 4.90383C50.1594 6.80764 50.1594 9.87176 50.1594 16C50.1594 22.1282 50.1594 25.1924 48.2556 27.0962L48.2556 27.0962C46.3518 29 43.2877 29 37.1594 29H28.4925C22.3643 29 19.3002 29 17.3964 27.0962L17.3963 27.0962C16.7259 26.4257 16.2916 25.6114 16.0102 24.57C15.9572 24.374 15.7823 24.2333 15.5792 24.2333V24.2333C15.3761 24.2333 15.2012 24.374 15.1483 24.57C14.8669 25.6114 14.4326 26.4257 13.7621 27.0962L13.7621 27.0962C11.8583 29 8.79415 29 2.66591 29H-6.00097C-12.1292 29 -15.1933 29 -17.0971 27.0962L-17.0972 27.0962C-19.001 25.1924 -19.001 22.1282 -19.001 16Z" fill="#ffffff33"></path>
                    </g>
                    <defs>
                      <clipPath id="clip0_3779_9717">
                        <rect width="32" height="32" fill="#ffffff33"></rect>
                      </clipPath>
                    </defs>
                  </svg>
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-[15px] text-gray-900 truncate group-hover:text-black">
                    {form.title}
                  </span>
                </div>
              </div>

              {/* Responses Count */}
              <div className="text-right text-[15px] text-gray-500 font-medium">
                {form.response_count > 0 ? form.response_count : '-'}
              </div>

              {/* Completed Count */}
              <div className="text-right text-[15px] text-gray-500 font-medium">
                {(form.completed_count ?? 0) > 0 ? form.completed_count : '-'}
              </div>

              {/* Updated Date */}
              <div className="text-right text-[15px] text-gray-500 font-medium whitespace-nowrap">
                {formatDate(form.updated_at)}
              </div>

              {/* Integrations Stub */}
              <div className="flex justify-center">
                <button
                  onClick={showComingSoon}
                  className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                  title="Integrations"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path fill="currentColor" d="M.75 3a2.25 2.25 0 0 1 2.25-2.25h3.5a2.25 2.25 0 0 1 2.25 2.25v3.5a2.25 2.25 0 0 1-2.25 2.25h-3.5A2.25 2.25 0 0 1 .75 6.5zm2.25-1.25a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1h3.5a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zm4.25 7.5a2.25 2.25 0 0 1 2.25-2.25h3.5A2.25 2.25 0 0 1 15.25 9.25v3.5A2.25 2.25 0 0 1 13 15h-3.5a2.25 2.25 0 0 1-2.25-2.25zm2.25-1.25a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1h3.5a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z" fillRule="evenodd" clipRule="evenodd"></path>
                    <path fill="currentColor" d="M12 2a.75.75 0 0 1 .75.75v1.75h1.75a.75.75 0 0 1 0 1.5h-1.75V7.75a.75.75 0 0 1-1.5 0V6h-1.75a.75.75 0 0 1 0-1.5h1.75V2.75A.75.75 0 0 1 12 2M2.5 10.25a.75.75 0 0 1 .75.75v1.25h1.25a.75.75 0 0 1 0 1.5H3.25v1.25a.75.75 0 0 1-1.5 0v-1.25H.5a.75.75 0 0 1 0-1.5h1.25V11a.75.75 0 0 1 .75-.75" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </button>
              </div>

              {/* Overflow Menu Button */}
              <div
                className="flex justify-end relative opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === form.id ? null : form.id)
                  }
                  className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path fill="currentColor" d="M1.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m5 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m5 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
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
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        onRename(form);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                      Rename
                    </button>
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        router.push(`/forms/${form.id}/results`);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
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
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
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
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        onPublishToggle(form);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
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
                      className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
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
