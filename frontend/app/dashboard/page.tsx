'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import type { FormListItem } from '../lib/types';
import Modal from '../components/Modal';
import TopBar from '../components/TopBar';
import NavBarTabs from '../components/NavBarTabs';
import Sidebar from '../components/Sidebar';

import FormsTable from '../components/FormsTable';
import {
  MoreHorizontal,
  UserPlus,
  ShieldCheck,
  ChevronDown,
  List,
  LayoutGrid,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at'>('created_at');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Modal States
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<FormListItem | null>(null);
  const [renameTarget, setRenameTarget] = useState<FormListItem | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  const showComingSoon = () => {
    toast('Coming soon', { icon: '🚧' });
  };

  const loadForms = useCallback(async () => {
    try {
      const data = await api.forms.list();
      setForms(data.results);
    } catch {
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  // Calculate total responses across all forms for the sidebar widget
  const totalResponses = useMemo(() => {
    return forms.reduce((acc, f) => acc + (f.response_count || 0), 0);
  }, [forms]);

  // Filter and sort forms list
  const filteredForms = useMemo(() => {
    return forms
      .filter((f) =>
        f.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const dateA = new Date(a[sortBy]).getTime();
        const dateB = new Date(b[sortBy]).getTime();
        return dateB - dateA;
      });
  }, [forms, searchQuery, sortBy]);

  // Handle Form Creation
  const handleCreate = async () => {
    const title = newTitle.trim() || 'Untitled Form';
    setCreating(false);
    setNewTitle('');
    const toastId = toast.loading('Creating form...');
    try {
      const form = await api.forms.create({ title });
      toast.success('Form created!', { id: toastId });
      router.push(`/forms/${form.id}/edit`);
    } catch {
      toast.error('Failed to create form', { id: toastId });
    }
  };

  // Handle Form Duplication
  const handleDuplicate = async (id: number) => {
    const toastId = toast.loading('Duplicating form...');
    try {
      const form = await api.forms.duplicate(id);
      toast.success('Form duplicated!', { id: toastId });
      await loadForms();
      router.push(`/forms/${form.id}/edit`);
    } catch {
      toast.error('Failed to duplicate form', { id: toastId });
    }
  };

  // Handle Form Deletion
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const toastId = toast.loading('Deleting form...');
    try {
      await api.forms.delete(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Form deleted', { id: toastId });
      await loadForms();
    } catch {
      toast.error('Failed to delete form', { id: toastId });
    }
  };

  // Handle Form Renaming
  const handleRenameSubmit = async () => {
    if (!renameTarget) return;
    const title = renameTitle.trim() || 'Untitled Form';
    const toastId = toast.loading('Renaming form...');
    try {
      await api.forms.patch(renameTarget.id, { title });
      setRenameTarget(null);
      toast.success('Form renamed!', { id: toastId });
      await loadForms();
    } catch {
      toast.error('Failed to rename form', { id: toastId });
    }
  };

  // Handle Publish / Unpublish Toggle
  const handlePublishToggle = async (form: FormListItem) => {
    const isPublished = form.status === 'published';
    const toastId = toast.loading(
      isPublished ? 'Unpublishing...' : 'Publishing...'
    );
    try {
      if (isPublished) {
        await api.forms.unpublish(form.id);
        toast.success('Form unpublished', { id: toastId });
      } else {
        await api.forms.publish(form.id);
        toast.success('Form published! Link is live.', { id: toastId });
      }
      await loadForms();
    } catch {
      toast.error('Failed to update status', { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Shared Top Navigation Bar */}
      <TopBar />

      {/* Second Row Navigation Tabs */}
      <NavBarTabs />

      {/* Main Two-Column Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          formCount={forms.length}
          totalResponses={totalResponses}
          onCreateForm={() => setCreating(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 bg-[#f9f9f9] p-8 lg:p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header Title Row & Right Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-200">
              {/* Title & Stubs */}
              <div className="flex items-center gap-3">
                <h1 className="text-[26px] font-normal text-gray-900 tracking-tight leading-none mr-2">
                  My workspace
                </h1>

                <button
                  onClick={showComingSoon}
                  className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
                  title="Workspace options"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path fill="currentColor" d="M1.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m5 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m5 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </button>

                <button
                  onClick={showComingSoon}
                  className="flex items-center gap-1.5 text-[15px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-2 py-1.5 ml-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path fill="currentColor" d="M6.706 1.5a2.03 2.03 0 1 0 0 4.059 2.03 2.03 0 0 0 0-4.059m-3.53 2.03a3.53 3.53 0 1 1 7.06 0 3.53 3.53 0 0 1-7.06 0M13.25 4a.75.75 0 0 1 .75.75v1.255h1.246a.75.75 0 0 1 0 1.5H14V8.75a.75.75 0 1 1-1.5 0V7.505h-1.25a.75.75 0 0 1 0-1.5h1.25V4.75a.75.75 0 0 1 .75-.75M6.706 9.441c-2.566 0-4.447 1.641-5.04 3.917a.1.1 0 0 0-.003.038.1.1 0 0 0 .022.037c.029.033.086.067.163.067h9.715a.22.22 0 0 0 .164-.067.1.1 0 0 0 .021-.037.1.1 0 0 0-.002-.038c-.593-2.276-2.474-3.917-5.04-3.917M.214 12.98C.967 10.09 3.409 7.94 6.706 7.94s5.739 2.15 6.492 5.039c.295 1.13-.647 2.02-1.635 2.02H1.848C.861 15-.08 14.11.214 12.98" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                  Invite
                </button>

                <button
                  onClick={showComingSoon}
                  className="p-1 text-[#046a38] hover:text-[#02522b] transition-colors"
                  title="Security Badge"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path fill="currentColor" d="M4.526 3.59a.25.25 0 0 1 .192-.09h6.564a.25.25 0 0 1 .192.09l2.865 3.439a.25.25 0 0 1-.015.336l-6.147 6.147a.25.25 0 0 1-.354 0L1.676 7.366a.25.25 0 0 1-.015-.336zM4.718 2c-.519 0-1.012.23-1.344.63L.508 6.068a1.75 1.75 0 0 0 .107 2.358l6.148 6.147a1.75 1.75 0 0 0 2.474 0l6.147-6.147a1.75 1.75 0 0 0 .107-2.358L12.626 2.63A1.75 1.75 0 0 0 11.282 2zm2.36 4.236a.75.75 0 1 0-1.143-.972l-.32.376-.004.005-.937 1.125a.75.75 0 0 0 .046 1.01l1.5 1.5a.75.75 0 0 0 1.06-1.06L6.265 7.204l.496-.596z" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </button>
              </div>

              {/* Right View & Sort Controls */}
              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="border border-gray-200 hover:border-gray-300 rounded-md px-3 py-1.5 text-[15px] font-medium text-gray-700 flex items-center gap-2 bg-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                      <path fill="currentColor" d="M4.75.5a.75.75 0 0 1 .75.75V2h5v-.75a.75.75 0 0 1 1.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v9.5A1.75 1.75 0 0 1 13.25 15H2.75A1.75 1.75 0 0 1 1 13.25v-9.5C1 2.784 1.784 2 2.75 2H4v-.75A.75.75 0 0 1 4.75.5m-2 3a.25.25 0 0 0-.25.25V6h11V3.75a.25.25 0 0 0-.25-.25zm10.75 4h-11v5.75c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25z" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                    <span>
                      Date {sortBy === 'created_at' ? 'created' : 'updated'}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16" className="ml-2">
                      <path fill="currentColor" d="M7.116 10.847a1.25 1.25 0 0 0 1.768 0L12.78 6.95a.75.75 0 0 0-1.06-1.06L8 9.61 4.28 5.89a.75.75 0 0 0-1.06 1.06z" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                  </button>

                  {isSortOpen && (
                    <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-sm py-1 z-20 text-[15px] font-medium">
                      <button
                        onClick={() => {
                          setSortBy('created_at');
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-gray-50 ${
                          sortBy === 'created_at'
                            ? 'text-gray-900 font-medium bg-gray-50'
                            : 'text-gray-600'
                        }`}
                      >
                        Date created
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('updated_at');
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-gray-50 ${
                          sortBy === 'updated_at'
                            ? 'text-gray-900 font-medium bg-gray-50'
                            : 'text-gray-600'
                        }`}
                      >
                        Date updated
                      </button>
                    </div>
                  )}
                </div>

                {/* List / Grid Toggle */}
                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white ml-2">
                  <button
                    className="px-3 py-2 text-[15px] font-medium text-gray-900 bg-gray-100 flex items-center gap-1 border-r border-gray-200"
                    title="List view"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                      <path fill="currentColor" d="M.75 2a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-1.5 0V2.75A.75.75 0 0 1 .75 2M4 3.75A.75.75 0 0 1 4.75 3h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 3.75m0 4A.75.75 0 0 1 4.75 7h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 7.75m0 4a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75a.75.75 0 0 1-.75-.75" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                    List
                  </button>
                  <button
                    onClick={showComingSoon}
                    className="px-3 py-2 text-[15px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-1"
                    title="Grid view"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                      <path fill="currentColor" d="M2.75 2.5a.25.25 0 0 0-.25.25v4.5h4.75V2.5zm0-1.5A1.75 1.75 0 0 0 1 2.75v10.5c0 .966.784 1.75 1.75 1.75h10.5A1.75 1.75 0 0 0 15 13.25V2.75A1.75 1.75 0 0 0 13.25 1zm6 1.5v4.75h4.75v-4.5a.25.25 0 0 0-.25-.25zm4.75 6.25H8.75v4.75h4.5a.25.25 0 0 0 .25-.25zM7.25 13.5V8.75H2.5v4.5c0 .138.112.25.25.25z" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                    Grid
                  </button>
                </div>
              </div>
            </div>



            {/* Forms Table */}
            {loading ? (
              <div className="space-y-3 pt-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-14 bg-gray-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <FormsTable
                forms={filteredForms}
                onEdit={(id) => router.push(`/forms/${id}/edit`)}
                onDuplicate={handleDuplicate}
                onDelete={(form) => setDeleteTarget(form)}
                onPublishToggle={handlePublishToggle}
                onRename={(form) => {
                  setRenameTarget(form);
                  setRenameTitle(form.title);
                }}
                onCreateForm={() => setCreating(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Create Form Modal */}
      <Modal
        open={creating}
        onClose={() => {
          setCreating(false);
          setNewTitle('');
        }}
        title="New Form"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[14px] font-medium text-[#3c323e] mb-2 font-sans">
              Form title
            </label>
            <input
              id="new-form-title"
              className="w-full px-3 py-2 bg-[#fafafa] border border-[rgba(81,76,84,0.15)] rounded-lg text-[14px] text-[#3c323e] placeholder-[#847e85] focus:outline-none focus:bg-[#fafafa] focus:border-[#3c323e] transition-colors"
              placeholder="e.g. Customer Feedback Survey"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
              }}
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setCreating(false);
                setNewTitle('');
              }}
              className="px-4 py-2 text-[14px] font-medium text-[#655d67] hover:bg-[rgba(89,86,93,0.04)] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="create-form-submit"
              onClick={handleCreate}
              className="bg-[#3c323e] hover:bg-[#655d67] active:bg-[#4c414e] text-white text-[14px] font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </Modal>

      {/* Rename Form Modal */}
      <Modal
        open={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        title="Rename Form"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[14px] font-medium text-[#3c323e] mb-2 font-sans">
              New form title
            </label>
            <input
              id="rename-form-title"
              className="w-full px-3 py-2 bg-[#fafafa] border border-[rgba(81,76,84,0.15)] rounded-lg text-[14px] text-[#3c323e] focus:outline-none focus:bg-[#fafafa] focus:border-[#3c323e] transition-colors"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit();
              }}
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setRenameTarget(null)}
              className="px-4 py-2 text-[14px] font-medium text-[#655d67] hover:bg-[rgba(89,86,93,0.04)] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRenameSubmit}
              className="bg-[#3c323e] hover:bg-[#655d67] active:bg-[#4c414e] text-white text-[14px] font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Save Title
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Form Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Form"
      >
        <div className="space-y-4">
          <p className="text-[14px] text-[#4c414e] leading-relaxed">
            Are you sure you want to delete{' '}
            <strong className="text-[#3c323e] font-medium">"{deleteTarget?.title}"</strong>?
            This will permanently remove all questions and responses. This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-[14px] font-medium text-[#655d67] hover:bg-[rgba(89,86,93,0.04)] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-delete-btn"
              onClick={handleDelete}
              className="bg-[#c74e43] hover:bg-[#d85e53] text-white text-[14px] font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
