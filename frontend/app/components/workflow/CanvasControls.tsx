'use client';

import { useCallback } from 'react';
import { Controls, MiniMap, useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize2, Map } from 'lucide-react';

interface CanvasControlsProps {
  showMinimap: boolean;
  onToggleMinimap: () => void;
}

export default function CanvasControls({ showMinimap, onToggleMinimap }: CanvasControlsProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const btnStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    cursor: 'pointer',
    color: '#374151',
    transition: 'all 150ms',
  };

  return (
    <>
      {/* Custom zoom controls overlaid at bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 16,
          display: 'flex',
          flexDirection: 'row',
          gap: 4,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => zoomOut()}
          style={btnStyle}
          title="Zoom out"
          onMouseEnter={(e) => ((e.currentTarget.style.background = '#f9fafb'))}
          onMouseLeave={(e) => ((e.currentTarget.style.background = '#fff'))}
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => zoomIn()}
          style={btnStyle}
          title="Zoom in"
          onMouseEnter={(e) => ((e.currentTarget.style.background = '#f9fafb'))}
          onMouseLeave={(e) => ((e.currentTarget.style.background = '#fff'))}
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => fitView({ padding: 0.2, duration: 300 })}
          style={btnStyle}
          title="Fit to screen"
          onMouseEnter={(e) => ((e.currentTarget.style.background = '#f9fafb'))}
          onMouseLeave={(e) => ((e.currentTarget.style.background = '#fff'))}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onToggleMinimap}
          style={{
            ...btnStyle,
            background: showMinimap ? '#eef2ff' : '#fff',
            borderColor: showMinimap ? '#6366f1' : '#e5e7eb',
            color: showMinimap ? '#6366f1' : '#374151',
          }}
          title="Toggle minimap"
          onMouseEnter={(e) => {
            if (!showMinimap) e.currentTarget.style.background = '#f9fafb';
          }}
          onMouseLeave={(e) => {
            if (!showMinimap) e.currentTarget.style.background = '#fff';
          }}
        >
          <Map className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* React Flow MiniMap (conditionally rendered) */}
      {showMinimap && (
        <MiniMap
          style={{
            bottom: 66,
            left: 16,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
          maskColor="rgba(243,244,246,0.7)"
          nodeColor="#6366f1"
        />
      )}
    </>
  );
}
