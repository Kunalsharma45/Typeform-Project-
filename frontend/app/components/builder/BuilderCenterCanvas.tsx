'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Form, Question, QuestionOption } from '../../lib/types';
import {
  Plus,
  Palette,
  Smartphone,
  Play,
  Monitor,
  Accessibility,
  History,
  Languages,
  Settings,
  Clock,
  Mic,
  Send,
  GripVertical,
  ChevronDown,
  X,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BuilderCenterCanvasProps {
  form: Form;
  activeItem: 'welcome' | number | string;
  selectedQuestion: Question | null;
  onAddQuestion: () => void;
  onUpdateWelcome: (welcome: Partial<Form['welcome_screen']>) => void;
  onUpdateQuestion: (updates: Partial<Question>) => void;
  onUpdateThankYou: (thankyou: Partial<Form['thankyou_screen']>) => void;
}

function SortableOptionItem({
  opt,
  idx,
  onUpdate,
  onDelete,
  canDelete,
}: {
  opt: QuestionOption;
  idx: number;
  onUpdate: (id: string, val: string) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opt.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };
  
  const LETTER_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1.5 bg-gray-100/50 hover:bg-gray-100 rounded-md pr-2 py-1.5 w-max max-w-full min-w-[240px] transition-colors relative ${
        isDragging ? 'shadow-lg opacity-80 z-10 cursor-grabbing bg-white border border-gray-200 scale-105' : ''
      }`}
    >
      <div 
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-200 text-gray-400 transition-all flex-shrink-0"
        title="Drag to reorder"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      <div className="w-5 h-5 bg-white border border-gray-300 rounded text-[10px] font-bold text-gray-600 flex items-center justify-center flex-shrink-0">
        {LETTER_KEYS[idx % 26]}
      </div>
      
      <input
        type="text"
        className="bg-transparent border-0 outline-none text-sm text-gray-700 flex-1 w-full min-w-[140px] focus:ring-0 p-1 cursor-text"
        value={opt.label}
        onChange={(e) => onUpdate(opt.id, e.target.value)}
        placeholder="choice"
      />
      
      {canDelete && (
        <button
          onClick={() => onDelete(opt.id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity flex-shrink-0"
          title="Delete choice"
        >
          ×
        </button>
      )}
    </div>
  );
}

function QuestionEditorPreview({ 
  question,
  onUpdateQuestion 
}: { 
  question: Question;
  onUpdateQuestion: (updates: Partial<Question>) => void;
}) {
  // Hooks must be at the top level
  const [isDropdownModalOpen, setIsDropdownModalOpen] = useState(false);
  const [dropdownBulkText, setDropdownBulkText] = useState('');

  if (question.type === 'short_text' || question.type === 'text') {
    return (
      <div className="w-full border-b border-gray-400 pb-2">
        <span className="text-gray-300 text-xl">Type your answer here...</span>
      </div>
    );
  }
  if (question.type === 'email') {
    return (
      <div className="w-full border-b border-gray-400 pb-2">
        <span className="text-gray-300 text-xl">name@example.com</span>
      </div>
    );
  }
  if (question.type === 'long_text') {
    return (
      <div className="w-full">
        <div className="border-b border-gray-400 pb-2">
          <span className="text-gray-300 text-xl">Type your answer here...</span>
        </div>
        <p className="mt-2 text-xs font-semibold text-gray-500">
          Shift ⇧ + Enter ↵ <span className="font-normal text-gray-400">to make a line break</span>
        </p>
      </div>
    );
  }
  if (question.type === 'number') {
    const opts = Array.isArray(question.options) ? question.options : [];
    const countryCode = opts.find((o: any) => o.id === 'country')?.label || 'AF';
    const COUNTRIES = [
      { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', placeholder: '070 123 4567' },
      { code: 'US', name: 'United States', flag: '🇺🇸', placeholder: '(201) 555-0123' },
      { code: 'UK', name: 'United Kingdom', flag: 'UK', placeholder: '07700 900077' },
      { code: 'IN', name: 'India', flag: '🇮🇳', placeholder: '091234 56789' },
    ];
    const country = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];

    return (
      <div className="w-full flex items-center border-b border-gray-400 pb-2 gap-2 text-xl">
        <span className="text-gray-900 text-lg">{country.flag}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 mt-1" />
        <span className="text-gray-300 ml-2">{country.placeholder}</span>
      </div>
    );
  }
  if (question.type === 'dropdown') {
    const options = Array.isArray(question.options) ? (question.options as QuestionOption[]) : [];

    const handleOpenModal = () => {
      setDropdownBulkText(options.map(o => o.label).join('\n'));
      setIsDropdownModalOpen(true);
    };

    const handleSaveChoices = () => {
      const lines = dropdownBulkText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const newOptions = lines.map((line, idx) => ({ id: Date.now().toString() + idx, label: line }));
      onUpdateQuestion({ options: newOptions });
      setIsDropdownModalOpen(false);
    };

    return (
      <div className="w-full relative">
        <div 
          onClick={handleOpenModal}
          className="w-full flex items-center justify-between border-b border-gray-400 pb-2 cursor-pointer group transition-colors hover:border-gray-600"
        >
          <span className="text-gray-400 text-lg group-hover:text-gray-600 transition-colors">Type or select an option</span>
          <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
        <div className="flex items-center justify-between mt-2">
          <button 
            onClick={handleOpenModal}
            className="text-xs font-semibold text-gray-700 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-600 transition-colors"
          >
            Add choices
          </button>
          <span className="text-xs text-gray-400 font-medium">{options.length} options in list</span>
        </div>

        {isDropdownModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button 
                onClick={() => setIsDropdownModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Edit choices</h3>
              <p className="text-sm text-gray-500 mb-4">Add your choices below, one per line.</p>
              
              <textarea
                className="w-full h-48 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                value={dropdownBulkText}
                onChange={(e) => setDropdownBulkText(e.target.value)}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
              
              <div className="mt-4 flex justify-end gap-3">
                <button 
                  onClick={() => setIsDropdownModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveChoices}
                  className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-black"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (question.type === 'multiple_choice') {
    const options = Array.isArray(question.options) ? (question.options as QuestionOption[]) : [];
    
    const handleAddOption = () => {
      const newOption = { id: Date.now().toString(), label: '' };
      onUpdateQuestion({ options: [...options, newOption] });
    };

    const handleUpdateOption = (id: string, newLabel: string) => {
      onUpdateQuestion({
        options: options.map(opt => opt.id === id ? { ...opt, label: newLabel } : opt)
      });
    };

    const handleDeleteOption = (id: string) => {
      onUpdateQuestion({
        options: options.filter(opt => opt.id !== id)
      });
    };
    
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 5,
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (active.id !== over?.id && over) {
        const oldIndex = options.findIndex((opt) => opt.id === active.id);
        const newIndex = options.findIndex((opt) => opt.id === over.id);
        onUpdateQuestion({ options: arrayMove(options, oldIndex, newIndex) });
      }
    };

    return (
      <div className="space-y-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={options.map((opt) => opt.id)}
            strategy={verticalListSortingStrategy}
          >
            {options.map((opt, idx) => (
              <SortableOptionItem
                key={opt.id}
                opt={opt}
                idx={idx}
                onUpdate={handleUpdateOption}
                onDelete={handleDeleteOption}
                canDelete={options.length > 1}
              />
            ))}
          </SortableContext>
        </DndContext>
        
        {options.length === 0 && (
           <div className="text-gray-400 italic text-sm py-2">No choices yet</div>
        )}
        <button
          onClick={handleAddOption}
          className="text-sm font-semibold text-gray-700 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-600 transition-colors mt-2 block"
        >
          Add choice
        </button>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="w-full border-b border-gray-400 pb-2">
      <span className="text-gray-300 text-xl">Type your answer here...</span>
    </div>
  );
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
    <div className="flex-1 flex flex-col bg-transparent min-w-0 relative">
      {/* Top Canvas Toolbar */}
      <div className="bg-transparent px-6 pt-6 pb-2 w-full z-20">
        <div className="w-full bg-gray-50 rounded-2xl h-[48px] flex items-center px-1.5 gap-2 border border-gray-100/50">
          {/* Left: Add Content Button */}
          <button
            onClick={onAddQuestion}
            className="bg-[#262627] hover:bg-black text-white font-semibold text-[13px] py-1.5 px-3 rounded-[10px] flex items-center gap-1.5 transition-colors cursor-pointer h-[36px] shadow-sm ml-0.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add content</span>
          </button>

          <div className="w-px h-5 bg-gray-200 ml-1 mr-1" />

          {/* Tools: Left-aligned right after the button */}
          <button
            onClick={showComingSoon}
            className="flex items-center gap-1.5 hover:bg-gray-200/50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-semibold text-gray-700"
          >
            <Palette className="w-4 h-4 text-gray-500 stroke-[1.8]" />
            <span>Design</span>
          </button>

          <div className="flex items-center gap-0.5 ml-1">
            <button
              onClick={() => setDeviceMode(deviceMode === 'desktop' ? 'mobile' : 'desktop')}
              className="p-1.5 rounded-lg transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-200/60"
              title={deviceMode === 'desktop' ? 'Switch to mobile view' : 'Switch to desktop view'}
            >
              {deviceMode === 'desktop' ? (
                <Smartphone className="w-4 h-4 stroke-[1.8]" />
              ) : (
                <Monitor className="w-4 h-4 stroke-[1.8]" />
              )}
            </button>
            <button
              onClick={() => {
                if (form.public_slug) {
                  window.open(`/f/${form.public_slug}`, '_blank');
                } else {
                  toast('Publish your form first to preview it!', { icon: '👁️' });
                }
              }}
              className="p-1.5 rounded-lg transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-200/60"
              title="Preview"
            >
              <Play className="w-4 h-4 stroke-[1.8]" />
            </button>
          </div>

          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={showComingSoon}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 rounded-lg transition-colors"
              title="Accessibility"
            >
              <Accessibility className="w-4 h-4 stroke-[1.8]" />
            </button>
            <button
              onClick={showComingSoon}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 rounded-lg transition-colors"
              title="History"
            >
              <History className="w-4 h-4 stroke-[1.8]" />
            </button>
            <button
              onClick={showComingSoon}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 rounded-lg transition-colors"
              title="Languages"
            >
              <Languages className="w-4 h-4 stroke-[1.8]" />
            </button>
            <button
              onClick={showComingSoon}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4 stroke-[1.8]" />
            </button>
          </div>
        </div>
      </div>

      {/* Center Main Editor Canvas */}
      <div className="flex-1 p-6 md:p-8 flex justify-center overflow-y-auto">
        <div
          className={`bg-[#fafafa] rounded-[24px] transition-all duration-300 flex flex-col items-center justify-start pt-32 px-12 text-center relative ${
            deviceMode === 'mobile'
              ? 'w-[360px] min-h-[580px]'
              : 'w-full max-w-4xl min-h-full'
          }`}
        >
          {/* Welcome Screen Content */}
          {activeItem === 'welcome' && (
            <div className="space-y-6 w-full max-w-2xl">
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
            <div className="w-full max-w-3xl text-left pl-4 pr-8">
              <div className="flex items-start gap-3">
                <div className="mt-1.5 w-5 h-5 bg-[#262627] text-white rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {(form.questions?.findIndex((q) => q.id === selectedQuestion.id) ?? 0) + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="relative w-full">
                    {/* Mirror layer to position the asterisk exactly after the text */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none text-2xl font-medium whitespace-pre-wrap break-words border-0">
                      <span className="invisible">{selectedQuestion.title || 'Your question here. Recall information with @'}</span>
                      {selectedQuestion.required && (
                        <span className="text-gray-400">*</span>
                      )}
                    </div>
                    <textarea
                      className="relative z-10 w-full text-2xl font-medium text-gray-600 bg-transparent border-0 placeholder-gray-400 outline-none resize-none focus:text-gray-900 transition-colors"
                      value={selectedQuestion.title}
                      onChange={(e) => onUpdateQuestion({ title: e.target.value })}
                      placeholder="Your question here. Recall information with @"
                      rows={1}
                    />
                  </div>
                  <input
                    type="text"
                    className="w-full text-sm italic text-gray-400 bg-transparent border-0 placeholder-gray-400 outline-none focus:text-gray-600 transition-colors"
                    value={selectedQuestion.description || ''}
                    onChange={(e) => onUpdateQuestion({ description: e.target.value })}
                    placeholder="Description (optional)"
                  />
                  <div className="pt-8">
                    <QuestionEditorPreview question={selectedQuestion} onUpdateQuestion={onUpdateQuestion} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Thank You Screen Content */}
          {typeof activeItem === 'string' && activeItem.startsWith('thankyou') && (
            <div className="space-y-4 w-full max-w-2xl">
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


    </div>
  );
}
