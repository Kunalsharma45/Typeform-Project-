'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import type { FormListItem } from '../lib/types';
import Modal from '../components/Modal';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import AISuggestionCard from '../components/AISuggestionCard';
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
        <main className="flex-1 bg-white p-8 lg:p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Title Row & Right Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Title & Stubs */}
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                  My workspace
                </h1>

                <button
                  onClick={showComingSoon}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Workspace options"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                <button
                  onClick={showComingSoon}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-lg px-2.5 py-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-gray-500" />
                  Invite
                </button>

                <button
                  onClick={showComingSoon}
                  className="p-1 text-emerald-600 hover:text-emerald-700 transition-colors"
                  title="Security Badge"
                >
                  <ShieldCheck className="w-5 h-5" />
                </button>
              </div>

              {/* Right View & Sort Controls */}
              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 flex items-center gap-1.5 bg-white transition-colors"
                  >
                    <span>
                      Date {sortBy === 'created_at' ? 'created' : 'updated'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>

                  {isSortOpen && (
                    <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20 text-xs font-medium">
                      <button
                        onClick={() => {
                          setSortBy('created_at');
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-gray-50 ${
                          sortBy === 'created_at'
                            ? 'text-black font-semibold bg-gray-50'
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
                            ? 'text-black font-semibold bg-gray-50'
                            : 'text-gray-600'
                        }`}
                      >
                        Date updated
                      </button>
                    </div>
                  )}
                </div>

                {/* List / Grid Toggle */}
                <div className="flex items-center p-0.5 bg-gray-100/80 rounded-lg border border-gray-200">
                  <button
                    className="px-2.5 py-1 text-xs font-semibold text-gray-900 bg-white rounded-md shadow-xs flex items-center gap-1"
                    title="List view"
                  >
                    <List className="w-3.5 h-3.5" />
                    List
                  </button>
                  <button
                    onClick={showComingSoon}
                    className="px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-900 rounded-md transition-colors flex items-center gap-1"
                    title="Grid view"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Grid
                  </button>
                </div>
              </div>
            </div>

            {/* AI Suggestion Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AISuggestionCard
                id="card-1"
                text="Create an Obtain informed consent from subjects before data collection for ethical compliance."
              />
              <AISuggestionCard
                id="card-2"
                text="Create a Gather expert opinions on recent studies to identify research gaps and trends."
              />
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
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Form title
            </label>
            <input
              id="new-form-title"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              placeholder="e.g. Customer Feedback Survey"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
              }}
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => {
                setCreating(false);
                setNewTitle('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="create-form-submit"
              onClick={handleCreate}
              className="bg-[#262627] hover:bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs"
            >
              Create Form
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
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              New form title
            </label>
            <input
              id="rename-form-title"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit();
              }}
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setRenameTarget(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRenameSubmit}
              className="bg-[#262627] hover:bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs"
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
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete{' '}
            <strong className="text-gray-900">"{deleteTarget?.title}"</strong>?
            This will permanently remove all questions and responses. This action
            cannot be undone.
          </p>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-delete-btn"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs"
            >
              Delete permanently
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
