'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '../../../lib/api';
import type { Form, Question, QuestionType } from '../../../lib/types';
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

export default function BuilderPage() {
  const params = useParams();
  const formId = Number(params.formId);

  const [form, setForm] = useState<Form | null>(null);
  const [activeItem, setActiveItem] = useState<'welcome' | 'thankyou' | number>('welcome');
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
      ? form?.questions.find((q) => q.id === activeItem) ?? null
      : null;

  // Debounced Form Autosave
  const scheduleFormAutosave = useCallback(
    (updates: Partial<Form>) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          const updated = await api.forms.patch(formId, updates);
          setForm((prev) =>
            prev ? { ...prev, ...updated, questions: prev.questions } : null
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
    setForm((prev) => (prev ? { ...prev, title: newTitle } : null));
    scheduleFormAutosave({ title: newTitle });
  };

  const handleUpdateWelcome = (welcomeUpdates: Partial<Form['welcome_screen']>) => {
    setForm((prev) => {
      if (!prev) return prev;
      const updatedWelcome = { ...prev.welcome_screen, ...welcomeUpdates };
      scheduleFormAutosave({ welcome_screen: updatedWelcome });
      return { ...prev, welcome_screen: updatedWelcome };
    });
  };

  const handleUpdateThankYou = (thankyouUpdates: Partial<Form['thankyou_screen']>) => {
    setForm((prev) => {
      if (!prev) return prev;
      const updatedThankYou = { ...prev.thankyou_screen, ...thankyouUpdates };
      scheduleFormAutosave({ thankyou_screen: updatedThankYou });
      return { ...prev, thankyou_screen: updatedThankYou };
    });
  };

  const handleUpdateQuestion = (updates: Partial<Question>) => {
    if (typeof activeItem !== 'number') return;
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === activeItem ? { ...q, ...updates } : q
        ),
      };
    });
    scheduleQuestionAutosave(activeItem, updates);
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

      setForm((prev) =>
        prev ? { ...prev, questions: [...prev.questions, q] } : prev
      );
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
        const remaining = prev.questions.filter((q) => q.id !== qId);
        return { ...prev, questions: remaining };
      });
      if (activeItem === qId) {
        setActiveItem('welcome');
      }
    } catch {
      toast.error('Failed to delete question');
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
      />

      {/* Main Workspace (Three Columns) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Column 1: Left Sidebar (Pages & Endings) */}
        <BuilderLeftSidebar
          questions={form.questions}
          activeItem={activeItem}
          onSelectWelcome={() => setActiveItem('welcome')}
          onSelectThankYou={() => setActiveItem('thankyou')}
          onSelectQuestion={(id) => setActiveItem(id)}
          onAddQuestion={() => setShowTypePicker(true)}
          onDeleteQuestion={handleDeleteQuestion}
        />

        {/* Column 2: Center Editor Canvas */}
        <BuilderCenterCanvas
          form={form}
          activeItem={activeItem}
          selectedQuestion={selectedQuestion}
          onAddQuestion={() => setShowTypePicker(true)}
          onUpdateWelcome={handleUpdateWelcome}
          onUpdateQuestion={handleUpdateQuestion}
          onUpdateThankYou={handleUpdateThankYou}
        />

        {/* Column 3: Right Properties Panel */}
        <BuilderRightSidebar
          form={form}
          activeItem={activeItem}
          selectedQuestion={selectedQuestion}
          onUpdateWelcome={handleUpdateWelcome}
          onUpdateQuestion={handleUpdateQuestion}
          onUpdateThankYou={handleUpdateThankYou}
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
