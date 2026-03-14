// ── Visual Workflow Builder Types ─────────────────────────
// Types for the n8n-style automation workflow builder.
// These are separate from the state-machine workflow types
// in workflows.types.ts.

// ── Node Data ────────────────────────────────────────────

export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  nodeCategory: 'trigger' | 'condition' | 'action' | 'flow' | 'utility';
  nodeSubType: string; // e.g., 'trigger_event', 'action_send_email'
  icon: string;
  color: string;
  config: Record<string, any>;
  isConfigured: boolean;
  executionStatus?: 'idle' | 'running' | 'success' | 'error' | 'skipped';
  executionTime?: number;
  executionError?: string;
}

// ── Edge Data ────────────────────────────────────────────

export type VisualEdgeType = 'default' | 'conditional' | 'error';

export interface VisualEdgeData extends Record<string, unknown> {
  label?: string;
  edgeType?: VisualEdgeType;
  conditionBranch?: string; // 'yes', 'no', 'default'
}

// ── Workflow Definition (persisted) ──────────────────────

export interface VisualWorkflowDefinition {
  id?: string;
  name: string;
  description?: string;
  isActive: boolean;
  nodes: any[]; // React Flow Node<BaseNodeData>[]
  edges: any[]; // React Flow Edge<VisualEdgeData>[]
  viewport: { x: number; y: number; zoom: number };
  variables?: Record<string, any>;
}

// ── Execution ────────────────────────────────────────────

export interface WorkflowExecutionLog {
  nodeId: string;
  nodeLabel: string;
  status: 'success' | 'error' | 'skipped';
  startTime: number;
  endTime: number;
  output?: any;
  error?: string;
}

export interface WorkflowExecutionResult {
  id: string;
  workflowId: string;
  status: 'completed' | 'failed' | 'running';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  logs: WorkflowExecutionLog[];
}

// ── Node Palette / Definitions ───────────────────────────

export interface NodeDefinition {
  type: string;
  label: string;
  icon: string;
  description: string;
  category: 'trigger' | 'condition' | 'action' | 'flow' | 'utility';
  color: string;
  defaultConfig: Record<string, any>;
  configFields?: ConfigField[];
  handles?: {
    inputs: number;
    outputs: number | string[]; // string[] for named outputs like ['yes','no']
  };
}

export interface ConfigField {
  key: string;
  label: string;
  type:
    | 'text'
    | 'select'
    | 'number'
    | 'boolean'
    | 'json'
    | 'entity-field'
    | 'cron'
    | 'template';
  options?: { label: string; value: string }[];
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
}

export interface NodeCategory {
  label: string;
  icon: string;
  color: string;
  nodes: NodeDefinition[];
}

// ── Trigger Events ───────────────────────────────────────

export interface TriggerEvent {
  code: string;
  label: string;
  entity: string | null;
  icon: string;
}
