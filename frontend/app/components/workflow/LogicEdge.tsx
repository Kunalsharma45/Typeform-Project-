'use client';

import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';

export interface LogicEdgeData extends Record<string, unknown> {
  isConditional: boolean;
  ruleId?: string;
  conditionLabel?: string;
  onEditEdge?: (edgeId: string) => void;
}

const LogicEdge = memo(function LogicEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const edgeData = data as LogicEdgeData | undefined;
  const isConditional = edgeData?.isConditional ?? false;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  // Solid accent color for conditional rules; neutral gray for default linear path
  const strokeColor = isConditional ? 'var(--accent, #6366f1)' : '#d1d5db';
  const strokeWidth = isConditional ? 2.5 : 1.5;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth,
        }}
      />

      {/* Only show the edit button on conditional (rule) edges */}
      {isConditional && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                edgeData?.onEditEdge?.(id);
              }}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'var(--accent, #6366f1)',
                color: '#fff',
                border: '2px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }}
              title={edgeData?.conditionLabel ? `Rule: ${edgeData.conditionLabel}` : 'Edit rule'}
            >
              ✎
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

export default LogicEdge;
