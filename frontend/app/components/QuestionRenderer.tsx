'use client';

import { useState, useEffect, useRef } from 'react';
import type { Question, QuestionOption } from '../lib/types';
import RatingIcon from './RatingIcon';

export type RendererMode = 'preview' | 'respondent';

interface QuestionRendererProps {
  question: Question;
  mode: RendererMode;
  value?: unknown;
  onChange?: (value: unknown) => void;
  onSubmit?: (value: unknown) => void;
  error?: string;
  questionNumber?: number;
  questionLetter?: string;
  accentColor?: string;
  hideSubmitButton?: boolean;
}

const LETTER_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function getOptions(q: Question): QuestionOption[] {
  if (Array.isArray(q.options)) return q.options as QuestionOption[];
  return [];
}

function getRatingMax(q: Question): number {
  if (q.options && !Array.isArray(q.options) && typeof q.options === 'object') {
    return (q.options as { max: number }).max ?? 5;
  }
  return 5;
}

export default function QuestionRenderer(props: QuestionRendererProps) {
  // Use a unique key combining ID and type to force a full remount when the question type changes.
  // This prevents React hook order violations since different types use different hooks.
  return <QuestionRendererInner key={`${props.question.id}-${props.question.type}`} {...props} />;
}

const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', dial: '+93' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dial: '+1' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', dial: '+44' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dial: '+91' },
];

function PhoneNumberRenderer({
  question, mode, value, onChange, onSubmit, error, questionNumber, questionLetter, accentColor = '#6366f1',
  focused, setFocused, handleEnter, isRespondent, inputRef, hideSubmitButton
}: any) {
  const defaultCountryCode = getOptions(question).find((o) => o.id === 'country')?.label || 'US';
  const [selectedCountry, setSelectedCountry] = useState(defaultCountryCode);
  
  // Update state when builder changes it
  useEffect(() => {
    setSelectedCountry(defaultCountryCode);
  }, [defaultCountryCode]);

  const currentCountry = COUNTRIES.find(c => c.code === selectedCountry) || COUNTRIES[1];
  const accent = accentColor;

  return (
    <div className="w-full">
      <QuestionTitle question={question} questionNumber={questionNumber} questionLetter={questionLetter} />
      <div className="relative mt-6 flex items-center gap-4">
        
        {/* Country Dropdown */}
        <div className="relative flex-shrink-0">
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              if (value) {
                const newDial = COUNTRIES.find(c => c.code === e.target.value)?.dial || '+1';
                const currentNum = String(value).replace(/^\+\d+\s*/, '');
                onChange?.(`${newDial} ${currentNum}`);
              }
            }}
            disabled={!isRespondent}
            className="appearance-none bg-transparent border-0 border-b-2 text-xl py-3 pl-2 pr-8 outline-none transition-all duration-200 cursor-pointer"
            style={{
              borderColor: focused ? accent : '#e5e7eb',
              color: '#111827',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.dial}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-sm">
            ▼
          </div>
          <div
            className="absolute bottom-0 left-0 h-0.5 transition-all duration-300"
            style={{ width: focused ? '100%' : '0%', background: accent }}
          />
        </div>

        {/* Number Input */}
        <div className="relative flex-1">
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="tel"
            className="w-full bg-transparent border-0 border-b-2 text-xl py-3 px-0 outline-none transition-all duration-200"
            style={{
              borderColor: focused ? accent : '#e5e7eb',
              color: '#111827',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
            placeholder="081234 56789"
            value={typeof value === 'string' ? value.replace(/^\+\d+\s*/, '') : typeof value === 'number' ? String(value) : ''}
            onChange={(e) => {
              // Strip out any non-numeric characters (allow spaces and dashes)
              let val = e.target.value.replace(/[^\d\s-]/g, '');
              // Strip spaces and dashes for length counting
              const digitCount = val.replace(/[\s-]/g, '').length;
              if (digitCount > 10) {
                // If they paste or type more than 10 digits, slice it
                const stripped = val.replace(/[\s-]/g, '').slice(0, 10);
                // We'll just set it to the stripped version without spaces for simplicity if it exceeds
                val = stripped;
              }
              onChange?.(val ? `${currentCountry.dial} ${val}` : '');
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleEnter}
            readOnly={!isRespondent}
          />
          <div
            className="absolute bottom-0 left-0 h-0.5 transition-all duration-300"
            style={{ width: focused ? '100%' : '0%', background: accent }}
          />
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {isRespondent && !hideSubmitButton && (
        <div className="mt-4">
          <button
            className="btn btn-primary btn-sm"
            style={{ background: accent }}
            onClick={() => onSubmit?.(value)}
          >
            OK <span className="opacity-70 text-xs">↵</span>
          </button>
        </div>
      )}
    </div>
  );
}

function QuestionRendererInner({
  question,
  mode,
  value,
  onChange,
  onSubmit,
  error,
  questionNumber,
  questionLetter,
  accentColor = '#6366f1',
  hideSubmitButton = false,
}: QuestionRendererProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  const isRespondent = mode === 'respondent';

  // Auto-focus in respondent mode
  useEffect(() => {
    if (isRespondent && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [question.id, isRespondent]);

  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && isRespondent) {
      e.preventDefault();
      onSubmit?.(value);
    }
  };

  const accent = accentColor;
  const accentLight = `${accent}20`;

  // ── Short Text ──────────────────────────────────────────────────────────
  if (question.type === 'short_text' || question.type === 'email') {
    const opts = Array.isArray(question.options) ? question.options : [];
    const maxCharsStr = opts.find((o: any) => o.id === 'max_chars')?.label;
    const maxChars = maxCharsStr && !isNaN(parseInt(maxCharsStr, 10)) ? parseInt(maxCharsStr, 10) : undefined;
    const customPlaceholder = opts.find((o: any) => o.id === 'placeholder')?.label;
    const validationOpt = opts.find((o: any) => o.id === 'validation')?.label;
    
    // Determine input type based on validation or question type
    let inputType = question.type === 'email' ? 'email' : 'text';
    if (question.type === 'short_text' && validationOpt) {
      if (validationOpt === 'number') inputType = 'number';
      else if (validationOpt === 'email') inputType = 'email';
      else if (validationOpt === 'url') inputType = 'url';
    }

    const placeholder = customPlaceholder || (inputType === 'email' ? 'name@example.com' : 'Type your answer here...');

    return (
      <div className="w-full">
        <QuestionTitle question={question} questionNumber={questionNumber} questionLetter={questionLetter} />
        <div className="relative mt-6">
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type={inputType}
            maxLength={maxChars}
            className="w-full bg-transparent border-0 border-b-2 text-xl py-3 px-0 outline-none transition-all duration-200"
            style={{
              borderColor: focused ? accent : '#e5e7eb',
              color: '#111827',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
            placeholder={placeholder}
            value={typeof value === 'string' ? value : typeof value === 'number' ? String(value) : ''}
            onChange={(e) => {
              if (maxChars && e.target.value.length > maxChars) {
                onChange?.(e.target.value.slice(0, maxChars));
              } else {
                onChange?.(e.target.value);
              }
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleEnter}
            readOnly={!isRespondent}
          />
          <div
            className="absolute bottom-0 left-0 h-0.5 transition-all duration-300"
            style={{ width: focused ? '100%' : '0%', background: accent }}
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        {isRespondent && !hideSubmitButton && (
          <div className="mt-4">
            <button
              className="btn btn-primary btn-sm"
              style={{ background: accent }}
              onClick={() => onSubmit?.(value)}
            >
              OK <span className="opacity-70 text-xs">↵</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Long Text ───────────────────────────────────────────────────────────
  if (question.type === 'long_text') {
    return (
      <div className="w-full">
        <QuestionTitle question={question} questionNumber={questionNumber} questionLetter={questionLetter} />
        <div className="relative mt-6">
          <textarea
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            className="w-full bg-transparent border-0 border-b-2 text-xl py-3 px-0 outline-none transition-all duration-200 resize-none"
            style={{
              borderColor: focused ? accent : '#e5e7eb',
              color: '#111827',
              fontFamily: 'Inter, system-ui, sans-serif',
              minHeight: '120px',
            }}
            placeholder="Type your answer here... (Shift+Enter for new line)"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && isRespondent) {
                e.preventDefault();
                onSubmit?.(value);
              }
            }}
            readOnly={!isRespondent}
          />
          <div
            className="absolute bottom-0 left-0 h-0.5 transition-all duration-300"
            style={{ width: focused ? '100%' : '0%', background: accent }}
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        {isRespondent && !hideSubmitButton && (
          <p className="mt-2 text-sm text-gray-400">
            Press <kbd className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">↵</kbd> for a new line, or <kbd className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">Ctrl ↵</kbd> to submit
          </p>
        )}
        {isRespondent && !hideSubmitButton && (
          <div className="mt-4">
            <button
              className="btn btn-primary btn-sm"
              style={{ background: accent }}
              onClick={() => onSubmit?.(value)}
            >
              OK <span className="opacity-70 text-xs">↵</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Number (Phone Number) ───────────────────────────────────────────────
  if (question.type === 'number') {
    return (
      <PhoneNumberRenderer 
        {...{ question, mode, value, onChange, onSubmit, error, questionNumber, questionLetter, accentColor, focused, setFocused, handleEnter, isRespondent, inputRef, hideSubmitButton }} 
      />
    );
  }

  // ── Multiple Choice ─────────────────────────────────────────────────────
  if (question.type === 'multiple_choice' || question.type === 'dropdown') {
    const options = getOptions(question);
    const selectedId =
      typeof value === 'object' && value !== null && 'selected_option_id' in (value as object)
        ? (value as { selected_option_id: string }).selected_option_id
        : typeof value === 'string'
          ? value
          : null;

    const handleSelect = (optId: string) => {
      if (!isRespondent) return;
      const newVal = { selected_option_id: optId };
      onChange?.(newVal);
      // Auto-advance after a short delay for better UX
      setTimeout(() => onSubmit?.(newVal), 400);
    };

    // Keyboard shortcut: A, B, C... selects option
    useEffect(() => {
      if (!isRespondent) return;
      const handler = (e: KeyboardEvent) => {
        const idx = LETTER_KEYS.indexOf(e.key.toUpperCase());
        if (idx >= 0 && idx < options.length) {
          handleSelect(options[idx].id);
        }
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRespondent, options, value]);

    return (
      <div className="w-full">
        <QuestionTitle question={question} questionNumber={questionNumber} questionLetter={questionLetter} />
        <div className="mt-6 space-y-3 max-w-xl">
          {options.map((opt, idx) => {
            const isSelected = selectedId === opt.id;
            return (
              <button
                key={opt.id}
                id={`option-${question.id}-${opt.id}`}
                onClick={() => handleSelect(opt.id)}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150 font-medium"
                style={{
                  borderColor: isSelected ? accent : '#e5e7eb',
                  background: isSelected ? accentLight : '#fff',
                  color: isSelected ? accent : '#374151',
                  cursor: isRespondent ? 'pointer' : 'default',
                  transform: isSelected ? 'translateX(4px)' : 'none',
                }}
              >
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold border"
                  style={{
                    borderColor: isSelected ? accent : '#d1d5db',
                    background: isSelected ? accent : '#f9fafb',
                    color: isSelected ? '#fff' : '#6b7280',
                  }}
                >
                  {LETTER_KEYS[idx]}
                </span>
                <span>{opt.label}</span>
                {isSelected && (
                  <svg className="ml-auto w-5 h-5" viewBox="0 0 20 20" fill={accent}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  // ── Yes / No ────────────────────────────────────────────────────────────
  if (question.type === 'yes_no') {
    const handleYesNo = (val: string) => {
      if (!isRespondent) return;
      onChange?.(val);
      setTimeout(() => onSubmit?.(val), 300);
    };

    useEffect(() => {
      if (!isRespondent) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'y') handleYesNo('yes');
        if (e.key.toLowerCase() === 'n') handleYesNo('no');
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRespondent]);

    return (
      <div className="w-full">
        <QuestionTitle question={question} questionNumber={questionNumber} questionLetter={questionLetter} />
        <div className="mt-6 flex gap-4">
          {[
            { val: 'yes', label: 'Yes', key: 'Y', emoji: '👍' },
            { val: 'no', label: 'No', key: 'N', emoji: '👎' },
          ].map(({ val, label, key, emoji }) => {
            const isSelected = value === val;
            return (
              <button
                key={val}
                id={`yesno-${question.id}-${val}`}
                onClick={() => handleYesNo(val)}
                className="flex items-center gap-3 px-6 py-4 rounded-xl border-2 font-semibold text-lg transition-all duration-150"
                style={{
                  borderColor: isSelected ? accent : '#e5e7eb',
                  background: isSelected ? accentLight : '#fff',
                  color: isSelected ? accent : '#374151',
                  cursor: isRespondent ? 'pointer' : 'default',
                }}
              >
                <span className="text-2xl">{emoji}</span>
                <span>{label}</span>
                <kbd className="ml-2 text-xs opacity-50 px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{key}</kbd>
              </button>
            );
          })}
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  // ── Rating ──────────────────────────────────────────────────────────────
  if (question.type === 'rating') {
    const max = getRatingMax(question);
    const numVal = typeof value === 'number' ? value : null;
    
    const opts = Array.isArray(question.options) ? question.options : [];
    const shape = opts.find((o: any) => o.id === 'shape')?.label || 'star';

    const handleRating = (n: number) => {
      if (!isRespondent) return;
      onChange?.(n);
      setTimeout(() => onSubmit?.(n), 300);
    };

    useEffect(() => {
      if (!isRespondent) return;
      const handler = (e: KeyboardEvent) => {
        const n = parseInt(e.key, 10);
        if (!isNaN(n) && n >= 1 && n <= max) handleRating(n);
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRespondent, max]);

    return (
      <div className="w-full">
        <QuestionTitle question={question} questionNumber={questionNumber} questionLetter={questionLetter} />
        <div className="mt-6 flex flex-col items-start gap-4">
          <div className="flex gap-4 flex-wrap">
            {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
              const isSelected = numVal !== null && n <= numVal;
              const isExact = numVal === n;
              return (
                <div key={n} className="flex flex-col items-center gap-2">
                  <button
                    id={`rating-${question.id}-${n}`}
                    onClick={() => handleRating(n)}
                    className="transition-all duration-150 outline-none flex items-center justify-center"
                    style={{
                      color: isSelected ? accent : '#e5e7eb',
                      cursor: isRespondent ? 'pointer' : 'default',
                      transform: isExact ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    <RatingIcon 
                      shape={shape} 
                      className={`w-10 h-10 stroke-[1.5] transition-colors ${isSelected ? 'fill-current' : 'fill-transparent hover:fill-gray-100 hover:text-gray-400'}`} 
                    />
                  </button>
                  <span className="text-sm font-semibold text-gray-500">{n}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400 max-w-xs">
            <span>Not at all</span>
            <span>Absolutely</span>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  // ── File Upload ─────────────────────────────────────────────────────────
  if (question.type === 'file_upload') {
    const fileVal = value as { filename?: string } | null;
    return (
      <div className="w-full">
        <QuestionTitle question={question} questionNumber={questionNumber} questionLetter={questionLetter} />
        <div className="mt-6">
          {isRespondent ? (
            <div>
              <label
                htmlFor={`file-${question.id}`}
                className="flex flex-col items-center justify-center w-full max-w-sm h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-150 hover:border-indigo-400 hover:bg-indigo-50"
                style={{ borderColor: '#d1d5db' }}
              >
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-500">
                  {fileVal?.filename ? (
                    <span className="font-medium text-indigo-600">{fileVal.filename}</span>
                  ) : (
                    <><span className="font-medium text-indigo-600">Click to upload</span> or drag and drop</>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
              </label>
              <input
                id={`file-${question.id}`}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    onChange?.({ filename: f.name, _file: f });
                    onSubmit?.({ filename: f.name, _file: f });
                  }
                }}
              />
              {fileVal?.filename && (
                <p className="mt-2 text-sm text-green-600 font-medium">✓ {fileVal.filename} selected</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 max-w-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              File upload
            </div>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="text-gray-400 italic">Unknown question type: {question.type}</div>
  );
}

// ── Shared Question Title ─────────────────────────────────────────────────────

function QuestionTitle({
  question,
  questionNumber,
  questionLetter,
}: {
  question: Question;
  questionNumber?: number;
  questionLetter?: string;
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        {questionNumber !== undefined && (
          <span className="text-sm text-gray-400 mt-1 flex-shrink-0 font-medium">
            {questionNumber}{questionLetter || ''}
            <span className="ml-0.5">→</span>
          </span>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold leading-tight text-gray-900 font-serif">
            {question.title || <span className="text-gray-300">Untitled question</span>}
            {question.required && <span className="text-red-400 ml-1 text-lg">*</span>}
          </h2>
          {question.description && (
            <p className="mt-2 text-base text-gray-500">{question.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
