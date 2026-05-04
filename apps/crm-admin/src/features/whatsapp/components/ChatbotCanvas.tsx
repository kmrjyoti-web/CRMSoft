'use client';

import type { ChatbotNode } from '../types/chatbot.types';
import { ChatbotNodeComponent } from './ChatbotNode';

interface ChatbotCanvasProps {
  nodes: ChatbotNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
}

export function ChatbotCanvas({ nodes, selectedNodeId, onSelectNode, onMoveNode }: ChatbotCanvasProps) {
  // Build connection lines
  const connections: { from: ChatbotNode; to: ChatbotNode }[] = [];
  for (const node of nodes) {
    for (const conn of node.connections) {
      const target = nodes.find((n) => n.id === conn.targetNodeId);
      if (target) connections.push({ from: node, to: target });
    }
  }

  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const origX = node.position.x;
    const origY = node.position.y;

    const handleMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      onMoveNode(nodeId, origX + dx, origY + dy);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'auto',
        background: '#f8fafc',
        backgroundImage:
          'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        minHeight: 600,
      }}
    >
      {/* SVG connections */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {connections.map((conn, i) => {
          const x1 = conn.from.position.x + 200; // right edge
          const y1 = conn.from.position.y + 40; // center height
          const x2 = conn.to.position.x; // left edge
          const y2 = conn.to.position.y + 40;
          const cpX = (x1 + x2) / 2;

          return (
            <path
              key={i}
              d={`M ${x1} ${y1} C ${cpX} ${y1}, ${cpX} ${y2}, ${x2} ${y2}`}
              fill="none"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="6 3"
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          onMouseDown={(e) => handleMouseDown(node.id, e)}
        >
          <ChatbotNodeComponent
            node={node}
            isSelected={node.id === selectedNodeId}
            onClick={() => onSelectNode(node.id)}
          />
        </div>
      ))}

      {nodes.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: 14,
          }}
        >
          Click a node type from the palette to add it to the canvas
        </div>
      )}
    </div>
  );
}
