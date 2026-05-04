import type { WaChatbotFlowStatus, WaChatbotNodeType } from './whatsapp.types';

export interface ChatbotNodeConnection {
  targetId: string;
  label?: string;
}

export interface ChatbotNode {
  id: string;
  type: WaChatbotNodeType;
  position: { x: number; y: number };
  data: {
    message?: string;
    mediaUrl?: string;
    mediaType?: string;
    buttons?: { id: string; text: string; nextNodeId?: string }[];
    condition?: { field: string; operator: string; value: string };
    apiEndpoint?: string;
    assignToRole?: string;
    collectField?: string;
    delayMs?: number;
    tag?: string;
    [key: string]: unknown;
  };
  connections: ChatbotNodeConnection[];
}

export interface WaChatbotFlowItem {
  id: string;
  wabaId: string;
  name: string;
  status: WaChatbotFlowStatus;
  triggerKeywords: string[];
  nodes: ChatbotNode[];
  isDefault: boolean;
  triggeredCount: number;
  completedCount: number;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatbotFlowCreateData {
  wabaId: string;
  name: string;
  triggerKeywords: string[];
  nodes: ChatbotNode[];
}

export interface ChatbotFlowUpdateData {
  name?: string;
  triggerKeywords?: string[];
  nodes?: ChatbotNode[];
}

export interface ChatbotFlowListParams {
  wabaId?: string;
  status?: WaChatbotFlowStatus;
}
