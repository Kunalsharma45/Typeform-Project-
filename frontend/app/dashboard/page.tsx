'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import type { FormListItem } from '../lib/types';
import Modal from '../components/Modal';

// ── Question type icons ────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CopyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChartIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round" /><line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round" /><line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round" />
  </svg>
);

const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

function FormCard({
  form,
  onEdit,
  onDuplicate,
  onDelete,
  onPublishToggle,
  onResults,
  onPreview,
}: {
  form: FormListItem;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPublishToggle: () => void;
  onResults: () => void;
  onPreview: () => void;
}) {
  const accent = form.theme?.accent_color || '#6366f1';
  const isPublished = form.status === 'published';

  return (
    <div
      className="card group hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
      style={{ borderRadius: '16px' }}
      onClick={onEdit}
    >
      {/* Coloured top accent bar */}
      <div className="h-1.5 w-full" style={{ background: accent }} />

      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-snug truncate">
              {form.title}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {form.description || 'No description'}
            </p>
          </div>
          <span className={`badge flex-shrink-0 ${isPublished ? 'badge-published' : 'badge-draft'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-green-500' : 'bg-gray-400'}`} />
            {isPublished ? 'Published' : 'Draft'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
            {form.response_count} response{form.response_count !== 1 ? 's' : ''}
          </span>
          <span>
            {new Date(form.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-1.5 pt-3 border-t border-gray-100 mt-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            id={`edit-form-${form.id}`}
            onClick={onEdit}
            className="btn btn-ghost btn-sm flex-1"
            title="Edit"
          >
            <EditIcon /> Edit
          </button>
          <button
            id={`results-form-${form.id}`}
            onClick={onResults}
            className="btn btn-ghost btn-sm"
            title="Results"
          >
            <ChartIcon />
          </button>
          {isPublished && (
            <button
              id={`preview-form-${form.id}`}
              onClick={onPreview}
              className="btn btn-ghost btn-sm"
              title="Preview"
            >
              <EyeIcon />
            </button>
          )}
          <button
            id={`duplicate-form-${form.id}`}
            onClick={onDuplicate}
            className="btn btn-ghost btn-sm"
            title="Duplicate"
          >
            <CopyIcon />
          </button>
          <button
            id={`publish-form-${form.id}`}
            onClick={onPublishToggle}
            className={`btn btn-sm ${isPublished ? 'btn-secondary' : 'btn-primary'}`}
            style={!isPublished ? { background: accent } : {}}
            title={isPublished ? 'Unpublish' : 'Publish'}
          >
            {isPublished ? 'Unpublish' : 'Publish'}
          </button>
          <button
            id={`delete-form-${form.id}`}
            onClick={onDelete}
            className="btn btn-ghost btn-sm text-red-400 hover:text-red-600 hover:bg-red-50"
            title="Delete"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FormListItem | null>(null);
  const [newTitle, setNewTitle] = useState('');

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

  useEffect(() => { loadForms(); }, [loadForms]);

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

  const handleDuplicate = async (id: number) => {
    const toastId = toast.loading('Duplicating...');
    try {
      const form = await api.forms.duplicate(id);
      toast.success('Form duplicated!', { id: toastId });
      await loadForms();
      router.push(`/forms/${form.id}/edit`);
    } catch {
      toast.error('Failed to duplicate', { id: toastId });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const toastId = toast.loading('Deleting...');
    try {
      await api.forms.delete(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Form deleted', { id: toastId });
      await loadForms();
    } catch {
      toast.error('Failed to delete', { id: toastId });
    }
  };

  const handlePublishToggle = async (form: FormListItem) => {
    const toastId = toast.loading(form.status === 'published' ? 'Unpublishing...' : 'Publishing...');
    try {
      if (form.status === 'published') {
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
    <div className="min-h-screen" style={{ background: '#f7f8fa' }}>
      {/* Top Bar */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderColor: '#e5e7eb' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              T
            </div>
            <span className="font-semibold text-gray-900 text-lg">Typeform</span>
          </div>
          <button
            id="create-form-btn"
            onClick={() => setCreating(true)}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <PlusIcon />
            Create form
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Forms</h1>
          <p className="text-gray-500 mt-1">
            {forms.length === 0 ? 'No forms yet' : `${forms.length} form${forms.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card h-44 animate-pulse" style={{ background: '#f3f4f6' }} />
            ))}
          </div>
        ) : forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: '#eef2ff' }}
            >
              <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Create your first form</h2>
            <p className="text-gray-500 mb-6 max-w-sm">Build surveys, quizzes, and questionnaires with a beautiful one-question-at-a-time experience.</p>
            <button
              onClick={() => setCreating(true)}
              className="btn btn-primary btn-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <PlusIcon /> Create your first form
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onEdit={() => router.push(`/forms/${form.id}/edit`)}
                onDuplicate={() => handleDuplicate(form.id)}
                onDelete={() => setDeleteTarget(form)}
                onPublishToggle={() => handlePublishToggle(form)}
                onResults={() => router.push(`/forms/${form.id}/results`)}
                onPreview={() => window.open(`/f/${form.public_slug}`, '_blank')}
              />
            ))}
            {/* + New form card */}
            <button
              id="create-form-card"
              onClick={() => setCreating(true)}
              className="border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 h-44 transition-all duration-150 hover:border-indigo-400 hover:bg-indigo-50 text-gray-400 hover:text-indigo-500"
              style={{ borderColor: '#d1d5db' }}
            >
              <PlusIcon />
              <span className="text-sm font-medium">New form</span>
            </button>
          </div>
        )}
      </main>

      {/* Create Form Modal */}
      <Modal open={creating} onClose={() => { setCreating(false); setNewTitle(''); }} title="New Form">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Form title</label>
            <input
              id="new-form-title"
              className="input"
              placeholder="e.g. Customer Feedback Survey"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => { setCreating(false); setNewTitle(''); }} className="btn btn-secondary">Cancel</button>
            <button
              id="create-form-submit"
              onClick={handleCreate}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              Create Form
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Form">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>"{deleteTarget?.title}"</strong>?
            This will permanently delete all questions and responses. This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary">Cancel</button>
            <button
              id="confirm-delete-btn"
              onClick={handleDelete}
              className="btn btn-danger"
            >
              Delete permanently
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
