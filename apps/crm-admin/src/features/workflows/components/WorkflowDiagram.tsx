"use client";

import { useMemo } from "react";

import type { WorkflowState, WorkflowTransition } from "../types/workflows.types";

// ── Layout constants ──────────────────────────────────────

const NODE_W = 140;
const NODE_H = 56;
const COL_GAP = 60;
const ROW_GAP = 40;
const PADDING = 30;
const COLS_PER_ROW = 5;

// ── Types ─────────────────────────────────────────────────

interface DiagramNode {
  id: string;
  label: string;
  stateType: string;
  color: string;
  x: number;
  y: number;
}

// ── Helpers ───────────────────────────────────────────────

function darkenColor(hex: string): string {
  try {
    const cleaned = hex.replace("#", "");
    const r = Math.max(0, parseInt(cleaned.substring(0, 2), 16) - 40);
    const g = Math.max(0, parseInt(cleaned.substring(2, 4), 16) - 40);
    const b = Math.max(0, parseInt(cleaned.substring(4, 6), 16) - 40);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } catch {
    return "#94a3b8";
  }
}

// ── WorkflowDiagram ───────────────────────────────────────

export function WorkflowDiagram({
  states,
  transitions,
}: {
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}) {
  const layout = useMemo(() => {
    const nodes: DiagramNode[] = states.map((s, idx) => {
      const col = idx % COLS_PER_ROW;
      const row = Math.floor(idx / COLS_PER_ROW);
      return {
        id: s.id,
        label: s.name,
        stateType: s.stateType,
        color: s.color ?? "#94a3b8",
        x: PADDING + col * (NODE_W + COL_GAP),
        y: PADDING + row * (NODE_H + ROW_GAP),
      };
    });

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const edgeLines = transitions
      .map((t) => {
        const src = nodeMap.get(t.fromStateId);
        const tgt = nodeMap.get(t.toStateId);
        if (!src || !tgt) return null;
        return { id: t.id, src, tgt, label: t.name, triggerType: t.triggerType };
      })
      .filter(Boolean) as Array<{
        id: string;
        src: DiagramNode;
        tgt: DiagramNode;
        label: string;
        triggerType: string;
      }>;

    const totalRows = Math.ceil(states.length / COLS_PER_ROW);
    const totalCols = Math.min(states.length, COLS_PER_ROW);
    const svgW = PADDING * 2 + totalCols * NODE_W + (totalCols - 1) * COL_GAP;
    const svgH = PADDING * 2 + totalRows * NODE_H + (totalRows - 1) * ROW_GAP;

    return { nodes, edgeLines, svgW, svgH };
  }, [states, transitions]);

  if (layout.nodes.length === 0) return null;

  return (
    <div className="overflow-auto rounded-lg border border-gray-100 bg-slate-50">
      <svg
        width={Math.max(layout.svgW, 600)}
        height={Math.max(layout.svgH, 200)}
        viewBox={`0 0 ${Math.max(layout.svgW, 600)} ${Math.max(layout.svgH, 200)}`}
        className="select-none"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Edges */}
        {layout.edgeLines.map((e) => {
          const srcCx = e.src.x + NODE_W / 2;
          const srcCy = e.src.y + NODE_H / 2;
          const tgtCx = e.tgt.x + NODE_W / 2;
          const tgtCy = e.tgt.y + NODE_H / 2;

          const dx = tgtCx - srcCx;
          const dy = tgtCy - srcCy;

          let x1: number, y1: number, x2: number, y2: number;
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
              x1 = e.src.x + NODE_W; y1 = srcCy;
              x2 = e.tgt.x;          y2 = tgtCy;
            } else {
              x1 = e.src.x;          y1 = srcCy;
              x2 = e.tgt.x + NODE_W; y2 = tgtCy;
            }
          } else {
            if (dy > 0) {
              x1 = srcCx; y1 = e.src.y + NODE_H;
              x2 = tgtCx; y2 = e.tgt.y;
            } else {
              x1 = srcCx; y1 = e.src.y;
              x2 = tgtCx; y2 = e.tgt.y + NODE_H;
            }
          }

          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const path =
            Math.abs(dy) < 10
              ? `M ${x1} ${y1} L ${x2} ${y2}`
              : `M ${x1} ${y1} Q ${midX} ${y1} ${midX} ${midY} Q ${midX} ${y2} ${x2} ${y2}`;

          return (
            <g key={e.id}>
              <path
                d={path}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth={1.5}
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        })}

        {/* Nodes */}
        {layout.nodes.map((n) => (
          <g key={n.id}>
            <rect
              x={n.x}
              y={n.y}
              width={NODE_W}
              height={NODE_H}
              rx={10}
              fill={n.color}
              stroke={darkenColor(n.color)}
              strokeWidth={2}
            />
            <text
              x={n.x + NODE_W / 2}
              y={n.y + NODE_H / 2 - 6}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize={12}
              fontWeight={600}
            >
              {n.label}
            </text>
            <text
              x={n.x + NODE_W / 2}
              y={n.y + NODE_H / 2 + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.7)"
              fontSize={9}
              fontWeight={500}
            >
              {n.stateType}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
