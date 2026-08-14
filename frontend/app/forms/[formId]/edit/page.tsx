'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '../../../lib/api';
import type { Form, Page, Question, QuestionType } from '../../../lib/types';
import Modal from '../../../components/Modal';
import BuilderTopBar from '../../../components/builder/BuilderTopBar';
import BuilderLeftSidebar from '../../../components/builder/BuilderLeftSidebar';
import BuilderCenterCanvas from '../../../components/builder/BuilderCenterCanvas';
import BuilderRightSidebar from '../../../components/builder/BuilderRightSidebar';

const QUESTION_TYPES: { type: QuestionType; label: string; icon: string; desc: string }[] = [
  { type: 'short_text', label: 'Short Text', icon: 'T', desc: 'One-line text answer' },
  { type: 'long_text', label: 'Long Text', icon: '¶', desc: 'Multi-line text answer' },
  { type: 'multiple_choice', label: 'Multiple Choice', icon: '○', desc: 'Select one option' },
  { type: 'dropdown', label: 'Dropdown', icon: '▾', desc: 'Pick from a list' },
  { type: 'email', label: 'Email', icon: '@', desc: 'Email address' },
  { type: 'number', label: 'Phone Number', icon: '📞', desc: 'Numeric input' },
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

export default function BuilderPage() {
  const params = useParams();
  const formId = Number(params.formId);

  const [form, setForm] = useState<Form | null>(null);
  const [activeItem, setActiveItem] = useState<'welcome' | number | string>('welcome');
  const [showTypePicker, setShowTypePicker] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const questionSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load Form Data
  useEffect(() => {
    api.forms
      .get(formId)
      .then((f) => {
        setForm(f);
      })
      .catch(() => toast.error('Failed to load form data'));
  }, [formId]);

  // Selected Question object if activeItem is a question ID
  const selectedQuestion =
    typeof activeItem === 'number'
      ? form?.pages.flatMap(p => p.questions).find((q) => q.id === activeItem) ?? null
      : null;

  // Debounced Form Autosave
  const scheduleFormAutosave = useCallback(
    (updates: Partial<Form>) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          const updated = await api.forms.patch(formId, updates);
          setForm((prev) =>
            prev ? { ...prev, ...updated, pages: prev.pages } : null
          );
        } catch {
          toast.error('Autosave failed');
        }
      }, 500);
    },
    [formId]
  );

  // Debounced Question Autosave
  const scheduleQuestionAutosave = useCallback(
    (qId: number, updates: Partial<Question>) => {
      if (questionSaveTimer.current) clearTimeout(questionSaveTimer.current);
      questionSaveTimer.current = setTimeout(async () => {
        try {
          await api.questions.patch(qId, updates);
        } catch {
          toast.error('Failed to save question');
        }
      }, 500);
    },
    []
  );

  // Handlers
  const handleTitleChange = (newTitle: string) => {
    setForm((prev) => (prev ? { ...prev, title: newTitle, status: 'draft' } : null));
    scheduleFormAutosave({ title: newTitle, status: 'draft' });
  };

  const handleUpdateWelcome = (welcomeUpdates: Partial<Form['welcome_screen']>) => {
    setForm((prev) => {
      if (!prev) return prev;
      const updatedWelcome = { ...prev.welcome_screen, ...welcomeUpdates };
      scheduleFormAutosave({ welcome_screen: updatedWelcome, status: 'draft' });
      return { ...prev, welcome_screen: updatedWelcome, status: 'draft' };
    });
  };

  const handleUpdateThankYou = (thankyouUpdates: Partial<Form['thankyou_screen']>) => {
    setForm((prev) => {
      if (!prev) return prev;
      const updatedThankYou = { ...prev.thankyou_screen, ...thankyouUpdates };
      scheduleFormAutosave({ thankyou_screen: updatedThankYou, status: 'draft' });
      return { ...prev, thankyou_screen: updatedThankYou, status: 'draft' };
    });
  };

  const handleUpdateQuestion = (qId: number, updates: Partial<Question>) => {
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        status: 'draft',
        pages: prev.pages.map((p) => ({
          ...p,
          questions: p.questions.map((q) =>
            q.id === qId ? { ...q, ...updates } : q
          ),
        })),
      };
    });
    scheduleQuestionAutosave(qId, updates);
    scheduleFormAutosave({ status: 'draft' });
  };

  const handleAddQuestion = async (type: QuestionType) => {
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
        title: 'Untitled Question',
        description: '',
        required: false,
        options: defaultOptions as Question['options'],
      });

      // Fetch the full form again to get the proper page structure
      const updatedForm = await api.forms.get(formId);
      setForm(updatedForm);
      api.forms.patch(formId, { status: 'draft' });
      setActiveItem(q.id);
    } catch {
      toast.error('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (qId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.questions.delete(qId);
      setForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'draft',
          pages: prev.pages.map(p => ({
            ...p,
            questions: p.questions.filter(q => q.id !== qId)
          })).filter(p => p.questions.length > 0)
        };
      });
      api.forms.patch(formId, { status: 'draft' });
      if (activeItem === qId) {
        setActiveItem('welcome');
      }
    } catch {
      toast.error('Failed to delete question');
    }
  };

  const handleMoveQuestion = async (questionId: number, targetId: number, targetType: 'page' | 'question', position: 'merge_into' | 'before' | 'after') => {
    try {
      // Optimistic update would be complex, so we'll just fetch after
      await api.questions.move(questionId, targetId, targetType, position);
      const updatedForm = await api.forms.get(formId);
      setForm(updatedForm);
      api.forms.patch(formId, { status: 'draft' });
    } catch {
      toast.error('Failed to move question');
    }
  };

  const handleSplitPage = async (pageId: number, questionId: number) => {
    try {
      await api.pages.split(pageId, questionId);
      const updatedForm = await api.forms.get(formId);
      setForm(updatedForm);
      api.forms.patch(formId, { status: 'draft' });
    } catch {
      toast.error('Failed to split question');
    }
  };

  if (!form) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <BuilderTopBar
        formId={formId}
        formTitle={form.title}
        publicSlug={form.public_slug}
        status={form.status}
        onTitleChange={handleTitleChange}
        onPublish={(updatedForm) => setForm(updatedForm)}
      />

      {/* Main Workspace (Three Columns) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Column 1: Left Sidebar (Pages & Endings) */}
        <BuilderLeftSidebar
          pages={form.pages}
          activeItem={activeItem}
          onSelectWelcome={() => setActiveItem('welcome')}
          onSelectEnding={(id) => setActiveItem(id)}
          onSelectQuestion={(id) => setActiveItem(id)}
          onAddQuestion={() => setShowTypePicker(true)}
          onDeleteQuestion={handleDeleteQuestion}
          onMoveQuestion={handleMoveQuestion}
          onSplitPage={handleSplitPage}
        />

        {/* Column 2: Center Editor Canvas */}
        <BuilderCenterCanvas
          form={form}
          activeItem={activeItem}
          selectedQuestion={selectedQuestion}
          onAddQuestion={() => setShowTypePicker(true)}
          onSelectQuestion={(id) => setActiveItem(id)}
          onUpdateWelcome={handleUpdateWelcome}
          onUpdateQuestion={handleUpdateQuestion}
          onUpdateThankYou={handleUpdateThankYou}
        />

        {/* Column 3: Right Properties Sidebar */}
        <BuilderRightSidebar
          form={form}
          activeItem={activeItem}
          selectedQuestion={selectedQuestion}
          onUpdateWelcome={handleUpdateWelcome}
          onUpdateQuestion={(updates) => {
            if (typeof activeItem === 'number') {
              handleUpdateQuestion(activeItem, updates);
            }
          }}
          onUpdateThankYou={handleUpdateThankYou}
          onUpdateTheme={(themeUpdates) => {
            setForm((prev) => (prev ? { ...prev, theme: { ...prev.theme, ...themeUpdates }, status: 'draft' } : null));
            scheduleFormAutosave({ theme: { ...(form.theme || {}), ...themeUpdates }, status: 'draft' });
          }}
        />
      </div>

      {/* Question Type Selection Modal */}
      <Modal
        open={showTypePicker}
        onClose={() => setShowTypePicker(false)}
        title="Add a question"
        size="md"
      >
        <div className="grid grid-cols-3 gap-3">
          {QUESTION_TYPES.map(({ type, label, icon, desc }) => (
            <button
              key={type}
              id={`type-${type}`}
              onClick={() => handleAddQuestion(type)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-black hover:bg-gray-50 transition-all text-center group cursor-pointer"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold group-hover:scale-110 transition-transform"
                style={{ background: TYPE_COLOR[type] }}
              >
                {icon}
              </div>
              <span className="text-xs font-semibold text-gray-900">{label}</span>
              <span className="text-[11px] text-gray-400 leading-tight">
                {desc}
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
