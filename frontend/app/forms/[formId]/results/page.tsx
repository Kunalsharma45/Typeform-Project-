'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { api } from '../../../lib/api';
import type {
  Form,
  FormSummary,
  QuestionSummary,
  PaginatedResponse,
  ResponseListItem,
  ResponseDetail,
} from '../../../lib/types';
import Modal from '../../../components/Modal';
import BuilderTopBar from '../../../components/builder/BuilderTopBar';

const ACCENT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#14b8a6', '#f97316',
];

// ── Summary Question Card ─────────────────────────────────────────────────────

function QuestionSummaryCard({ qs, idx }: { qs: QuestionSummary; idx: number }) {
  const isChart = ['multiple_choice', 'dropdown', 'yes_no', 'rating'].includes(qs.question_type);

  const chartData = isChart
    ? (qs.data as { label: string; count: number }[]).map((d) => ({
        label: String(d.label).length > 15 ? String(d.label).slice(0, 15) + '…' : String(d.label),
        fullLabel: String(d.label),
        count: d.count,
      }))
    : [];

  const textData = !isChart ? (qs.data as string[]) : [];

  return (
    <div className="card p-5 space-y-4">
      <div>
        <div className="text-xs text-gray-400 font-medium mb-1">Q{idx + 1} · {qs.question_type.replace('_', ' ')}</div>
        <h3 className="font-semibold text-gray-900 leading-snug">{qs.question_title}</h3>
        <p className="text-sm text-gray-400 mt-0.5">{qs.total_answers} answer{qs.total_answers !== 1 ? 's' : ''}</p>
      </div>

      {isChart && chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={100}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 13, border: '1px solid #e5e7eb' }}
              formatter={(value: any, _: any, props: any) => [
                `${value} answer${value !== 1 ? 's' : ''}`,
                props?.payload?.fullLabel ?? '',
              ]}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : isChart && chartData.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No answers yet</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {textData.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No answers yet</p>
          ) : (
            textData.map((ans, i) => (
              <div key={i} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                {ans}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Response Row ──────────────────────────────────────────────────────────────

function ResponseRow({
  resp,
  onClick,
}: {
  resp: ResponseListItem;
  onClick: () => void;
}) {
  const isCompleted = resp.status === 'completed';
  return (
    <tr
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-4 py-3 text-sm text-gray-600">#{resp.id}</td>
      <td className="px-4 py-3">
        <span className={`badge ${isCompleted ? 'badge-published' : 'badge-draft'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-400'}`} />
          {isCompleted ? 'Completed' : 'Partial'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {new Date(resp.started_at).toLocaleString()}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {resp.completed_at ? new Date(resp.completed_at).toLocaleString() : '—'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">{resp.answer_count}</td>
      <td className="px-4 py-3">
        <button className="btn btn-ghost btn-sm !py-1">View →</button>
      </td>
    </tr>
  );
}

// ── Response Detail Modal ─────────────────────────────────────────────────────

function ResponseDetailModal({
  responseId,
  onClose,
}: {
  responseId: number;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<ResponseDetail | null>(null);

  useEffect(() => {
    api.responses.get(responseId).then(setDetail).catch(() => toast.error('Failed to load response'));
  }, [responseId]);

  if (!detail) {
    return (
      <Modal open onClose={onClose} title={`Response #${responseId}`} size="lg">
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal open onClose={onClose} title={`Response #${responseId}`} size="lg">
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        <div className="flex items-center gap-3 mb-4">
          <span className={`badge ${detail.status === 'completed' ? 'badge-published' : 'badge-draft'}`}>
            {detail.status}
          </span>
          <span className="text-sm text-gray-400">
            Started {new Date(detail.started_at).toLocaleString()}
          </span>
          {detail.completed_at && (
            <span className="text-sm text-gray-400">
              · Completed {new Date(detail.completed_at).toLocaleString()}
            </span>
          )}
        </div>

        {detail.answers.length === 0 ? (
          <p className="text-gray-400 text-sm italic py-4">No answers recorded.</p>
        ) : (
          detail.answers.map((ans) => (
            <div key={ans.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {ans.question_type.replace('_', ' ')}
              </p>
              <p className="text-sm font-medium text-gray-800">{ans.question_title}</p>
              <div className="text-sm text-gray-600 mt-1">
                {ans.file_url ? (
                  <a
                    href={ans.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    Download file
                  </a>
                ) : typeof ans.value === 'object' && ans.value !== null ? (
                  <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {JSON.stringify(ans.value)}
                  </code>
                ) : (
                  String(ans.value)
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}

// ── Main Results Page ─────────────────────────────────────────────────────────

type TabType = 'summary' | 'responses';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = Number(params.formId);

  const [form, setForm] = useState<Form | null>(null);
  const [summary, setSummary] = useState<FormSummary | null>(null);
  const [responses, setResponses] = useState<PaginatedResponse<ResponseListItem> | null>(null);
  const [tab, setTab] = useState<TabType>('summary');
  const [selectedResponseId, setSelectedResponseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [f, s, r] = await Promise.all([
        api.forms.get(formId),
        api.summary.get(formId),
        api.responses.list(formId),
      ]);
      setForm(f);
      setSummary(s);
      setResponses(r);
    } catch {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => { load(); }, [load]);

  const handleExport = () => {
    const url = api.responses.exportUrl(formId);
    window.open(url, '_blank');
  };

  const accent = form?.theme?.accent_color || '#6366f1';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!form || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Form not found.</p>
      </div>
    );
  }

  const completionRate = summary.completion_rate;

  return (
    <div className="min-h-screen" style={{ background: '#f7f8fa' }}>
      <BuilderTopBar 
        formId={form.id} 
        formTitle={form.title} 
        publicSlug={form.public_slug} 
      />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Page Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Results & Analytics</h2>
          <button
            id="export-csv-btn"
            onClick={handleExport}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Responses', value: summary.total_responses, icon: '📊' },
            { label: 'Completed', value: summary.completed_responses, icon: '✅' },
            {
              label: 'Completion Rate',
              value: `${completionRate}%`,
              icon: '📈',
              sub: `${summary.total_responses - summary.completed_responses} partial`,
            },
          ].map(({ label, value, icon, sub }) => (
            <div key={label} className="card p-5">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{label}</div>
              {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
            </div>
          ))}
        </div>

        {/* Completion rate bar */}
        <div className="card p-5">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">Completion Rate</span>
            <span className="font-semibold">{completionRate}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${completionRate}%`, background: accent }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: '#f3f4f6' }}>
          {(['summary', 'responses'] as TabType[]).map((t) => (
            <button
              key={t}
              id={`tab-${t}`}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={
                tab === t
                  ? { background: '#fff', color: '#111827', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                  : { color: '#6b7280' }
              }
            >
              {t === 'summary' ? 'Summary' : 'Responses'}
            </button>
          ))}
        </div>

        {/* Summary Tab */}
        {tab === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {summary.questions.map((qs, idx) => (
              <QuestionSummaryCard key={qs.question_id} qs={qs} idx={idx} />
            ))}
            {summary.questions.length === 0 && (
              <p className="text-gray-400 col-span-2 text-center py-12">No questions in this form yet.</p>
            )}
          </div>
        )}

        {/* Responses Tab */}
        {tab === 'responses' && (
          <div className="card overflow-hidden">
            {!responses || responses.results.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <p className="text-lg font-medium text-gray-500 mb-1">No responses yet</p>
                <p className="text-sm">Share your form link to start collecting responses.</p>
                {form.status === 'published' && (
                  <button
                    onClick={() => window.open(`/f/${form.public_slug}`, '_blank')}
                    className="btn btn-primary btn-sm mt-4"
                    style={{ background: accent }}
                  >
                    Open Form
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b" style={{ borderColor: '#f3f4f6' }}>
                      {['#', 'Status', 'Started', 'Completed', 'Answers', ''].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {responses.results.map((resp) => (
                      <ResponseRow
                        key={resp.id}
                        resp={resp}
                        onClick={() => setSelectedResponseId(resp.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Response Detail Modal */}
      {selectedResponseId !== null && (
        <ResponseDetailModal
          responseId={selectedResponseId}
          onClose={() => setSelectedResponseId(null)}
        />
      )}
    </div>
  );
}
