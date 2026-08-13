'use client';

import { useState } from 'react';

import toast from 'react-hot-toast';
import type { Question } from '../../lib/types';
import {
  ChevronDown,
  Plus,
  ArrowRight,
  GripVertical,
  Sparkles,
  FileText,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BuilderLeftSidebarProps {
  questions: Question[];
  activeItem: 'welcome' | number | string; // 'welcome', 'thankyou-id', or question.id
  onSelectWelcome: () => void;
  onSelectEnding: (id: string) => void;
  onSelectQuestion: (id: number) => void;
  onAddQuestion: () => void;
  onDeleteQuestion: (id: number, e: React.MouseEvent) => void;
  onReorderQuestions?: (newQuestions: Question[]) => void;
}

function QuestionItemUI({
  q,
  idx,
  isSelected,
  onSelect,
  onDelete,
  isDragging,
  dragRef,
  style,
  attributes,
  listeners,
}: any) {
  return (
    <div
      ref={dragRef}
      style={style}
      onClick={() => onSelect(q.id)}
      {...attributes}
      {...listeners}
      className={`group relative flex items-center gap-2 px-2.5 py-2.5 rounded-xl transition-all text-xs ${
        isSelected
          ? 'bg-white border-2 border-gray-900 text-gray-900 font-semibold shadow-sm'
          : 'bg-transparent text-gray-600 hover:bg-gray-100/50'
      } ${isDragging ? 'shadow-2xl opacity-100 z-[9999] cursor-grabbing bg-white border-2 border-gray-900 scale-105' : 'cursor-pointer'}`}
    >
      <div className="hover:bg-gray-200 p-1 rounded -ml-1 transition-colors">
        <GripVertical className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-500 flex-shrink-0" />
      </div>

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
          onDelete(q.id, e);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-opacity"
        title="Delete question"
      >
        ×
      </button>
    </div>
  );
}

function SortableQuestionItem(props: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.q.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <QuestionItemUI
      {...props}
      dragRef={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      isDragging={false}
    />
  );
}

function EndingItemUI({
  ending,
  idx,
  isSelected,
  onSelect,
  isDragging,
  dragRef,
  style,
  attributes,
  listeners,
}: any) {
  return (
    <div
      ref={dragRef}
      style={style}
      onClick={() => onSelect(ending.id)}
      {...attributes}
      {...listeners}
      className={`group relative flex items-center gap-2 px-2.5 py-2.5 rounded-xl transition-all text-xs ${
        isSelected
          ? 'bg-white border-2 border-gray-900 text-gray-900 font-semibold shadow-sm'
          : 'bg-transparent text-gray-600 hover:bg-gray-100/50'
      } ${isDragging ? 'shadow-2xl opacity-100 z-[9999] cursor-grabbing bg-white border-2 border-gray-900 scale-105' : 'cursor-pointer'}`}
    >
      <div className="hover:bg-gray-200 p-1 rounded -ml-1 transition-colors">
        <GripVertical className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-500 flex-shrink-0" />
      </div>

      <div className="w-5 h-5 rounded-md bg-gray-200 text-gray-700 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
        {String.fromCharCode(65 + idx)}
      </div>
      <span className="truncate flex-1">
        Thank you for providing your...
      </span>
    </div>
  );
}

function SortableEndingItem(props: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.ending.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <EndingItemUI
      {...props}
      dragRef={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      isDragging={false}
    />
  );
}

export default function BuilderLeftSidebar({
  questions,
  activeItem,
  onSelectWelcome,
  onSelectEnding,
  onSelectQuestion,
  onAddQuestion,
  onDeleteQuestion,
  onReorderQuestions,
}: BuilderLeftSidebarProps) {
  const [endingsHeight, setEndingsHeight] = useState(120);
  const [activeDragId, setActiveDragId] = useState<number | null>(null);
  const [activeEndingDragId, setActiveEndingDragId] = useState<string | null>(null);
  const [endings, setEndings] = useState([{ id: 'thankyou', label: 'A' }]);

  const handleAddEnding = () => {
    const nextLetter = String.fromCharCode(65 + endings.length);
    const newEnding = { id: `thankyou-${nextLetter}`, label: nextLetter };
    setEndings([...endings, newEnding]);
    onSelectEnding(newEnding.id);
  };

  const showComingSoon = () => {
    toast('Coming soon', { icon: '🚧' });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires a 5px movement before dragging starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (active.id !== over?.id && over && onReorderQuestions) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      const newQuestions = arrayMove(questions, oldIndex, newIndex);
      onReorderQuestions(newQuestions);
    }
  };

  const handleEndingDragStart = (event: DragStartEvent) => {
    setActiveEndingDragId(event.active.id as string);
  };

  const handleEndingDragEnd = (event: DragEndEvent) => {
    setActiveEndingDragId(null);
    const { active, over } = event;
    if (active.id !== over?.id && over) {
      const oldIndex = endings.findIndex((e) => e.id === active.id);
      const newIndex = endings.findIndex((e) => e.id === over.id);
      setEndings(arrayMove(endings, oldIndex, newIndex));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const initialY = e.clientY;
    const initialHeight = endingsHeight;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      // moving mouse DOWN increases clientY -> shrinks endings
      // moving mouse UP decreases clientY -> grows endings
      const deltaY = initialY - moveEvent.clientY;
      const newHeight = Math.max(64, Math.min(initialHeight + deltaY, window.innerHeight - 300)); 
      setEndingsHeight(newHeight);
    };
    
    const handleMouseUp = () => {
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.body.style.cursor = 'row-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <aside className="w-[320px] min-w-[320px] flex flex-col pl-6 py-6 h-[calc(100vh-53px)] overflow-y-auto no-scrollbar">
      {/* Universal mode dropdown */}
        {/* Universal mode dropdown */}
        <button
          onClick={showComingSoon}
          className="w-full bg-gray-50 hover:bg-gray-100/80 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-700 flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            Universal mode
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {/* Pages Section (Grey Box Wrapper) */}
        <div className="bg-gray-50 rounded-3xl p-3 flex flex-col gap-3 flex-1 overflow-hidden mt-4">
          <div className="flex items-center justify-between text-sm font-semibold text-gray-900 px-2 pt-1">
            <span>Pages</span>
          </div>

          <div className="space-y-1 flex-1 overflow-y-auto">
            {/* Welcome Screen Page Item */}
            <div
              onClick={onSelectWelcome}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-xs font-medium ${
                activeItem === 'welcome'
                  ? 'bg-white border-2 border-gray-900 text-gray-900 shadow-sm'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100/50'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-gray-200/70 text-gray-600 flex items-center justify-center flex-shrink-0 font-bold text-[11px]">
                👋
              </div>
              <span className="truncate flex-1">
                Welcome to the Consent Form for...
              </span>
            </div>

            {/* Questions List (Sortable) */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={questions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                {questions.map((q, idx) => (
                  <SortableQuestionItem
                    key={q.id}
                    q={q}
                    idx={idx}
                    isSelected={activeItem === q.id}
                    onSelect={onSelectQuestion}
                    onDelete={onDeleteQuestion}
                  />
                ))}
              </SortableContext>
              
              <DragOverlay>
                {activeDragId ? (
                  <QuestionItemUI
                    q={questions.find(q => q.id === activeDragId)!}
                    idx={questions.findIndex(q => q.id === activeDragId)}
                    isSelected={true}
                    onSelect={() => {}}
                    onDelete={() => {}}
                    isDragging={true}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* Add Content Button */}
            <button
              onClick={onAddQuestion}
              className="w-full bg-transparent hover:bg-gray-100/50 text-gray-600 font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add content</span>
            </button>
          </div>
        </div>

        <div className="h-2"></div>

        {/* Endings Section (Grey Box Wrapper) */}
        <div 
          className="bg-gray-50 rounded-3xl p-3 flex flex-col gap-3"
          style={{ height: endingsHeight, minHeight: 64 }}
        >
          <div className="flex items-center justify-between text-sm font-semibold text-gray-900 px-2 pt-1">
            <span>Endings</span>
            <button
              onClick={handleAddEnding}
              className="p-1 hover:bg-gray-200 rounded-md text-gray-500 transition-colors"
              title="Add ending"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleEndingDragStart}
              onDragEnd={handleEndingDragEnd}
            >
              <SortableContext
                items={endings.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                {endings.map((ending, idx) => (
                  <SortableEndingItem
                    key={ending.id}
                    ending={ending}
                    idx={idx}
                    isSelected={activeItem === ending.id}
                    onSelect={onSelectEnding}
                  />
                ))}
              </SortableContext>
              <DragOverlay>
                {activeEndingDragId ? (
                  <EndingItemUI
                    ending={endings.find(e => e.id === activeEndingDragId)!}
                    idx={endings.findIndex(e => e.id === activeEndingDragId)}
                    isSelected={true}
                    onSelect={() => {}}
                    isDragging={true}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
    </aside>
  );
}

