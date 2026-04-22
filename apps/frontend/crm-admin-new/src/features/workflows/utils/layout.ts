import * as dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

// ── Constants ────────────────────────────────────────────

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;
const RANK_SEP = 80; // spacing between ranks (layers)
const NODE_SEP = 40; // spacing between nodes in the same rank

// ── Auto-Layout ──────────────────────────────────────────
// Uses dagre to compute a hierarchical layout for the
// workflow graph. Returns a new array of nodes with
// updated positions — edges are unchanged.

export function autoLayout(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'LR',
): Node[] {
  if (nodes.length === 0) return nodes;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    ranksep: RANK_SEP,
    nodesep: NODE_SEP,
    marginx: 40,
    marginy: 40,
  });

  // Add nodes
  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  // Add edges
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  // Run layout
  dagre.layout(g);

  // Map positions back — dagre returns center coords, React Flow
  // expects top-left, so offset by half width/height.
  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });
}

// ── Center Viewport ──────────────────────────────────────
// Computes a viewport that centers all nodes in view.

export function computeCenterViewport(
  nodes: Node[],
  canvasWidth: number,
  canvasHeight: number,
): { x: number; y: number; zoom: number } {
  if (nodes.length === 0) {
    return { x: 0, y: 0, zoom: 1 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    const x = node.position.x;
    const y = node.position.y;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + NODE_WIDTH > maxX) maxX = x + NODE_WIDTH;
    if (y + NODE_HEIGHT > maxY) maxY = y + NODE_HEIGHT;
  }

  const graphWidth = maxX - minX;
  const graphHeight = maxY - minY;

  const padding = 80;
  const zoom = Math.min(
    (canvasWidth - padding * 2) / graphWidth,
    (canvasHeight - padding * 2) / graphHeight,
    1.5, // max zoom
  );

  const clampedZoom = Math.max(zoom, 0.2); // min zoom

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return {
    x: canvasWidth / 2 - centerX * clampedZoom,
    y: canvasHeight / 2 - centerY * clampedZoom,
    zoom: clampedZoom,
  };
}
