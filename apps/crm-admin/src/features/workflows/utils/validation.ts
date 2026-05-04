import type { Node, Edge } from '@xyflow/react';

import type { BaseNodeData } from '../types/visual-workflow.types';

// ── Helpers ──────────────────────────────────────────────

function getNodeData(node: Node): BaseNodeData {
  return node.data as unknown as BaseNodeData;
}

// ── Validation Result ────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ── Validate Workflow ────────────────────────────────────
// Checks structural + configuration rules before a
// workflow can be saved or activated.

export function validateWorkflow(nodes: Node[], edges: Edge[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (nodes.length === 0) {
    errors.push('Workflow has no nodes. Add at least a trigger and one action.');
    return { valid: false, errors, warnings };
  }

  // ── 1. Exactly one trigger node ────────────────────
  const triggerNodes = nodes.filter(
    (n) => getNodeData(n).nodeCategory === 'trigger',
  );

  if (triggerNodes.length === 0) {
    errors.push('Workflow must have exactly one trigger node.');
  } else if (triggerNodes.length > 1) {
    errors.push(
      `Workflow has ${triggerNodes.length} trigger nodes — only one is allowed.`,
    );
  }

  // ── 2. Trigger must be connected ──────────────────
  if (triggerNodes.length === 1) {
    const triggerId = triggerNodes[0].id;
    const hasOutgoing = edges.some((e) => e.source === triggerId);
    if (!hasOutgoing) {
      errors.push('Trigger node is not connected to any subsequent node.');
    }
  }

  // ── 3. No orphan nodes (except utilities) ──────────
  const nodeIds = new Set(nodes.map((n) => n.id));
  const connectedIds = new Set<string>();

  for (const edge of edges) {
    connectedIds.add(edge.source);
    connectedIds.add(edge.target);
  }

  for (const node of nodes) {
    const data = getNodeData(node);
    if (data.nodeCategory === 'utility') continue; // notes can float
    if (!connectedIds.has(node.id)) {
      warnings.push(
        `Node "${data.label}" is not connected to the workflow.`,
      );
    }
  }

  // ── 4. All required configs filled ─────────────────
  for (const node of nodes) {
    const data = getNodeData(node);
    if (data.nodeCategory === 'utility') continue;
    if (!data.isConfigured) {
      errors.push(`Node "${data.label}" has incomplete configuration.`);
    }
  }

  // ── 5. Edge targets must exist ─────────────────────
  for (const edge of edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge references missing source node: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge references missing target node: ${edge.target}`);
    }
  }

  // ── 6. Basic circular-connection check ─────────────
  if (hasCircularPath(nodes, edges)) {
    errors.push(
      'Workflow contains a circular connection. Remove the cycle or use a Loop node instead.',
    );
  }

  // ── 7. Condition nodes should have multiple outputs ─
  const conditionNodes = nodes.filter(
    (n) => getNodeData(n).nodeCategory === 'condition',
  );
  for (const cNode of conditionNodes) {
    const outgoing = edges.filter((e) => e.source === cNode.id);
    if (outgoing.length < 2) {
      warnings.push(
        `Condition node "${getNodeData(cNode).label}" has fewer than 2 output branches.`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ── Cycle Detection (DFS) ───────────────────────────────
// Performs a standard DFS cycle check on the directed graph.
// Loop nodes are excluded from the check since they
// intentionally create back-edges.

function hasCircularPath(nodes: Node[], edges: Edge[]): boolean {
  // Build adjacency list, skipping edges that originate from loop nodes
  const loopNodeIds = new Set(
    nodes
      .filter((n) => getNodeData(n).nodeSubType === 'flow_loop')
      .map((n) => n.id),
  );

  const adj = new Map<string, string[]>();
  for (const node of nodes) {
    adj.set(node.id, []);
  }
  for (const edge of edges) {
    if (loopNodeIds.has(edge.source)) continue;
    adj.get(edge.source)?.push(edge.target);
  }

  const WHITE = 0; // unvisited
  const GRAY = 1; // in current DFS path
  const BLACK = 2; // fully processed

  const color = new Map<string, number>();
  for (const node of nodes) {
    color.set(node.id, WHITE);
  }

  function dfs(nodeId: string): boolean {
    color.set(nodeId, GRAY);
    const neighbors = adj.get(nodeId) ?? [];
    for (const neighbor of neighbors) {
      const c = color.get(neighbor) ?? WHITE;
      if (c === GRAY) return true; // back-edge → cycle
      if (c === WHITE && dfs(neighbor)) return true;
    }
    color.set(nodeId, BLACK);
    return false;
  }

  for (const node of nodes) {
    if (color.get(node.id) === WHITE) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
}
