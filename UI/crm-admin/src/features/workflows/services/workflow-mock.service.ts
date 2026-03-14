// ── Workflow Mock Execution Service ─────────────────────
// Runs workflow execution entirely on the client side for testing.
// No backend API calls — simulates node traversal with realistic timing.

import type { WorkflowExecutionResult, WorkflowExecutionLog } from '../types/visual-workflow.types';

// ── Types ──────────────────────────────────────────────

export interface MockExecutionOptions {
  speed: 'instant' | 'normal' | 'slow';
  showAnimation: boolean;
  stopOnError: boolean;
  sampleData: Record<string, any>;
}

// ── Speed delays ───────────────────────────────────────

const SPEED_DELAY: Record<MockExecutionOptions['speed'], number> = {
  instant: 0,
  normal: 1000,
  slow: 2000,
};

// ── Helpers ────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateMockOutput(nodeSubType: string, sampleData: Record<string, any>): any {
  switch (nodeSubType) {
    case 'trigger_event':
    case 'trigger_schedule':
    case 'trigger_webhook':
    case 'trigger_manual':
      return { triggered: true, data: sampleData };
    case 'action_send_email':
      return { sent: true, messageId: `msg_${Date.now()}` };
    case 'action_send_whatsapp':
      return { delivered: true, messageId: `wa_${Date.now()}` };
    case 'action_send_notification':
      return { notified: true };
    case 'action_update_field':
      return { updated: true, recordId: sampleData.id || 'rec_1' };
    case 'action_create_record':
      return { created: true, newId: `new_${Date.now()}` };
    case 'action_create_task':
      return { taskId: `task_${Date.now()}`, created: true };
    case 'action_create_activity':
      return { activityId: `act_${Date.now()}`, logged: true };
    case 'action_assign':
      return { assigned: true, userId: 'user_1' };
    case 'action_move_stage':
      return { moved: true, newStage: 'negotiation' };
    case 'action_http_request':
      return { statusCode: 200, body: { success: true } };
    case 'condition_if':
    case 'condition_switch':
    case 'condition_filter':
      return { evaluated: true };
    case 'flow_delay':
      return { delayed: true, skippedInTest: true };
    case 'flow_split':
      return { branches: 2 };
    case 'flow_merge':
      return { merged: true };
    case 'flow_loop':
      return { iterations: 3 };
    case 'flow_end':
      return { ended: true };
    case 'util_set_variable':
      return { variableSet: true };
    case 'util_format':
      return { formatted: true };
    case 'util_note':
      return { skipped: true };
    default:
      return { executed: true };
  }
}

/**
 * Find the trigger node — a node with no incoming edges.
 */
function findTriggerNode(nodes: any[], edges: any[]): any | null {
  const targetNodeIds = new Set(edges.map((e: any) => e.target));
  const triggerNodes = nodes.filter(
    (n: any) =>
      !targetNodeIds.has(n.id) &&
      n.data?.nodeCategory === 'trigger',
  );
  return triggerNodes[0] || nodes.find((n: any) => n.data?.nodeCategory === 'trigger') || null;
}

/**
 * Build adjacency list from edges.
 */
function buildAdjacencyList(edges: any[]): Map<string, { target: string; label?: string }[]> {
  const adj = new Map<string, { target: string; label?: string }[]>();
  for (const edge of edges) {
    const list = adj.get(edge.source) || [];
    list.push({
      target: edge.target,
      label: edge.data?.conditionBranch || edge.sourceHandle || undefined,
    });
    adj.set(edge.source, list);
  }
  return adj;
}

// ── Service ────────────────────────────────────────────

export const workflowMockService = {
  /**
   * Execute a workflow mock run.
   * Traverses nodes via BFS, simulates execution, and reports progress.
   */
  async execute(
    nodes: any[],
    edges: any[],
    options: MockExecutionOptions,
    onNodeStart?: (nodeId: string) => void,
    onNodeComplete?: (nodeId: string, log: WorkflowExecutionLog) => void,
  ): Promise<WorkflowExecutionResult> {
    const startedAt = new Date().toISOString();
    const executionStart = Date.now();
    const logs: WorkflowExecutionLog[] = [];
    const visited = new Set<string>();
    const adjacency = buildAdjacencyList(edges);
    const nodeMap = new Map(nodes.map((n: any) => [n.id, n]));
    const speedDelay = SPEED_DELAY[options.speed];

    // Find the trigger node to start traversal
    const triggerNode = findTriggerNode(nodes, edges);
    if (!triggerNode) {
      return {
        id: `exec_${Date.now()}`,
        workflowId: 'mock',
        status: 'failed',
        startedAt,
        completedAt: new Date().toISOString(),
        duration: 0,
        logs: [
          {
            nodeId: 'none',
            nodeLabel: 'Workflow',
            status: 'error',
            startTime: executionStart,
            endTime: Date.now(),
            error: 'No trigger node found. Add a trigger to start the workflow.',
          },
        ],
      };
    }

    // BFS traversal queue: [nodeId]
    const queue: string[] = [triggerNode.id];
    let hasError = false;

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (!node) continue;

      const nodeData = node.data || {};
      const nodeSubType: string = nodeData.nodeSubType || '';
      const nodeCategory: string = nodeData.nodeCategory || '';
      const nodeLabel: string = nodeData.label || node.id;

      // Skip note nodes entirely
      if (nodeSubType === 'util_note') continue;

      // Signal node start
      onNodeStart?.(nodeId);

      // Simulate execution delay
      const simulatedDuration = randomBetween(50, 500);
      if (speedDelay > 0 && options.showAnimation) {
        await delay(speedDelay);
      }

      const nodeStartTime = Date.now();

      // Create execution log
      const log: WorkflowExecutionLog = {
        nodeId,
        nodeLabel,
        status: 'success',
        startTime: nodeStartTime,
        endTime: nodeStartTime + simulatedDuration,
        output: generateMockOutput(nodeSubType, options.sampleData),
      };

      // Determine which edges to follow
      const outEdges = adjacency.get(nodeId) || [];

      if (nodeSubType === 'condition_if') {
        // 70% chance to take "yes" branch
        const takesYes = Math.random() < 0.7;
        const chosenBranch = takesYes ? 'yes' : 'no';
        log.output = { evaluated: true, branch: chosenBranch };

        for (const edge of outEdges) {
          if (edge.label === chosenBranch) {
            queue.push(edge.target);
          }
        }
      } else if (nodeSubType === 'condition_switch') {
        // Pick a random case or default
        if (outEdges.length > 0) {
          const picked = outEdges[Math.floor(Math.random() * outEdges.length)];
          log.output = { evaluated: true, branch: picked.label || 'default' };
          queue.push(picked.target);
        }
      } else if (nodeSubType === 'condition_filter') {
        // 70% chance passes the filter
        const passes = Math.random() < 0.7;
        log.output = { evaluated: true, passed: passes };
        if (passes) {
          for (const edge of outEdges) {
            queue.push(edge.target);
          }
        } else {
          log.status = 'skipped';
          log.output = { evaluated: true, passed: false, filteredOut: true };
        }
      } else if (nodeSubType === 'flow_split') {
        // Follow all branches
        for (const edge of outEdges) {
          queue.push(edge.target);
        }
      } else if (nodeSubType === 'flow_end') {
        // Terminal node — do not follow any edges
        log.output = { ended: true };
      } else {
        // Default: follow all outgoing edges
        for (const edge of outEdges) {
          queue.push(edge.target);
        }
      }

      logs.push(log);
      onNodeComplete?.(nodeId, log);

      // Stop on error if configured
      if (log.status === 'error' && options.stopOnError) {
        hasError = true;
        break;
      }
    }

    const executionEnd = Date.now();

    return {
      id: `exec_${Date.now()}`,
      workflowId: 'mock',
      status: hasError ? 'failed' : 'completed',
      startedAt,
      completedAt: new Date().toISOString(),
      duration: executionEnd - executionStart,
      logs,
    };
  },
};
