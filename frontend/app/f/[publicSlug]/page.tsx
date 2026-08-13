'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../../lib/api';
import type { Form, Question } from '../../lib/types';
import QuestionRenderer from '../../components/QuestionRenderer';

// ─── Validation ──────────────────────────────────────────────────────────────

function validateAnswer(question: Question, value: unknown): string | null {
  if (question.required) {
    if (value === null || value === undefined || value === '' || value === 0) {
      // Allow 0 for number & rating
      if (question.type !== 'number' && question.type !== 'rating') {
        return 'This question is required.';
      }
    }
    if (typeof value === 'object' && value !== null) {
      if ('selected_option_id' in (value as object)) {
        const sel = (value as { selected_option_id: string }).selected_option_id;
        if (!sel) return 'Please select an option.';
      }
    }
  }

  if (value !== null && value !== undefined && value !== '') {
    if (question.type === 'email') {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(String(value))) return 'Please enter a valid email address.';
    }
    if (question.type === 'number') {
      if (isNaN(Number(value))) return 'Please enter a valid number.';
    }
  }

  return null;
}

// ─── Progress Bar ────────────────────────────────────────────────────────────

function ProgressBar({
  current,
  total,
  accentColor,
}: {
  current: number;
  total: number;
  accentColor: string;
}) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
      <div
        className="h-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, background: accentColor }}
      />
    </div>
  );
}

// ─── Welcome Screen ──────────────────────────────────────────────────────────

function WelcomeScreen({
  form,
  onStart,
}: {
  form: Form;
  onStart: () => void;
}) {
  const ws = form.welcome_screen;
  const accent = form.theme?.accent_color || '#6366f1';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center min-h-screen text-center px-8 max-w-2xl mx-auto"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-8"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}99)` }}
      >
        T
      </div>
      <h1
        className="text-4xl md:text-5xl font-bold leading-tight mb-4"
        style={{ fontFamily: '"DM Serif Display", Georgia, serif', color: '#111827' }}
      >
        {ws?.title || form.title}
      </h1>
      {(ws?.description || form.description) && (
        <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-lg">
          {ws?.description || form.description}
        </p>
      )}
      <button
        id="start-form-btn"
        onClick={onStart}
        className="btn btn-xl"
        style={{
          background: accent,
          color: '#fff',
          borderRadius: '999px',
          boxShadow: `0 8px 32px ${accent}40`,
        }}
      >
        {ws?.button_text || 'Start'}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <p className="text-xs text-gray-400 mt-6">
        Press <kbd className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500">Enter</kbd> to start
      </p>
    </motion.div>
  );
}

// ─── Thank You Screen ────────────────────────────────────────────────────────

function ThankYouScreen({ form }: { form: Form }) {
  const ty = form.thankyou_screen;
  const accent = form.theme?.accent_color || '#6366f1';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center min-h-screen text-center px-8 max-w-2xl mx-auto"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ background: `${accent}20` }}
      >
        <svg
          className="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke={accent}
          strokeWidth="2.5"
        >
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1
        className="text-4xl md:text-5xl font-bold mb-4"
        style={{ fontFamily: '"DM Serif Display", Georgia, serif', color: '#111827' }}
      >
        {ty?.title || 'Thank you!'}
      </h1>
      <p className="text-lg text-gray-500 max-w-md">
        {ty?.description || 'Your response has been recorded.'}
      </p>
    </motion.div>
  );
}

// ─── Slide transitions ────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({
    y: dir > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    y: dir > 0 ? -80 : 80,
    opacity: 0,
  }),
};

const slideTransition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

// ─── Main Public Flow Page ───────────────────────────────────────────────────

type FlowState = 'loading' | 'welcome' | 'question' | 'thankyou' | 'error';

export default function PublicFormPage() {
  const params = useParams();
  const slug = params.publicSlug as string;

  const [form, setForm] = useState<Form | null>(null);
  const [flowState, setFlowState] = useState<FlowState>('loading');
  const [responseId, setResponseId] = useState<number | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [slideDir, setSlideDir] = useState(1); // 1 = forward, -1 = backward
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load form
  useEffect(() => {
    api.public.getForm(slug)
      .then((f) => {
        setForm(f);
        setFlowState(f.welcome_screen?.title || f.welcome_screen?.description ? 'welcome' : 'question');
      })
      .catch(() => {
        setErrorMessage('This form is not available.');
        setFlowState('error');
      });
  }, [slug]);

  // Start response on welcome screen or immediately
  useEffect(() => {
    if (flowState === 'welcome' || flowState === 'question') {
      if (responseId === null && form) {
        api.public.start(slug).then(({ response_id }) => {
          setResponseId(response_id);
        }).catch(() => {
          // Non-fatal — we'll still show the form
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowState, form]);

  const currentQuestion: Question | null = form?.questions[questionIndex] ?? null;
  const totalQuestions = form?.questions.length ?? 0;
  const accent = form?.theme?.accent_color || '#6366f1';
  const bgColor = form?.theme?.background || '#fff';

  // Determine next question index (handles branching)
  const getNextIndex = useCallback(
    (current: Question, value: unknown): number => {
      // ── New logic_rules format (first-match-wins) ──────────────────────
      if (Array.isArray(current.logic_rules) && current.logic_rules.length > 0) {
        const strVal = typeof value === 'object' && value !== null && 'selected_option_id' in (value as object)
          ? (value as { selected_option_id: string }).selected_option_id
          : String(value ?? '');

        for (const rule of current.logic_rules) {
          const op = rule.condition.operator;
          const rVal = rule.condition.value !== undefined ? String(rule.condition.value) : '';
          let matched = false;

          if (op === 'equals') matched = strVal === rVal;
          else if (op === 'not_equals') matched = strVal !== rVal;
          else if (op === 'contains') matched = strVal.includes(rVal);
          else if (op === 'greater_than') matched = Number(strVal) > Number(rVal);
          else if (op === 'less_than') matched = Number(strVal) < Number(rVal);
          else if (op === 'is_answered') matched = strVal !== '' && strVal !== 'null' && strVal !== 'undefined';
          else if (op === 'is_empty') matched = strVal === '' || strVal === 'null' || strVal === 'undefined';

          if (matched) {
            if (rule.target_is_ending) return form!.questions.length; // → thank you
            if (rule.target_question_id !== null) {
              const idx = form!.questions.findIndex(q => q.id === rule.target_question_id);
              if (idx >= 0) return idx;
            }
          }
        }

        // No rule matched → check default_next
        if (current.default_next_is_ending) return form!.questions.length;
        if (current.default_next_question_id !== null) {
          const idx = form!.questions.findIndex(q => q.id === current.default_next_question_id);
          if (idx >= 0) return idx;
        }
        return questionIndex + 1;
      }

      // ── Legacy logic field fallback ────────────────────────────────────
      if (current.logic?.if_option_id && current.logic?.goto_question_id !== undefined) {
        let selectedId: string | null = null;
        if (typeof value === 'object' && value !== null && 'selected_option_id' in (value as object)) {
          selectedId = (value as { selected_option_id: string }).selected_option_id;
        } else if (typeof value === 'string') {
          selectedId = value;
        }
        if (selectedId === String(current.logic.if_option_id)) {
          const targetIdx = form?.questions.findIndex(
            (q) => q.order_index === current.logic!.goto_question_id
          );
          if (targetIdx !== undefined && targetIdx >= 0) return targetIdx;
        }
      }
      return questionIndex + 1;
    },
    [form, questionIndex]
  );


  const advanceToNext = useCallback(
    async (value: unknown) => {
      if (!currentQuestion || !form) return;

      // Validate first
      const err = validateAnswer(currentQuestion, value);
      if (err) {
        setErrors((prev) => ({ ...prev, [currentQuestion.id]: err }));
        return;
      }
      setErrors((prev) => ({ ...prev, [currentQuestion.id]: '' }));

      // Autosave answer
      if (responseId) {
        try {
          // Check if file upload
          const valObj = value as { _file?: File; filename?: string } | null;
          if (currentQuestion.type === 'file_upload' && valObj?._file) {
            await api.public.answer(responseId, currentQuestion.id, { filename: valObj.filename }, valObj._file);
          } else {
            await api.public.answer(responseId, currentQuestion.id, value);
          }
        } catch {
          // Autosave failure shouldn't block progress
        }
      }

      const nextIdx = getNextIndex(currentQuestion, value);

      if (nextIdx >= totalQuestions) {
        // Submit
        setSubmitting(true);
        if (responseId) {
          try {
            await api.public.submit(responseId);
          } catch {
            // If server-side validation fails, we still show thank-you (frontend already validated)
          }
        }
        setSubmitting(false);
        setFlowState('thankyou');
      } else {
        setSlideDir(1);
        setQuestionIndex(nextIdx);
      }
    },
    [currentQuestion, form, responseId, getNextIndex, totalQuestions]
  );

  const goBack = useCallback(() => {
    if (questionIndex > 0) {
      setSlideDir(-1);
      setQuestionIndex((i) => i - 1);
      setErrors({});
    } else if (flowState === 'question' && (form?.welcome_screen?.title || form?.welcome_screen?.description)) {
      setFlowState('welcome');
    }
  }, [questionIndex, flowState, form]);

  // Keyboard: Enter to advance from welcome screen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && flowState === 'welcome') {
        setFlowState('question');
      }
      if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flowState, goBack]);

  // ── Render ──────────────────────────────────────────────────────────────────

  if (flowState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fafafa' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading form...</p>
        </div>
      </div>
    );
  }

  if (flowState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-8">
        <div>
          <div className="text-5xl mb-4">404</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Form not found</h1>
          <p className="text-gray-500">{errorMessage || 'This form is not published or does not exist.'}</p>
        </div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: bgColor }}>
      {/* Progress bar */}
      {flowState === 'question' && (
        <ProgressBar current={questionIndex + 1} total={totalQuestions} accentColor={accent} />
      )}

      {/* Navigation controls */}
      {(flowState === 'question') && (
        <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-3">
          {/* Back button */}
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 text-gray-400 hover:text-gray-700 hover:bg-white hover:shadow-md"
            style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)' }}
            title="Previous (Shift+Tab or ↑)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Question counter */}
          <div
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', color: '#6b7280' }}
          >
            {questionIndex + 1} / {totalQuestions}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" custom={slideDir}>
        {flowState === 'welcome' && (
          <WelcomeScreen
            key="welcome"
            form={form}
            onStart={() => setFlowState('question')}
          />
        )}

        {flowState === 'question' && currentQuestion && (
          <motion.div
            key={`q-${questionIndex}`}
            custom={slideDir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="min-h-screen flex items-center justify-center px-8 py-16"
          >
            <div className="w-full max-w-xl">
              <QuestionRenderer
                question={currentQuestion}
                mode="respondent"
                value={answers[currentQuestion.id]}
                onChange={(val) => {
                  setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
                  setErrors((prev) => ({ ...prev, [currentQuestion.id]: '' }));
                }}
                onSubmit={(val) => {
                  const finalVal = val !== undefined ? val : answers[currentQuestion.id];
                  setAnswers((prev) => ({ ...prev, [currentQuestion.id]: finalVal }));
                  advanceToNext(finalVal);
                }}
                error={errors[currentQuestion.id]}
                questionNumber={questionIndex + 1}
                accentColor={accent}
              />

              {submitting && (
                <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
                  Submitting...
                </div>
              )}
            </div>
          </motion.div>
        )}

        {flowState === 'thankyou' && (
          <ThankYouScreen key="thankyou" form={form} />
        )}
      </AnimatePresence>
    </div>
  );
}
