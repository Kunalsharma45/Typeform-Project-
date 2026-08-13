'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Form, Question, QuestionType } from '../../lib/types';
import {
  ChevronDown,
  HelpCircle,
  Plus,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

const QUESTION_TYPES: { type: QuestionType; label: string }[] = [
  { type: 'short_text', label: 'Short Text' },
  { type: 'long_text', label: 'Long Text' },
  { type: 'multiple_choice', label: 'Multiple Choice' },
  { type: 'dropdown', label: 'Dropdown' },
  { type: 'email', label: 'Email' },
  { type: 'number', label: 'Number' },
  { type: 'yes_no', label: 'Yes / No' },
  { type: 'rating', label: 'Rating' },
  { type: 'file_upload', label: 'File Upload' },
];

interface BuilderRightSidebarProps {
  form: Form;
  activeItem: 'welcome' | 'thankyou' | number;
  selectedQuestion: Question | null;
  onUpdateWelcome: (welcome: Partial<Form['welcome_screen']>) => void;
  onUpdateQuestion: (updates: Partial<Question>) => void;
  onUpdateThankYou: (thankyou: Partial<Form['thankyou_screen']>) => void;
}

export default function BuilderRightSidebar({
  form,
  activeItem,
  selectedQuestion,
  onUpdateWelcome,
  onUpdateQuestion,
  onUpdateThankYou,
}: BuilderRightSidebarProps) {
  const [timeToCompleteToggle, setTimeToCompleteToggle] = useState(false);
  const [numSubmissionsToggle, setNumSubmissionsToggle] = useState(false);

  const showComingSoon = () => {
    toast('Coming soon', { icon: '🚧' });
  };

  const welcome = form.welcome_screen || {};
  const thankyou = form.thankyou_screen || {};
  const buttonVal = welcome.button_text ?? 'Start';

  const getItemLabel = () => {
    if (activeItem === 'welcome') return 'Welcome Screen';
    if (activeItem === 'thankyou') return 'Thank You Screen';
    if (selectedQuestion) {
      const idx = form.questions.findIndex((q) => q.id === selectedQuestion.id);
      return `Question ${idx + 1}`;
    }
    return 'Settings';
  };

  return (
    <aside className="w-[280px] min-w-[280px] bg-white border-l border-gray-200/80 flex flex-col justify-between p-5 h-[calc(100vh-53px)] overflow-y-auto relative">
      <div className="space-y-6">
        {/* Top Dropdown Selector */}
        <button
          onClick={showComingSoon}
          className="w-full border border-gray-200 hover:border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-900 flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
        >
          <span>{getItemLabel()}</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {/* ── Welcome Screen Settings ─────────────────────────────────── */}
        {activeItem === 'welcome' && (
          <div className="space-y-5">
            {/* Toggle: Time to complete */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <span>Time to complete</span>
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <button
                onClick={() => setTimeToCompleteToggle(!timeToCompleteToggle)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  timeToCompleteToggle ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 left-0.5 ${
                    timeToCompleteToggle ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle: Number of submissions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <span>Number of submissions</span>
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <button
                onClick={() => setNumSubmissionsToggle(!numSubmissionsToggle)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  numSubmissionsToggle ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 left-0.5 ${
                    numSubmissionsToggle ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Button Text Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Button
              </label>
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-black rounded-xl px-3 py-2 text-xs font-medium outline-none transition-all"
                value={buttonVal}
                onChange={(e) => onUpdateWelcome({ button_text: e.target.value })}
                maxLength={24}
              />
              <div className="text-right text-[11px] text-gray-400 font-medium">
                {buttonVal.length}/24
              </div>
            </div>

            {/* Media Upload Box */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Image or video
              </label>
              <div
                onClick={showComingSoon}
                className="w-12 h-12 rounded-xl border border-gray-200 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* ── Question Settings ───────────────────────────────────────── */}
        {typeof activeItem === 'number' && selectedQuestion && (
          <div className="space-y-5">
            {/* Question Type Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Question type
              </label>
              <select
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 outline-none cursor-pointer"
                value={selectedQuestion.type}
                onChange={(e) =>
                  onUpdateQuestion({ type: e.target.value as QuestionType })
                }
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Required Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">
                Required
              </span>
              <button
                onClick={() =>
                  onUpdateQuestion({ required: !selectedQuestion.required })
                }
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  selectedQuestion.required ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 left-0.5 ${
                    selectedQuestion.required
                      ? 'translate-x-4'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Image or Video Dropzone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Image or video
              </label>
              <div
                onClick={showComingSoon}
                className="w-12 h-12 rounded-xl border border-gray-200 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* ── Thank You Screen Settings ───────────────────────────────── */}
        {activeItem === 'thankyou' && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Title
              </label>
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none"
                value={thankyou.title || ''}
                onChange={(e) => onUpdateThankYou({ title: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Anchor: Comments Button */}
      <div className="pt-4 border-t border-gray-100 mt-auto flex justify-start">
        <button
          onClick={showComingSoon}
          className="border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5 text-gray-600" />
          <span>Comments</span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        </button>
      </div>
    </aside>
  );
}
