'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '../../../lib/api';
import type { Form, Question, QuestionType } from '../../../lib/types';
import QuestionRenderer from '../../../components/QuestionRenderer';
import Modal from '../../../components/Modal';

// ─── Question Type Config ────────────────────────────────────────────────────

const QUESTION_TYPES: { type: QuestionType; label: string; icon: string; desc: string }[] = [
  { type: 'short_text', label: 'Short Text', icon: 'T', desc: 'One-line text answer' },
  { type: 'long_text', label: 'Long Text', icon: '¶', desc: 'Multi-line text answer' },
  { type: 'multiple_choice', label: 'Multiple Choice', icon: '○', desc: 'Select one option' },
  { type: 'dropdown', label: 'Dropdown', icon: '▾', desc: 'Pick from a list' },
  { type: 'email', label: 'Email', icon: '@', desc: 'Email address' },
  { type: 'number', label: 'Number', icon: '#', desc: 'Numeric input' },
  { type: 'yes_no', label: 'Yes / No', icon: '?', desc: 'Binary choice' },
  { type: 'rating', label: 'Rating', icon: '★', desc: 'Numeric rating scale' },
  { type: 'file_upload', label: 'File Upload', icon: '↑', desc: 'File attachment' },
];

const TYPE_COLOR: Record<QuestionType, string> = {
  short_text: '#6366f1',
  long_text: '#8b5cf6',
  multiple_choice: '#ec4899',
  dropdown: '#f59e0b',
  email: '#10b981',
  number: '#3b82f6',
  yes_no: '#14b8a6',
  rating: '#f97316',
  file_upload: '#64748b',
};

// ─── Sortable Sidebar Item ───────────────────────────────────────────────────

function SortableQuestionItem({
  question,
  index,
  selected,
  onClick,
  onDelete,
}: {
  question: Question;
  index: number;
  selected: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeConf = QUESTION_TYPES.find((t) => t.type === question.type);
  const color = TYPE_COLOR[question.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 mb-1 ${
        selected ? 'bg-indigo-50 shadow-sm' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing p-0.5 text-gray-300 hover:text-gray-500"
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="8" cy="6" r="2" /><circle cx="16" cy="6" r="2" />
          <circle cx="8" cy="12" r="2" /><circle cx="16" cy="12" r="2" />
          <circle cx="8" cy="18" r="2" /><circle cx="16" cy="18" r="2" />
        </svg>
      </div>

      {/* Type icon */}
      <div
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
        style={{ background: color }}
      >
        {typeConf?.icon}
      </div>

      {/* Question text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-0.5">
          {index + 1}. {typeConf?.label}
        </p>
        <p className="text-sm text-gray-800 truncate">
          {question.title || <span className="text-gray-400 italic">Untitled</span>}
        </p>
      </div>

      {/* Selected indicator */}
      {selected && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
          style={{ background: '#6366f1' }}
        />
      )}

      {/* Delete button */}
      <button
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
        onClick={onDelete}
        title="Delete question"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

// ─── Question Editor (Center Panel) ─────────────────────────────────────────

function QuestionEditor({
  question,
  onChange,
  accent,
}: {
  question: Question;
  onChange: (updates: Partial<Question>) => void;
  accent: string;
}) {
  const options = Array.isArray(question.options) ? question.options : [];

  const addOption = () => {
    const newOpt = { id: `opt_${Date.now()}`, label: `Option ${options.length + 1}` };
    onChange({ options: [...options, newOpt] });
  };

  const updateOption = (idx: number, label: string) => {
    const updated = options.map((o, i) => (i === idx ? { ...o, label } : o));
    onChange({ options: updated });
  };

  const removeOption = (idx: number) => {
    onChange({ options: options.filter((_, i) => i !== idx) });
  };

  const typeConf = QUESTION_TYPES.find((t) => t.type === question.type);

  return (
    <div className="p-6 space-y-5 overflow-y-auto h-full">
      {/* Type badge */}
      <div className="flex items-center gap-2">
        <div
          className="px-3 py-1 rounded-full text-white text-xs font-semibold"
          style={{ background: TYPE_COLOR[question.type] }}
        >
          {typeConf?.label}
        </div>
        {question.required && (
          <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-xs font-medium border border-red-100">
            Required
          </span>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Question
        </label>
        <textarea
          className="input textarea"
          value={question.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Type your question..."
          rows={2}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Description / Help Text
        </label>
        <input
          className="input"
          value={question.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Optional hint or instructions..."
        />
      </div>

      {/* Required toggle */}
      <div className="flex items-center justify-between py-3 border-t border-gray-100">
        <div>
          <p className="text-sm font-medium text-gray-800">Required</p>
          <p className="text-xs text-gray-400">Respondents must answer this question</p>
        </div>
        <button
          id="required-toggle"
          onClick={() => onChange({ required: !question.required })}
          className="relative w-10 h-5.5 rounded-full transition-colors duration-200 flex-shrink-0"
          style={{
            background: question.required ? accent : '#e5e7eb',
            height: '22px',
            width: '40px',
          }}
          role="switch"
          aria-checked={question.required}
        >
          <span
            className="absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform duration-200"
            style={{
              width: '18px',
              height: '18px',
              transform: question.required ? 'translateX(18px)' : 'translateX(0)',
            }}
          />
        </button>
      </div>

      {/* Options editor — for multiple_choice, dropdown */}
      {(question.type === 'multiple_choice' || question.type === 'dropdown') && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Options
          </label>
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div key={opt.id} className="flex gap-2 items-center">
                <span className="flex-shrink-0 w-6 h-6 rounded-md bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">
                  {String.fromCharCode(65 + idx)}
                </span>
                <input
                  className="input flex-1 text-sm"
                  value={opt.label}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                />
                <button
                  onClick={() => removeOption(idx)}
                  className="flex-shrink-0 text-gray-300 hover:text-red-400 p-1"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="btn btn-ghost btn-sm w-full border border-dashed border-gray-200 mt-1"
            >
              + Add option
            </button>
          </div>
        </div>
      )}

      {/* Rating max */}
      {question.type === 'rating' && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Max Rating
          </label>
          <select
            className="input"
            value={(question.options as { max: number })?.max ?? 5}
            onChange={(e) => onChange({ options: { max: parseInt(e.target.value, 10) } })}
          >
            {[3, 4, 5, 7, 10].map((n) => (
              <option key={n} value={n}>{n} stars</option>
            ))}
          </select>
        </div>
      )}

      {/* Logic Jump */}
      {(question.type === 'multiple_choice' || question.type === 'dropdown') && options.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Logic Jump (optional)
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Set a conditional skip — if a respondent picks a specific option, jump to a specific question.
          </p>
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-500 w-14 flex-shrink-0">If picks</span>
              <select
                className="input flex-1 text-sm"
                value={question.logic?.if_option_id ?? ''}
                onChange={(e) => onChange({ logic: { ...question.logic, if_option_id: e.target.value } as Question['logic'] })}
              >
                <option value="">Select option...</option>
                {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-500 w-14 flex-shrink-0">Jump to Q#</span>
              <input
                type="number"
                className="input flex-1 text-sm"
                placeholder="Question order index (0-based)"
                value={question.logic?.goto_question_id ?? ''}
                onChange={(e) => onChange({ logic: { ...question.logic, goto_question_id: parseInt(e.target.value, 10) } as Question['logic'] })}
              />
            </div>
            {question.logic?.if_option_id && (
              <button
                onClick={() => onChange({ logic: null })}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Clear logic
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Builder Page ───────────────────────────────────────────────────────

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const formId = Number(params.formId);

  const [form, setForm] = useState<Form | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localForm = useRef<Form | null>(null);

  // Keep localForm in sync
  useEffect(() => { localForm.current = form; }, [form]);

  // Load form
  useEffect(() => {
    api.forms.get(formId).then((f) => {
      setForm(f);
      if (f.questions.length > 0) setSelectedId(f.questions[0].id);
    }).catch(() => toast.error('Failed to load form'));
  }, [formId]);

  const selectedQuestion = form?.questions.find((q) => q.id === selectedId) ?? null;

  // Debounced autosave
  const scheduleAutosave = useCallback((updates: Partial<Form>) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving('saving');
    saveTimer.current = setTimeout(async () => {
      try {
        const updated = await api.forms.patch(formId, updates);
        setForm((prev) => prev ? { ...prev, ...updated, questions: prev.questions } : null);
        setSaving('saved');
        setTimeout(() => setSaving('idle'), 2000);
      } catch {
        toast.error('Autosave failed');
        setSaving('idle');
      }
    }, 500);
  }, [formId]);

  // Debounced question autosave
  const questionSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleQuestionSave = useCallback((qId: number, updates: Partial<Question>) => {
    if (questionSaveTimer.current) clearTimeout(questionSaveTimer.current);
    setSaving('saving');
    questionSaveTimer.current = setTimeout(async () => {
      try {
        await api.questions.patch(qId, updates);
        setSaving('saved');
        setTimeout(() => setSaving('idle'), 2000);
      } catch {
        toast.error('Failed to save question');
        setSaving('idle');
      }
    }, 500);
  }, []);

  const handleQuestionChange = useCallback((updates: Partial<Question>) => {
    if (!selectedId) return;
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === selectedId ? { ...q, ...updates } : q
        ),
      };
    });
    scheduleQuestionSave(selectedId, updates);
  }, [selectedId, scheduleQuestionSave]);

  // Add question
  const addQuestion = async (type: QuestionType) => {
    setShowTypePicker(false);
    try {
      const defaultOptions =
        type === 'multiple_choice' || type === 'dropdown'
          ? [
              { id: 'opt_a', label: 'Option A' },
              { id: 'opt_b', label: 'Option B' },
            ]
          : type === 'rating'
          ? { max: 5 }
          : [];

      const q = await api.questions.create(formId, {
        type,
        title: '',
        description: '',
        required: false,
        options: defaultOptions as Question['options'],
      });
      setForm((prev) =>
        prev ? { ...prev, questions: [...prev.questions, q] } : prev
      );
      setSelectedId(q.id);
    } catch {
      toast.error('Failed to add question');
    }
  };

  // Delete question
  const deleteQuestion = async (qId: number) => {
    try {
      await api.questions.delete(qId);
      setForm((prev) => {
        if (!prev) return prev;
        const remaining = prev.questions.filter((q) => q.id !== qId);
        return { ...prev, questions: remaining };
      });
      if (selectedId === qId) {
        const remaining = form?.questions.filter((q) => q.id !== qId) ?? [];
        setSelectedId(remaining[0]?.id ?? null);
      }
    } catch {
      toast.error('Failed to delete question');
    }
  };

  // Drag & drop reorder
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !form) return;

    const oldIndex = form.questions.findIndex((q) => q.id === active.id);
    const newIndex = form.questions.findIndex((q) => q.id === over.id);
    const reordered = arrayMove(form.questions, oldIndex, newIndex).map((q, i) => ({
      ...q,
      order_index: i,
    }));

    setForm({ ...form, questions: reordered });

    try {
      await api.questions.reorder(
        formId,
        reordered.map((q) => ({ id: q.id, order_index: q.order_index }))
      );
    } catch {
      toast.error('Failed to save order');
    }
  };

  // Publish
  const handlePublish = async () => {
    const toastId = toast.loading(form?.status === 'published' ? 'Unpublishing...' : 'Publishing...');
    try {
      const updated = form?.status === 'published'
        ? await api.forms.unpublish(formId)
        : await api.forms.publish(formId);
      setForm((prev) => prev ? { ...prev, ...updated } : null);
      toast.success(updated.status === 'published' ? 'Form is live!' : 'Form unpublished', { id: toastId });
    } catch {
      toast.error('Failed to update status', { id: toastId });
    }
  };

  const accent = form?.theme?.accent_color || '#6366f1';

  if (!form) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#f7f8fa' }}>
      {/* ── Top Bar ────────────────────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 h-14 flex items-center gap-4 px-4 border-b"
        style={{ background: '#fff', borderColor: '#e5e7eb', zIndex: 20 }}
      >
        <button
          onClick={() => router.push('/dashboard')}
          className="btn btn-ghost btn-sm !px-2"
          title="Back to dashboard"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-200" />

        {/* Inline title edit */}
        {editingTitle ? (
          <input
            className="flex-1 text-base font-semibold bg-transparent border-b-2 border-indigo-400 outline-none px-1 py-0.5"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => {
              setEditingTitle(false);
              if (titleDraft.trim() && titleDraft !== form.title) {
                setForm((prev) => prev ? { ...prev, title: titleDraft } : null);
                scheduleAutosave({ title: titleDraft });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'Escape') { setEditingTitle(false); setTitleDraft(form.title); }
            }}
            autoFocus
          />
        ) : (
          <h1
            className="flex-1 text-base font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors truncate"
            onClick={() => { setEditingTitle(true); setTitleDraft(form.title); }}
            title="Click to edit title"
          >
            {form.title}
          </h1>
        )}

        {/* Save indicator */}
        <div className="text-xs text-gray-400 flex items-center gap-1.5 flex-shrink-0">
          {saving === 'saving' && (
            <>
              <div className="w-3 h-3 border border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
              Saving...
            </>
          )}
          {saving === 'saved' && (
            <>
              <svg className="w-3 h-3 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
              <span className="text-green-600">Saved</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status badge */}
          <span className={`badge ${form.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${form.status === 'published' ? 'bg-green-500' : 'bg-gray-400'}`} />
            {form.status === 'published' ? 'Published' : 'Draft'}
          </span>

          {/* Results */}
          <button
            onClick={() => router.push(`/forms/${formId}/results`)}
            className="btn btn-secondary btn-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round" /><line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round" /><line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round" />
            </svg>
            Results
          </button>

          {/* Settings */}
          <button onClick={() => setShowSettings(true)} className="btn btn-secondary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Settings
          </button>

          {/* Preview */}
          {form.status === 'published' && (
            <button
              onClick={() => window.open(`/f/${form.public_slug}`, '_blank')}
              className="btn btn-secondary btn-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Preview
            </button>
          )}

          {/* Publish / Unpublish */}
          <button
            id="publish-btn"
            onClick={handlePublish}
            className="btn btn-primary btn-sm"
            style={{ background: form.status === 'published' ? '#6b7280' : accent }}
          >
            {form.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </header>

      {/* ── Three-Column Layout ───────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ── */}
        <aside
          className="w-64 flex-shrink-0 flex flex-col border-r overflow-hidden"
          style={{ background: '#fff', borderColor: '#e5e7eb' }}
        >
          <div className="px-3 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Questions</span>
            <span className="text-xs text-gray-400">{form.questions.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={form.questions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                {form.questions.map((q, idx) => (
                  <SortableQuestionItem
                    key={q.id}
                    question={q}
                    index={idx}
                    selected={selectedId === q.id}
                    onClick={() => setSelectedId(q.id)}
                    onDelete={(e) => { e.stopPropagation(); deleteQuestion(q.id); }}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {form.questions.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">No questions yet</p>
            )}
          </div>

          <div className="p-3 border-t border-gray-100">
            <button
              id="add-question-btn"
              onClick={() => setShowTypePicker(true)}
              className="btn btn-secondary w-full btn-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              Add question
            </button>
          </div>
        </aside>

        {/* ── Center Editor ── */}
        <div
          className="flex-1 flex flex-col overflow-hidden border-r"
          style={{ borderColor: '#e5e7eb' }}
        >
          {selectedQuestion ? (
            <>
              <div
                className="px-5 py-3 border-b flex items-center gap-2"
                style={{ background: '#fff', borderColor: '#f3f4f6' }}
              >
                <span className="text-xs text-gray-400">
                  Q{form.questions.findIndex((q) => q.id === selectedId) + 1}
                </span>
                <span className="text-xs text-gray-300">/</span>
                <span className="text-xs font-medium text-gray-600">Edit question</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <QuestionEditor
                  question={selectedQuestion}
                  onChange={handleQuestionChange}
                  accent={accent}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col gap-4 text-center p-8">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: '#eef2ff' }}
              >
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-700">Add your first question</p>
                <p className="text-sm text-gray-400 mt-1">Click "Add question" to get started</p>
              </div>
              <button
                onClick={() => setShowTypePicker(true)}
                className="btn btn-primary btn-sm"
                style={{ background: accent }}
              >
                Add question
              </button>
            </div>
          )}
        </div>

        {/* ── Right Preview ── */}
        <div
          className="w-96 flex-shrink-0 flex flex-col overflow-hidden"
          style={{ background: form.theme?.background || '#f8f9fb' }}
        >
          <div
            className="px-5 py-3 border-b flex items-center gap-2"
            style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', borderColor: 'rgba(0,0,0,0.06)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-xs font-medium text-gray-500">Live Preview</span>
          </div>

          <div className="flex-1 overflow-y-auto flex items-center justify-center p-8">
            {selectedQuestion ? (
              <div className="w-full max-w-sm">
                <QuestionRenderer
                  question={selectedQuestion}
                  mode="preview"
                  questionNumber={form.questions.findIndex((q) => q.id === selectedId) + 1}
                  accentColor={accent}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center">Select a question to preview</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Type Picker Modal ── */}
      <Modal open={showTypePicker} onClose={() => setShowTypePicker(false)} title="Add a question" size="md">
        <div className="grid grid-cols-3 gap-3">
          {QUESTION_TYPES.map(({ type, label, icon, desc }) => (
            <button
              key={type}
              id={`type-${type}`}
              onClick={() => addQuestion(type)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-center group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold group-hover:scale-110 transition-transform"
                style={{ background: TYPE_COLOR[type] }}
              >
                {icon}
              </div>
              <span className="text-sm font-semibold text-gray-800">{label}</span>
              <span className="text-xs text-gray-400">{desc}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* ── Settings Modal ── */}
      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="Form Settings" size="lg">
        <div className="space-y-6">
          {/* Welcome Screen */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Welcome Screen</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Title</label>
                <input
                  className="input"
                  placeholder="Welcome to our survey!"
                  value={form.welcome_screen?.title ?? ''}
                  onChange={(e) => {
                    const ws = { ...form.welcome_screen, title: e.target.value };
                    setForm((prev) => prev ? { ...prev, welcome_screen: ws } : null);
                    scheduleAutosave({ welcome_screen: ws });
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Description</label>
                <textarea
                  className="input textarea"
                  rows={2}
                  placeholder="A brief intro..."
                  value={form.welcome_screen?.description ?? ''}
                  onChange={(e) => {
                    const ws = { ...form.welcome_screen, description: e.target.value };
                    setForm((prev) => prev ? { ...prev, welcome_screen: ws } : null);
                    scheduleAutosave({ welcome_screen: ws });
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Button text</label>
                <input
                  className="input"
                  placeholder="Start"
                  value={form.welcome_screen?.button_text ?? ''}
                  onChange={(e) => {
                    const ws = { ...form.welcome_screen, button_text: e.target.value };
                    setForm((prev) => prev ? { ...prev, welcome_screen: ws } : null);
                    scheduleAutosave({ welcome_screen: ws });
                  }}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Thank-You Screen */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Thank-You Screen</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Title</label>
                <input
                  className="input"
                  placeholder="Thank you!"
                  value={form.thankyou_screen?.title ?? ''}
                  onChange={(e) => {
                    const ty = { ...form.thankyou_screen, title: e.target.value };
                    setForm((prev) => prev ? { ...prev, thankyou_screen: ty } : null);
                    scheduleAutosave({ thankyou_screen: ty });
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Description</label>
                <textarea
                  className="input textarea"
                  rows={2}
                  placeholder="Your response has been recorded."
                  value={form.thankyou_screen?.description ?? ''}
                  onChange={(e) => {
                    const ty = { ...form.thankyou_screen, description: e.target.value };
                    setForm((prev) => prev ? { ...prev, thankyou_screen: ty } : null);
                    scheduleAutosave({ thankyou_screen: ty });
                  }}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Theme */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Theme</h3>
            <div className="flex gap-4 items-center flex-wrap">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    value={form.theme?.accent_color ?? '#6366f1'}
                    onChange={(e) => {
                      const theme = { ...form.theme, accent_color: e.target.value };
                      setForm((prev) => prev ? { ...prev, theme } : null);
                      scheduleAutosave({ theme });
                    }}
                  />
                  <input
                    className="input w-32 text-sm"
                    value={form.theme?.accent_color ?? '#6366f1'}
                    onChange={(e) => {
                      const theme = { ...form.theme, accent_color: e.target.value };
                      setForm((prev) => prev ? { ...prev, theme } : null);
                      scheduleAutosave({ theme });
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    value={form.theme?.background ?? '#ffffff'}
                    onChange={(e) => {
                      const theme = { ...form.theme, background: e.target.value };
                      setForm((prev) => prev ? { ...prev, theme } : null);
                      scheduleAutosave({ theme });
                    }}
                  />
                  <input
                    className="input w-32 text-sm"
                    value={form.theme?.background ?? '#ffffff'}
                    onChange={(e) => {
                      const theme = { ...form.theme, background: e.target.value };
                      setForm((prev) => prev ? { ...prev, theme } : null);
                      scheduleAutosave({ theme });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={() => setShowSettings(false)} className="btn btn-primary" style={{ background: accent }}>
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
