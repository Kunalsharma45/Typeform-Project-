'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../Modal';
import { api } from '../../lib/api';
import type {
  LogicMapQuestion,
  LogicOperator,
  LogicRule,
  QuestionOption,
} from '../../lib/types';

const CHOICE_TYPES = ['multiple_choice', 'dropdown', 'yes_no'];
const YES_NO_OPTIONS: QuestionOption[] = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
];

const OPERATORS: { value: LogicOperator; label: string }[] = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'does not equal' },
  { value: 'contains', label: 'contains' },
  { value: 'greater_than', label: 'is greater than' },
  { value: 'less_than', label: 'is less than' },
  { value: 'is_answered', label: 'is answered' },
  { value: 'is_empty', label: 'is empty' },
];

const OPERATORS_WITHOUT_VALUE: LogicOperator[] = ['is_answered', 'is_empty'];

interface RuleEditorModalProps {
  open: boolean;
  onClose: () => void;
  /** The question whose rules are being edited */
  sourceQuestion: LogicMapQuestion | null;
  /** All questions (for target selector) */
  allQuestions: LogicMapQuestion[];
  /** Pre-select a specific rule to edit (null = adding new rule) */
  editRuleId?: string | null;
  /** Pre-populate a target question when opened via drag-to-connect */
  prefilledTargetId?: number | null;
  onRulesUpdated: (updated: LogicMapQuestion) => void;
}

interface RuleFormState {
  id: string;
  operator: LogicOperator;
  value: string;
  targetQuestionId: number | 'ending' | null;
}

function buildRuleForm(rule: LogicRule | null, prefilledTargetId?: number | null): RuleFormState {
  if (!rule) {
    return {
      id: crypto.randomUUID(),
      operator: 'equals',
      value: '',
      targetQuestionId: prefilledTargetId ?? null,
    };
  }
  return {
    id: rule.id,
    operator: rule.condition.operator,
    value: rule.condition.value !== undefined ? String(rule.condition.value) : '',
    targetQuestionId: rule.target_is_ending ? 'ending' : (rule.target_question_id ?? null),
  };
}

export default function RuleEditorModal({
  open,
  onClose,
  sourceQuestion,
  allQuestions,
  editRuleId,
  prefilledTargetId,
  onRulesUpdated,
}: RuleEditorModalProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<RuleFormState>(() => {
    const existingRule = editRuleId
      ? sourceQuestion?.logic_rules.find((r) => r.id === editRuleId) ?? null
      : null;
    return buildRuleForm(existingRule, prefilledTargetId);
  });
  const [defaultNextId, setDefaultNextId] = useState<number | 'ending' | null>(
    sourceQuestion?.default_next_is_ending
      ? 'ending'
      : (sourceQuestion?.default_next_question_id ?? null)
  );

  if (!sourceQuestion) return null;

  const isChoiceType = CHOICE_TYPES.includes(sourceQuestion.type);
  const options: QuestionOption[] =
    sourceQuestion.type === 'yes_no'
      ? YES_NO_OPTIONS
      : Array.isArray(sourceQuestion.options)
      ? (sourceQuestion.options as QuestionOption[])
      : [];

  const otherQuestions = allQuestions.filter((q) => q.id !== sourceQuestion.id);
  const showValueInput = !OPERATORS_WITHOUT_VALUE.includes(form.operator);

  const handleSaveRule = async () => {
    if (form.targetQuestionId === null) {
      toast.error('Please select a destination question or ending.');
      return;
    }

    const newRule: LogicRule = {
      id: form.id,
      condition: {
        operator: form.operator,
        ...(showValueInput && form.value ? { value: form.value } : {}),
      },
      target_question_id: form.targetQuestionId === 'ending' ? null : (form.targetQuestionId as number),
      target_is_ending: form.targetQuestionId === 'ending',
    };

    const existingRules = sourceQuestion.logic_rules ?? [];
    const updatedRules = editRuleId
      ? existingRules.map((r) => (r.id === editRuleId ? newRule : r))
      : [...existingRules, newRule];

    setSaving(true);
    try {
      const updated = await api.logic.updateQuestion(sourceQuestion.id, {
        logic_rules: updatedRules,
        default_next_question_id:
          defaultNextId === 'ending' || defaultNextId === null ? null : (defaultNextId as number),
        default_next_is_ending: defaultNextId === 'ending',
      });
      onRulesUpdated(updated);
      toast.success(editRuleId ? 'Rule updated' : 'Rule added');
      onClose();
    } catch {
      toast.error('Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async () => {
    if (!editRuleId) return;
    setSaving(true);
    try {
      const updated = await api.logic.deleteRule(sourceQuestion.id, editRuleId);
      onRulesUpdated(updated);
      toast.success('Rule deleted');
      onClose();
    } catch {
      toast.error('Failed to delete rule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editRuleId ? 'Edit branch rule' : 'Add branch rule'}
    >
      {/* Question context */}
      <p className="text-xs text-gray-500 font-medium mb-4">
        Source:{' '}
        <strong className="text-gray-800">
          Q{allQuestions.findIndex((q) => q.id === sourceQuestion.id) + 1} — {sourceQuestion.title || 'Untitled'}
        </strong>
      </p>

      {/* Condition builder */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">If answer is</label>
          {isChoiceType ? (
            <select
              className="input text-sm"
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            >
              <option value="">— Select an option —</option>
              {options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex gap-2">
              <select
                className="input text-sm flex-1"
                value={form.operator}
                onChange={(e) =>
                  setForm((f) => ({ ...f, operator: e.target.value as LogicOperator }))
                }
              >
                {OPERATORS.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
              {showValueInput && (
                <input
                  type="text"
                  className="input text-sm flex-1"
                  placeholder="Value…"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                />
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Then skip to</label>
          <select
            className="input text-sm"
            value={
              form.targetQuestionId === 'ending'
                ? 'ending'
                : (form.targetQuestionId?.toString() ?? '')
            }
            onChange={(e) => {
              const v = e.target.value;
              setForm((f) => ({
                ...f,
                targetQuestionId: v === 'ending' ? 'ending' : v ? parseInt(v, 10) : null,
              }));
            }}
          >
            <option value="">— Select destination —</option>
            {otherQuestions.map((q, idx) => (
              <option key={q.id} value={q.id.toString()}>
                Q{allQuestions.findIndex((aq) => aq.id === q.id) + 1} —{' '}
                {q.title || 'Untitled'}
              </option>
            ))}
            <option value="ending">✓ Thank you screen (Ending)</option>
          </select>
        </div>
      </div>

      {/* Default path section */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Default path (if no rule matches)
        </label>
        <select
          className="input text-sm"
          value={
            defaultNextId === 'ending' ? 'ending' : (defaultNextId?.toString() ?? '')
          }
          onChange={(e) => {
            const v = e.target.value;
            setDefaultNextId(v === 'ending' ? 'ending' : v ? parseInt(v, 10) : null);
          }}
        >
          <option value="">Next question in order (default)</option>
          {otherQuestions.map((q) => (
            <option key={q.id} value={q.id.toString()}>
              Q{allQuestions.findIndex((aq) => aq.id === q.id) + 1} —{' '}
              {q.title || 'Untitled'}
            </option>
          ))}
          <option value="ending">✓ Thank you screen (Ending)</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <div>
          {editRuleId && (
            <button
              onClick={handleDeleteRule}
              disabled={saving}
              className="btn btn-danger btn-sm"
            >
              Delete rule
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button
            onClick={handleSaveRule}
            disabled={saving}
            className="btn btn-primary btn-sm"
            style={{ background: 'var(--accent)' }}
          >
            {saving ? 'Saving…' : editRuleId ? 'Update rule' : 'Add rule'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
