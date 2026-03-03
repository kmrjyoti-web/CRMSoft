export interface ConditionConfig {
  conditions: ConditionRule[];
  logic: 'AND' | 'OR';
}

export interface ConditionRule {
  field: string;
  operator:
    | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'
    | 'in' | 'notIn' | 'contains' | 'isNull' | 'isNotNull'
    | 'between' | 'regex';
  value?: any;
}

export interface ActionConfig {
  type: string;
  config: Record<string, any>;
}

export interface TransitionResult {
  instanceId: string;
  fromState: string;
  toState: string;
  action: string;
  historyId: string;
}

export interface AvailableTransition {
  id: string;
  code: string;
  name: string;
  triggerType: string;
  toState: { id: string; name: string; code: string; color: string | null };
}

export interface EntityStatus {
  instanceId: string;
  workflowId: string;
  workflowName: string;
  currentState: {
    id: string;
    name: string;
    code: string;
    stateType: string;
    category: string | null;
    color: string | null;
  };
  previousState?: { id: string; name: string; code: string } | null;
  startedAt: Date;
  completedAt: Date | null;
  isActive: boolean;
}
