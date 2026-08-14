'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  Position,
  MarkerType,
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import type { LogicMapQuestion, LogicMapResponse } from '../../lib/types';
import QuestionNode, { EndingNode, type QuestionNodeData } from './QuestionNode';
import LogicEdge, { type LogicEdgeData } from './LogicEdge';
import RuleEditorModal from './RuleEditorModal';
import CanvasControls from './CanvasControls';
import PullDataPanel from './PullDataPanel';

// ── Dagre auto-layout ─────────────────────────────────────────────────────────
const NODE_WIDTH = 240;
const NODE_HEIGHT = 44;
const ENDING_WIDTH = 120;
const ENDING_HEIGHT = 40;

function layoutGraph(
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 120 });

  nodes.forEach((n) => {
    const w = n.id === 'ending_default' ? ENDING_WIDTH : NODE_WIDTH;
    const h = n.id === 'ending_default' ? ENDING_HEIGHT : NODE_HEIGHT;
    g.setNode(n.id, { width: w, height: h });
  });
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  const layoutedNodes = nodes.map((n) => {
    const pos = g.node(n.id);
    const w = n.id === 'ending_default' ? ENDING_WIDTH : NODE_WIDTH;
    const h = n.id === 'ending_default' ? ENDING_HEIGHT : NODE_HEIGHT;
    return {
      ...n,
      position: { x: pos.x - w / 2, y: pos.y - h / 2 },
    };
  });

  return { nodes: layoutedNodes, edges };
}

// ── Build nodes + edges from API data ─────────────────────────────────────────
function buildGraphElements(
  data: LogicMapResponse,
  onEditEdge: (edgeId: string) => void
): { nodes: Node[]; edges: Edge[] } {
  const { questions, endings } = data;

  // Nodes
  const questionNodes: Node[] = questions.map((q, idx) => ({
    id: String(q.id),
    type: 'question',
    position: { x: 0, y: 0 }, // dagre will override
    data: {
      question: q,
      orderNumber: idx + 1,
      selected: false,
    } as QuestionNodeData,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  }));

  const endingNodes: Node[] = endings.map((e) => ({
    id: e.id,
    type: 'ending',
    position: { x: 0, y: 0 },
    data: { label: e.label },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  }));

  const allNodes = [...questionNodes, ...endingNodes];

  // Helper to find next question id in linear order
  const getLinearNextId = (qIdx: number): string | null => {
    if (qIdx + 1 < questions.length) return String(questions[qIdx + 1].id);
    return 'ending_default';
  };

  const edges: Edge[] = [];

  questions.forEach((q, idx) => {
    const sourceId = String(q.id);

    // Conditional rule edges
    q.logic_rules.forEach((rule) => {
      const targetId = rule.target_is_ending
        ? 'ending_default'
        : rule.target_question_id !== null
        ? String(rule.target_question_id)
        : null;

      if (targetId) {
        const ruleLabel = rule.condition.value
          ? `if = "${rule.condition.value}"`
          : rule.condition.operator;

        edges.push({
          id: `rule-${q.id}-${rule.id}`,
          source: sourceId,
          target: targetId,
          type: 'logic',
          data: {
            isConditional: true,
            ruleId: rule.id,
            conditionLabel: ruleLabel,
            onEditEdge,
          } as LogicEdgeData,
        });
      }
    });

    // Default path edge
    const defaultTargetId =
      q.default_next_is_ending
        ? 'ending_default'
        : q.default_next_question_id !== null
        ? String(q.default_next_question_id)
        : getLinearNextId(idx);

    if (defaultTargetId) {
      edges.push({
        id: `default-${q.id}`,
        source: sourceId,
        target: defaultTargetId,
        type: 'logic',
        data: {
          isConditional: false,
          onEditEdge,
        } as LogicEdgeData,
      });
    }
  });

  return { nodes: allNodes, edges };
}

// ── Custom node/edge type registries ─────────────────────────────────────────
const nodeTypes: NodeTypes = {
  question: QuestionNode,
  ending: EndingNode,
};

const edgeTypes: EdgeTypes = {
  logic: LogicEdge,
};

// ── Modal state ───────────────────────────────────────────────────────────────
interface ModalState {
  open: boolean;
  sourceQuestionId: number | null;
  editRuleId: string | null;
  prefilledTargetId: number | null;
}

// ── Inner canvas (needs ReactFlowProvider wrapping) ──────────────────────────
interface LogicMapCanvasInnerProps {
  mapData: LogicMapResponse;
  onMapDataChange: (updated: LogicMapQuestion) => void;
}

function LogicMapCanvasInner({ mapData, onMapDataChange }: LogicMapCanvasInnerProps) {
  const [showMinimap, setShowMinimap] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    sourceQuestionId: null,
    editRuleId: null,
    prefilledTargetId: null,
  });

  // Track pending connection (drag-to-connect) separately so we can cancel it
  const pendingConnection = useRef<Connection | null>(null);

  // Build initial elements
  const handleEditEdge = useCallback((edgeId: string) => {
    // Parse "rule-{questionId}-{ruleId}" format
    const parts = edgeId.split('-');
    if (parts[0] === 'rule' && parts.length >= 3) {
      const questionId = parseInt(parts[1], 10);
      const ruleId = parts.slice(2).join('-');
      setModal({ open: true, sourceQuestionId: questionId, editRuleId: ruleId, prefilledTargetId: null });
    }
  }, []);

  const { nodes: initialNodes, edges: initialEdges } = (() => {
    const raw = buildGraphElements(mapData, handleEditEdge);
    return layoutGraph(raw.nodes, raw.edges);
  })();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Rebuild graph when mapData changes
  useEffect(() => {
    const raw = buildGraphElements(mapData, handleEditEdge);
    const laid = layoutGraph(raw.nodes, raw.edges);
    setNodes(laid.nodes);
    setEdges(laid.edges);
  }, [mapData, handleEditEdge, setNodes, setEdges]);

  // Node click → open modal for that question's rules
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === 'ending') return;
      const qId = parseInt(node.id, 10);
      setModal({ open: true, sourceQuestionId: qId, editRuleId: null, prefilledTargetId: null });
    },
    []
  );

  // Drag-to-connect → open rule editor pre-filled with target
  const onConnect = useCallback((connection: Connection) => {
    pendingConnection.current = connection;
    const sourceQId = parseInt(connection.source ?? '', 10);
    const targetQId = connection.target === 'ending_default'
      ? null
      : parseInt(connection.target ?? '', 10);
    setModal({
      open: true,
      sourceQuestionId: sourceQId,
      editRuleId: null,
      prefilledTargetId: targetQId,
    });
  }, []);

  const handleModalClose = () => {
    pendingConnection.current = null;
    setModal({ open: false, sourceQuestionId: null, editRuleId: null, prefilledTargetId: null });
  };

  const handleRulesUpdated = (updated: LogicMapQuestion) => {
    onMapDataChange(updated);
  };

  const sourceQuestion = modal.sourceQuestionId !== null
    ? mapData.questions.find((q) => q.id === modal.sourceQuestionId) ?? null
    : null;

  if (mapData.questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 bg-gray-50">
        <div className="text-5xl mb-4">🌿</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No questions yet</h2>
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
          Add questions in the{' '}
          <span className="font-semibold text-gray-700">Content</span> tab first, then
          come back here to set up branching logic.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ background: '#f5f5f5' }}
      >
        <Background color="#e5e7eb" gap={20} size={1} />
        <PullDataPanel />
        <CanvasControls
          showMinimap={showMinimap}
          onToggleMinimap={() => setShowMinimap((v) => !v)}
        />
      </ReactFlow>

      <RuleEditorModal
        open={modal.open}
        onClose={handleModalClose}
        sourceQuestion={sourceQuestion}
        allQuestions={mapData.questions}
        editRuleId={modal.editRuleId}
        prefilledTargetId={modal.prefilledTargetId}
        onRulesUpdated={handleRulesUpdated}
      />
    </div>
  );
}

// ── Public export (wraps with ReactFlowProvider) ──────────────────────────────
export default function LogicMapCanvas({
  mapData,
  onMapDataChange,
}: {
  mapData: LogicMapResponse;
  onMapDataChange: (updated: LogicMapQuestion) => void;
}) {
  return (
    <ReactFlowProvider>
      <LogicMapCanvasInner mapData={mapData} onMapDataChange={onMapDataChange} />
    </ReactFlowProvider>
  );
}
