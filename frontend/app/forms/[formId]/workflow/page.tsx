'use client';

// React Flow requires its stylesheet imported locally, NOT in globals.css
// to prevent styles leaking into other pages.
import '@xyflow/react/dist/style.css';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '../../../lib/api';
import type { LogicMapQuestion, LogicMapResponse } from '../../../lib/types';
import BuilderTopBar from '../../../components/builder/BuilderTopBar';
import BranchingSubTabs from '../../../components/workflow/BranchingSubTabs';
import LogicMapCanvas from '../../../components/workflow/LogicMapCanvas';

export default function WorkflowPage() {
  const params = useParams();
  const formId = Number(params.formId);

  const [mapData, setMapData] = useState<LogicMapResponse | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch logic map + form title in parallel
      const [map, form] = await Promise.all([
        api.logic.getMap(formId),
        api.forms.get(formId),
      ]);
      setMapData(map);
      setFormTitle(form.title);
    } catch {
      setError('Failed to load workflow data');
      toast.error('Failed to load workflow data');
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // When a question's logic rules are updated in the canvas, merge into mapData
  const handleMapDataChange = useCallback((updated: LogicMapQuestion) => {
    setMapData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === updated.id ? updated : q
        ),
      };
    });
  }, []);

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden font-sans">
      {/* Top navigation bar */}
      <BuilderTopBar formId={formId} formTitle={formTitle || 'Loading…'} />

      {/* Branching sub-tab row */}
      <BranchingSubTabs />

      {/* Main canvas area */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-gray-50">
          <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading logic map…</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-center px-8 bg-gray-50">
          <div>
            <p className="text-gray-700 font-semibold mb-2">{error}</p>
            <button
              onClick={loadData}
              className="btn btn-secondary btn-sm mt-2"
            >
              Retry
            </button>
          </div>
        </div>
      ) : mapData ? (
        <LogicMapCanvas
          mapData={mapData}
          onMapDataChange={handleMapDataChange}
        />
      ) : null}
    </div>
  );
}
