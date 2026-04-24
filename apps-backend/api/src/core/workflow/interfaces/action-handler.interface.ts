export interface WorkflowActionContext {
  instanceId: string;
  entityType: string;
  entityId: string;
  entity: Record<string, any>;
  performer: { id: string; firstName: string; lastName: string; email: string };
  currentState: { name: string; code: string };
  previousState?: { name: string; code: string };
  timestamp: Date;
}

export interface ActionResult {
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  result?: Record<string, unknown>;
  errorMessage?: string;
}

export interface IActionHandler {
  readonly type: string;
  execute(config: any, context: WorkflowActionContext): Promise<ActionResult>;
}
