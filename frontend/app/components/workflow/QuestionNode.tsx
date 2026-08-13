'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { LogicMapQuestion } from '../../lib/types';

import {
  Type,
  AlignLeft,
  List,
  ChevronDown,
  Mail,
  Phone,
  ToggleLeft,
  Star,
  Upload,
} from 'lucide-react';

// Reuse the same type icon colors defined in globals.css as CSS variables
const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  short_text:      { icon: <Type className="w-3.5 h-3.5" />,  color: '#6366f1' },
  long_text:       { icon: <AlignLeft className="w-3.5 h-3.5" />,  color: '#8b5cf6' },
  multiple_choice: { icon: <List className="w-3.5 h-3.5" />,  color: '#ec4899' },
  dropdown:        { icon: <ChevronDown className="w-3.5 h-3.5" />,  color: '#f59e0b' },
  email:           { icon: <Mail className="w-3.5 h-3.5" />,  color: '#10b981' },
  number:          { icon: <Phone className="w-3.5 h-3.5" />,  color: '#3b82f6' },
  yes_no:          { icon: <ToggleLeft className="w-3.5 h-3.5" />,  color: '#14b8a6' },
  rating:          { icon: <Star className="w-3.5 h-3.5" />,  color: '#f97316' },
  file_upload:     { icon: <Upload className="w-3.5 h-3.5" />,  color: '#64748b' },
};

// Ending node (the Thank You screen)
export function EndingNode({ data }: NodeProps) {
  return (
    <div
      title="Thank you screen"
      style={{
        width: 120,
        height: 40,
        borderRadius: 999,
        background: '#f0fdf4',
        border: '2px solid #86efac',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        fontSize: 11,
        fontWeight: 700,
        color: '#16a34a',
        fontFamily: 'var(--font-inter, system-ui)',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      ✓ Thank you
    </div>
  );
}

export interface QuestionNodeData extends Record<string, unknown> {
  question: LogicMapQuestion;
  orderNumber: number;
  selected: boolean;
}

const QuestionNode = memo(function QuestionNode({ data, selected }: NodeProps) {
  const nodeData = data as QuestionNodeData;
  const { question, orderNumber } = nodeData;
  const cfg = TYPE_CONFIG[question.type] ?? { icon: '?', color: '#6b7280' };
  const hasRules = question.logic_rules.length > 0;

  return (
    <div
      title={question.title || 'Untitled question'}
      style={{
        width: 150,
        height: 44,
        borderRadius: 10,
        background: '#ffffff',
        border: `2px solid ${selected ? 'var(--accent, #6366f1)' : hasRules ? '#c7d2fe' : '#e5e7eb'}`,
        boxShadow: selected
          ? '0 0 0 3px rgba(99,102,241,0.15)'
          : '0 1px 3px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 10,
        paddingRight: 10,
        cursor: 'pointer',
        fontFamily: 'var(--font-inter, system-ui)',
        transition: 'border-color 150ms, box-shadow 150ms',
      }}
    >
      {/* Left: type icon */}
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          background: `${cfg.color}18`,
          color: cfg.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {cfg.icon}
      </div>

      {/* Right: question number badge */}
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          background: '#f3f4f6',
          color: '#374151',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {orderNumber}
      </div>

      {/* React Flow connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 10,
          height: 10,
          background: '#d1d5db',
          border: '2px solid #fff',
          borderRadius: '50%',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 10,
          height: 10,
          background: '#6366f1',
          border: '2px solid #fff',
          borderRadius: '50%',
        }}
      />
    </div>
  );
});

export default QuestionNode;
