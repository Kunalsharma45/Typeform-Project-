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
  AlignLeft,
  Video,
  Phone,
  Type,
  List,
  Mail,
  ToggleLeft,
  Star,
  Upload,
} from 'lucide-react';
import RatingIcon, { RATING_SHAPES } from '../RatingIcon';

const QUESTION_TYPES: { type: QuestionType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'short_text', label: 'Short Text', icon: <Type className="w-3.5 h-3.5" />, color: 'bg-indigo-100 text-indigo-600' },
  { type: 'long_text', label: 'Long Text', icon: <AlignLeft className="w-3.5 h-3.5" />, color: 'bg-purple-100 text-purple-600' },
  { type: 'multiple_choice', label: 'Multiple Choice', icon: <List className="w-3.5 h-3.5" />, color: 'bg-pink-100 text-pink-600' },
  { type: 'dropdown', label: 'Dropdown', icon: <ChevronDown className="w-3.5 h-3.5" />, color: 'bg-orange-100 text-orange-600' },
  { type: 'email', label: 'Email', icon: <Mail className="w-3.5 h-3.5" />, color: 'bg-emerald-100 text-emerald-600' },
  { type: 'number', label: 'Phone Number', icon: <Phone className="w-3.5 h-3.5" />, color: 'bg-pink-100 text-pink-600' },
  { type: 'yes_no', label: 'Yes / No', icon: <ToggleLeft className="w-3.5 h-3.5" />, color: 'bg-teal-100 text-teal-600' },
  { type: 'rating', label: 'Rating', icon: <Star className="w-3.5 h-3.5" />, color: 'bg-orange-100 text-orange-600' },
  { type: 'file_upload', label: 'File Upload', icon: <Upload className="w-3.5 h-3.5" />, color: 'bg-slate-100 text-slate-600' },
];

const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'UK', name: 'United Kingdom', flag: 'UK' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
];

interface BuilderRightSidebarProps {
  form: Form;
  activeItem: 'welcome' | number | string;
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
  const [timeToCompleteToggle, setTimeToCompleteToggle] = useState(!!form.welcome_screen?.time_to_complete);
  const [numSubmissionsToggle, setNumSubmissionsToggle] = useState(!!form.welcome_screen?.show_submission_count);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(!!form.welcome_screen);
  const [showThankYouScreen, setShowThankYouScreen] = useState(!!form.thank_you_screen);
  
  const [showShapeDropdown, setShowShapeDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [maxCharsToggle, setMaxCharsToggle] = useState(false);
  const [answerValidationToggle, setAnswerValidationToggle] = useState(false);
  const [customPlaceholderToggle, setCustomPlaceholderToggle] = useState(false);
  const [mapToContactsToggle, setMapToContactsToggle] = useState(false);

  const showComingSoon = () => {
    toast('Coming soon', { icon: '🚧' });
  };

  const welcome = form.welcome_screen || {};
  const thankyou = form.thankyou_screen || {};
  const buttonVal = welcome.button_text ?? 'Start';

  const getSelectedCountry = () => {
    if (!selectedQuestion) return COUNTRIES[0];
    const opts = Array.isArray(selectedQuestion.options) ? selectedQuestion.options : [];
    const countryCode = opts.find((o: any) => o.id === 'country')?.label || 'AF';
    return COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];
  };

  return (
    <aside className="w-[280px] min-w-[280px] flex flex-col gap-4 pr-6 py-6 h-[calc(100vh-53px)] overflow-y-auto relative no-scrollbar">
      <div className="space-y-6">

        {/* ── Welcome Screen Settings ─────────────────────────────────── */}
        {activeItem === 'welcome' && (
          <div className="space-y-6">
            {/* Toggle: Time to complete */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700">
                <span>Time to complete</span>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </div>
              <button
                onClick={() => {
                  const newVal = !timeToCompleteToggle;
                  setTimeToCompleteToggle(newVal);
                  onUpdateWelcome({ time_to_complete: newVal });
                }}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${timeToCompleteToggle ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 left-0.5 ${timeToCompleteToggle ? 'translate-x-4' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            {/* Toggle: Number of submissions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700">
                <span>Number of submissions</span>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </div>
              <button
                onClick={() => {
                  const newVal = !numSubmissionsToggle;
                  setNumSubmissionsToggle(newVal);
                  onUpdateWelcome({ show_submission_count: newVal });
                }}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${numSubmissionsToggle ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 left-0.5 ${numSubmissionsToggle ? 'translate-x-4' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            {/* Button Text Input */}
            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-gray-700">
                Button
              </label>
              <input
                type="text"
                className="w-full bg-white border border-gray-200 focus:border-black rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all"
                value={buttonVal}
                onChange={(e) => onUpdateWelcome({ button_text: e.target.value })}
                maxLength={24}
              />
              <div className="text-right text-[11px] text-gray-400 font-medium">
                {buttonVal.length}/24
              </div>
            </div>

            {/* Media Upload Box */}
            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-gray-700">
                Image or video
              </label>
              <div
                onClick={showComingSoon}
                className="w-10 h-10 rounded-xl border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 cursor-pointer transition-all shadow-sm"
              >
                <Plus className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        {/* ── Question Settings ───────────────────────────────────────── */}
        {typeof activeItem === 'number' && selectedQuestion && (
          <div className="space-y-4 pb-4">

            {/* Box 1: Question */}
            <div className="bg-[#f7f7f7] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                <span>Question</span>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center bg-gray-200/50 p-1 rounded-xl">
                <button className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-white rounded-lg shadow-sm text-sm font-medium text-gray-700 transition-all">
                  <AlignLeft className="w-4 h-4 text-gray-500" />
                  Text
                </button>
                <button onClick={showComingSoon} className="flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                  <Video className="w-4 h-4" />
                  Video
                </button>
              </div>
            </div>

            {/* Box 2: Answer */}
            <div className="bg-[#f7f7f7] rounded-2xl p-5 space-y-4">
              <div className="text-sm font-bold text-gray-800 mb-2">
                Answer
              </div>

              {/* Custom Dropdown for Question Type */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowTypeDropdown(!showTypeDropdown);
                    setShowCountryDropdown(false);
                  }}
                  className="w-full bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-3 py-2 flex items-center justify-between transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    {(() => {
                      const currentType = QUESTION_TYPES.find(t => t.type === selectedQuestion.type);
                      if (!currentType) return null;
                      return (
                        <>
                          <div className={`w-6 h-6 rounded flex items-center justify-center ${currentType.color}`}>
                            {currentType.icon}
                          </div>
                          <span className="text-xs font-medium text-gray-700">{currentType.label}</span>
                        </>
                      );
                    })()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {showTypeDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] py-1 overflow-hidden">
                    {QUESTION_TYPES.map((t) => (
                      <button
                        key={t.type}
                        onClick={() => {
                          onUpdateQuestion({ type: t.type });
                          setShowTypeDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className={`w-6 h-6 rounded flex items-center justify-center ${t.color}`}>
                          {t.icon}
                        </div>
                        <span className="text-xs font-medium text-gray-700">{t.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Extra Settings for File Upload */}
              {selectedQuestion.type === 'file_upload' && (
                <div className="pt-2 pb-2">
                  <div className="text-[13px] font-bold text-gray-800 mb-3">Integrations</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg width="20" height="20" viewBox="0 0 87.3 77.3" xmlns="http://www.w3.org/2000/svg">
                        <path d="M58.2 77.3 87.3 26.9 58.2 26.9 29.1 77.3z" fill="#2196F3"/>
                        <path d="M87.3 26.9 58.2 77.3 0 77.3l29.1-50.4z" fill="#4CAF50"/>
                        <path d="M29.1 77.3 0 26.9l29.1-50.4 58.2 0L58.2 26.9z" fill="#FFC107"/>
                      </svg>
                      <span className="text-[13px] text-gray-700 font-medium">Google Drive</span>
                    </div>
                    <button 
                      onClick={showComingSoon}
                      className="px-3 py-1 bg-gray-800 hover:bg-black text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              )}

              {/* Required Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-700">Required</span>
                <button
                  onClick={() =>
                    onUpdateQuestion({ required: !selectedQuestion.required })
                  }
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shadow-sm ${selectedQuestion.required ? 'bg-gray-900' : 'bg-gray-200'
                    }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 left-0.5 shadow-sm ${selectedQuestion.required ? 'translate-x-4' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              {/* Extra Settings for Rating */}
              {selectedQuestion.type === 'rating' && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        className="w-full bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-3 py-2 text-[13px] font-medium appearance-none outline-none transition-colors shadow-sm cursor-pointer"
                        value={(() => {
                          const opts = Array.isArray(selectedQuestion.options) ? selectedQuestion.options : [];
                          return opts.find((o: any) => o.id === 'max')?.label || '5';
                        })()}
                        onChange={(e) => onUpdateQuestion({ options: [{ id: 'max', label: e.target.value }, ...((Array.isArray(selectedQuestion.options) ? selectedQuestion.options : []).filter(o => o.id !== 'max'))] })}
                      >
                        {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    
                    <div className="relative flex-1">
                      <button 
                        onClick={() => setShowShapeDropdown(!showShapeDropdown)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                      >
                        <RatingIcon 
                          shape={(() => {
                            const opts = Array.isArray(selectedQuestion.options) ? selectedQuestion.options : [];
                            return opts.find((o: any) => o.id === 'shape')?.label || 'star';
                          })()}
                          className="w-4 h-4 text-gray-600 stroke-[1.5]"
                        />
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                      
                      {showShapeDropdown && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] p-3">
                          <div className="grid grid-cols-5 gap-2">
                            {RATING_SHAPES.map((s) => {
                              const isSelected = (() => {
                                const opts = Array.isArray(selectedQuestion.options) ? selectedQuestion.options : [];
                                const currentShape = opts.find((o: any) => o.id === 'shape')?.label || 'star';
                                return currentShape === s.id;
                              })();
                              
                              return (
                                <button
                                  key={s.id}
                                  onClick={() => {
                                    const opts = Array.isArray(selectedQuestion.options) ? selectedQuestion.options : [];
                                    const filteredOpts = opts.filter((o: any) => o.id !== 'shape');
                                    onUpdateQuestion({ options: [...filteredOpts, { id: 'shape', label: s.id }] });
                                    setShowShapeDropdown(false);
                                  }}
                                  className={`aspect-square flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 ${isSelected ? 'bg-indigo-50 border border-indigo-200 text-indigo-600' : 'text-gray-600'}`}
                                >
                                  <s.icon className="w-5 h-5 stroke-[1.5]" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[13px] text-gray-700">
                      <span>Lead scoring</span>
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <button
                      onClick={showComingSoon}
                      className="text-[11px] font-semibold text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50 transition-colors"
                    >
                      Set rules
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[13px] text-gray-700">
                      <span>Map to contacts</span>
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <button
                      onClick={() => setMapToContactsToggle(!mapToContactsToggle)}
                      className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shadow-sm ${
                        mapToContactsToggle ? 'bg-gray-900' : 'bg-gray-200'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 left-0.5 shadow-sm ${
                        mapToContactsToggle ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              )}

              {/* Extra Settings for Phone Number */}
              {selectedQuestion.type === 'number' && (
                <>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowCountryDropdown(!showCountryDropdown);
                        setShowTypeDropdown(false);
                      }}
                      className="w-full bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-3 py-2 flex items-center justify-between transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getSelectedCountry().flag}</span>
                        <span className="text-xs font-medium text-gray-700">{getSelectedCountry().name}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] py-1 overflow-hidden">
                        {COUNTRIES.map((c) => (
                          <button
                            key={c.code}
                            onClick={() => {
                              onUpdateQuestion({ options: [{ id: 'country', label: c.code }] });
                              setShowCountryDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                          >
                            <span className="text-sm">{c.flag}</span>
                            <span className="text-xs font-medium text-gray-700">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                </>
              )}

              {/* Extra Settings for Short Text */}
              {selectedQuestion.type === 'short_text' && (() => {
                const opts = Array.isArray(selectedQuestion.options) ? selectedQuestion.options : [];
                const maxCharsOpt = opts.find((o: any) => o.id === 'max_chars');
                const validationOpt = opts.find((o: any) => o.id === 'validation');
                const placeholderOpt = opts.find((o: any) => o.id === 'placeholder');

                const hasMaxChars = !!maxCharsOpt;
                const hasValidation = !!validationOpt;
                const hasPlaceholder = !!placeholderOpt;

                const setOption = (key: string, value: string) => {
                  const existing = opts.find((o: any) => o.id === key);
                  let newOpts;
                  if (existing) {
                    newOpts = opts.map((o: any) => o.id === key ? { ...o, label: value } : o);
                  } else {
                    newOpts = [...opts, { id: key, label: value }];
                  }
                  onUpdateQuestion({ options: newOpts });
                };

                const toggleOption = (key: string, defaultVal: string) => {
                  if (opts.find((o: any) => o.id === key)) {
                    onUpdateQuestion({ options: opts.filter((o: any) => o.id !== key) });
                  } else {
                    onUpdateQuestion({ options: [...opts, { id: key, label: defaultVal }] });
                  }
                };

                return (
                  <div className="space-y-4 pt-2">
                    {/* Max Characters */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-gray-700">Max characters</span>
                        <button
                          onClick={() => toggleOption('max_chars', '50')}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shadow-sm ${
                            hasMaxChars ? 'bg-gray-900' : 'bg-gray-200'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 left-0.5 shadow-sm ${
                            hasMaxChars ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                      {hasMaxChars && (
                        <input
                          type="number"
                          className="w-full bg-white border border-gray-200 focus:border-black rounded-lg px-3 py-1.5 text-[13px] outline-none transition-colors"
                          value={maxCharsOpt?.label || '50'}
                          onChange={(e) => setOption('max_chars', e.target.value)}
                        />
                      )}
                    </div>
                    
                    {/* Answer validation */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[13px] text-gray-700">
                          <span>Answer validation</span>
                          <HelpCircle className="w-4 h-4 text-gray-400" />
                        </div>
                        <button
                          onClick={() => toggleOption('validation', 'text')}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shadow-sm ${
                            hasValidation ? 'bg-gray-900' : 'bg-gray-200'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 left-0.5 shadow-sm ${
                            hasValidation ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                      {hasValidation && (
                        <div className="relative">
                          <select
                            className="w-full bg-white border border-gray-200 focus:border-black rounded-lg px-3 py-1.5 text-[13px] appearance-none outline-none transition-colors cursor-pointer"
                            value={validationOpt?.label || 'text'}
                            onChange={(e) => setOption('validation', e.target.value)}
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="url">URL</option>
                            <option value="email">Email</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      )}
                    </div>

                    {/* Custom placeholder text */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[13px] text-gray-700">
                          <span>Custom placeholder text</span>
                          <HelpCircle className="w-4 h-4 text-gray-400" />
                        </div>
                        <button
                          onClick={() => toggleOption('placeholder', 'Type your answer here...')}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shadow-sm ${
                            hasPlaceholder ? 'bg-gray-900' : 'bg-gray-200'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 left-0.5 shadow-sm ${
                            hasPlaceholder ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                      {hasPlaceholder && (
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-200 focus:border-black rounded-lg px-3 py-1.5 text-[13px] outline-none transition-colors"
                          value={placeholderOpt?.label || ''}
                          onChange={(e) => setOption('placeholder', e.target.value)}
                          placeholder="Type your answer here..."
                        />
                      )}
                    </div>

                    {/* Map to contacts */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[13px] text-gray-700">
                        <span>Map to contacts</span>
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                      </div>
                      <button
                        onClick={() => setMapToContactsToggle(!mapToContactsToggle)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shadow-sm ${
                          mapToContactsToggle ? 'bg-gray-900' : 'bg-gray-200'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 left-0.5 shadow-sm ${
                          mapToContactsToggle ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                );
              })()}


              {/* Universal Setting for all Question Types within Answer Box */}
              <div className="pt-2 border-t border-gray-200/50 mt-4">
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-bold text-gray-800">Image or video</span>
                  <button 
                    onClick={showComingSoon}
                    className="w-8 h-8 flex items-center justify-center border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50 shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Box 3: Branching */}
            <div className="bg-[#f7f7f7] rounded-2xl p-5 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800">Branching</span>
              <button 
                onClick={showComingSoon}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50 shadow-sm"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Box 4: Comments */}
            <div className="bg-[#f7f7f7] rounded-2xl p-5 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800">Comments</span>
              <button onClick={showComingSoon} className="w-8 h-8 flex items-center justify-center border border-emerald-200 bg-white rounded-full shadow-sm text-emerald-600 hover:bg-emerald-50 transition-colors">
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ── Thank You Screen Settings ───────────────────────────────── */}
        {typeof activeItem === 'string' && activeItem.startsWith('thankyou') && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-gray-700">
                Title
              </label>
              <input
                type="text"
                className="w-full bg-white border border-gray-200 focus:border-black rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all"
                value={thankyou.title || ''}
                onChange={(e) => onUpdateThankYou({ title: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>


    </aside>
  );
}
