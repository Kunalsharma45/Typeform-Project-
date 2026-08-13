'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Form, Question } from '../../lib/types';
import QuestionRenderer from '../QuestionRenderer';
import {
  Plus,
  Palette,
  Smartphone,
  Monitor,
  Workflow,
  Undo2,
  Redo2,
  SlidersHorizontal,
  Clock,
  Mic,
  Send,
} from 'lucide-react';

interface BuilderCenterCanvasProps {
  form: Form;
  activeItem: 'welcome' | 'thankyou' | number;
  selectedQuestion: Question | null;
  onAddQuestion: () => void;
  onUpdateWelcome: (welcome: Partial<Form['welcome_screen']>) => void;
  onUpdateQuestion: (updates: Partial<Question>) => void;
  onUpdateThankYou: (thankyou: Partial<Form['thankyou_screen']>) => void;
}

export default function BuilderCenterCanvas({
  form,
  activeItem,
  selectedQuestion,
  onAddQuestion,
  onUpdateWelcome,
  onUpdateQuestion,
  onUpdateThankYou,
}: BuilderCenterCanvasProps) {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');

  const showComingSoon = () => {
    toast('Coming soon', { icon: '🚧' });
  };

  const welcome = form.welcome_screen || {};
  const thankyou = form.thankyou_screen || {};
  const accent = form.theme?.accent_color || '#18181b';

  return (
    <div className="flex-1 flex flex-col bg-[#f5f5f5] h-[calc(100vh-53px)] overflow-hidden relative">
      {/* Top Canvas Toolbar */}
      <div className="bg-white border-b border-gray-200/80 px-6 py-2.5 flex items-center justify-between z-20">
        {/* Left: Add Content Button */}
        <button
          onClick={onAddQuestion}
          className="bg-[#262627] hover:bg-black text-white font-semibold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add content</span>
        </button>

        {/* Center: Tools (Design, Device Preview, Logic, Undo, Settings) */}
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-700">
          <button
            onClick={showComingSoon}
            className="flex items-center gap-1.5 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <Palette className="w-4 h-4 text-gray-600 stroke-[1.8]" />
            <span>Design</span>
          </button>

          <div className="w-px h-4 bg-gray-200" />

          {/* Device Previews */}
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1 rounded-md transition-colors ${
                deviceMode === 'mobile'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Mobile Preview"
            >
              <Smartphone className="w-3.5 h-3.5 stroke-[1.8]" />
            </button>
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1 rounded-md transition-colors ${
                deviceMode === 'desktop'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Desktop Preview"
            >
              <Monitor className="w-3.5 h-3.5 stroke-[1.8]" />
            </button>
          </div>

          <div className="w-px h-4 bg-gray-200" />

          <button
            onClick={showComingSoon}
            className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
            title="Logic"
          >
            <Workflow className="w-4 h-4 stroke-[1.8]" />
          </button>

          <button
            onClick={showComingSoon}
            className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
            title="Undo"
          >
            <Undo2 className="w-4 h-4 stroke-[1.8]" />
          </button>

          <button
            onClick={showComingSoon}
            className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
            title="Redo"
          >
            <Redo2 className="w-4 h-4 stroke-[1.8]" />
          </button>

          <button
            onClick={showComingSoon}
            className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
            title="Settings"
          >
            <SlidersHorizontal className="w-4 h-4 stroke-[1.8]" />
          </button>
        </div>

        {/* Right Spacer */}
        <div className="w-24" />
      </div>

      {/* Center Main Editor Canvas */}
      <div className="flex-1 p-8 flex items-center justify-center overflow-y-auto pb-24">
        <div
          className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-12 transition-all duration-300 flex flex-col items-center justify-center text-center relative ${
            deviceMode === 'mobile'
              ? 'w-[360px] min-h-[580px]'
              : 'w-full max-w-2xl min-h-[440px]'
          }`}
        >
          {/* Welcome Screen Content */}
          {activeItem === 'welcome' && (
            <div className="space-y-6 w-full max-w-lg">
              <textarea
                className="w-full text-2xl lg:text-3xl font-bold text-gray-900 text-center bg-transparent border-b border-transparent hover:border-gray-200 focus:border-black outline-none resize-none transition-colors"
                value={welcome.title || 'Welcome to the Consent Form for Data Collection'}
                onChange={(e) => onUpdateWelcome({ title: e.target.value })}
                placeholder="Welcome title..."
                rows={2}
              />

              <input
                type="text"
                className="w-full text-sm font-medium text-gray-500 italic text-center bg-transparent border-b border-transparent hover:border-gray-200 focus:border-black outline-none transition-colors"
                value={welcome.description || 'Description (optional)'}
                onChange={(e) => onUpdateWelcome({ description: e.target.value })}
                placeholder="Description (optional)"
              />

              <div className="pt-4 flex flex-col items-center gap-3">
                <button
                  className="bg-[#262627] hover:bg-black text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-xs"
                  style={{ background: accent }}
                >
                  {welcome.button_text || 'Start'}
                </button>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium pt-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Takes X minutes</span>
                </div>
              </div>
            </div>
          )}

          {/* Question Editor Content */}
          {typeof activeItem === 'number' && selectedQuestion && (
            <div className="space-y-4 w-full max-w-lg text-left">
              <textarea
                className="w-full text-2xl font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-black outline-none resize-none transition-colors"
                value={selectedQuestion.title}
                onChange={(e) => onUpdateQuestion({ title: e.target.value })}
                placeholder="Type your question..."
                rows={2}
              />
              <input
                type="text"
                className="w-full text-sm font-medium text-gray-500 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-black outline-none transition-colors"
                value={selectedQuestion.description || ''}
                onChange={(e) => onUpdateQuestion({ description: e.target.value })}
                placeholder="Description (optional)"
              />
              <div className="pt-2">
                <QuestionRenderer
                  question={selectedQuestion}
                  mode="preview"
                  accentColor={accent}
                />
              </div>
            </div>
          )}

          {/* Thank You Screen Content */}
          {activeItem === 'thankyou' && (
            <div className="space-y-4 w-full max-w-lg">
              <input
                type="text"
                className="w-full text-2xl font-bold text-gray-900 text-center bg-transparent border-b border-transparent hover:border-gray-200 focus:border-black outline-none transition-colors"
                value={thankyou.title || 'Thank you for providing your response!'}
                onChange={(e) => onUpdateThankYou({ title: e.target.value })}
                placeholder="Thank you title..."
              />

              <input
                type="text"
                className="w-full text-sm text-gray-500 text-center bg-transparent border-b border-transparent hover:border-gray-200 focus:border-black outline-none transition-colors"
                value={thankyou.description || 'Your submission has been received.'}
                onChange={(e) => onUpdateThankYou({ description: e.target.value })}
                placeholder="Description..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Bar ("Chat to create") */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div
          onClick={showComingSoon}
          className="border border-purple-200 bg-white hover:border-purple-300 rounded-full px-4 py-2.5 flex items-center justify-between gap-6 cursor-pointer transition-all shadow-md w-[320px] group"
        >
          <div className="flex items-center gap-2.5 text-xs font-medium text-gray-500 group-hover:text-purple-700">
            <Mic className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
            <span>Chat to create</span>
          </div>
          <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
            <Send className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
