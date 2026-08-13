'use client';

import toast from 'react-hot-toast';
import type { Question } from '../../lib/types';
import {
  ChevronDown,
  Plus,
  ArrowRight,
  GripVertical,
  Sparkles,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface BuilderLeftSidebarProps {
  questions: Question[];
  activeItem: 'welcome' | 'thankyou' | number; // 'welcome', 'thankyou', or question.id
  onSelectWelcome: () => void;
  onSelectThankYou: () => void;
  onSelectQuestion: (id: number) => void;
  onAddQuestion: () => void;
  onDeleteQuestion: (id: number, e: React.MouseEvent) => void;
}

export default function BuilderLeftSidebar({
  questions,
  activeItem,
  onSelectWelcome,
  onSelectThankYou,
  onSelectQuestion,
  onAddQuestion,
  onDeleteQuestion,
}: BuilderLeftSidebarProps) {
  const showComingSoon = () => {
    toast('Coming soon', { icon: '🚧' });
  };

  return (
    <aside className="w-[260px] min-w-[260px] bg-white border-r border-gray-200/80 flex flex-col justify-between p-4 h-[calc(100vh-53px)] overflow-y-auto">
      <div className="space-y-4">
        {/* Universal mode dropdown */}
        <button
          onClick={showComingSoon}
          className="w-full bg-gray-50 border border-gray-200 hover:bg-gray-100/80 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-gray-500" />
            Universal mode
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </button>

        {/* Pages Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 px-1">
            <span>Pages</span>
          </div>

          <div className="space-y-1">
            {/* Welcome Screen Page Item */}
            <div
              onClick={onSelectWelcome}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-xs font-medium ${
                activeItem === 'welcome'
                  ? 'bg-gray-100 text-gray-900 font-semibold shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-gray-200/70 text-gray-600 flex items-center justify-center flex-shrink-0 font-bold text-[11px]">
                👋
              </div>
              <span className="truncate flex-1">
                Welcome to the Consent Form for...
              </span>
            </div>

            {/* Questions List */}
            {questions.map((q, idx) => {
              const isSelected = activeItem === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => onSelectQuestion(q.id)}
                  className={`group relative flex items-center gap-2 px-2.5 py-2.5 rounded-xl cursor-pointer transition-all text-xs ${
                    isSelected
                      ? 'bg-gray-100 text-gray-900 font-semibold shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <GripVertical className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                  
                  {/* Numbered Badge */}
                  <div className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 font-bold text-[11px]">
                    {idx + 1}
                  </div>

                  <span className="truncate flex-1">
                    {q.title || 'Untitled question...'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteQuestion(q.id, e);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-opacity"
                    title="Delete question"
                  >
                    ×
                  </button>
                </div>
              );
            })}

            {/* Add Content Button */}
            <button
              onClick={onAddQuestion}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs py-2 px-3 rounded-xl border border-dashed border-gray-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add content</span>
            </button>
          </div>
        </div>

        {/* Personalize with branching Promo Card */}
        <div
          onClick={showComingSoon}
          className="border border-purple-100 bg-purple-50/50 hover:bg-purple-50 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-900">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Personalize with branching</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
        </div>

        <div className="w-full h-px bg-gray-100" />

        {/* Endings Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 px-1">
            <span>Endings</span>
            <button
              onClick={showComingSoon}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
              title="Add ending"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            onClick={onSelectThankYou}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-xs ${
              activeItem === 'thankyou'
                ? 'bg-gray-100 text-gray-900 font-semibold shadow-2xs'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="w-5 h-5 rounded-md bg-gray-200 text-gray-700 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
              A
            </div>
            <span className="truncate flex-1">
              Thank you for providing your...
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
