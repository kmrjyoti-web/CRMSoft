import type {
  WaConversationStatus,
  WaMessageDirection,
  WaMessageType,
  WaMessageStatus,
} from './whatsapp.types';

export interface WaConversationItem {
  id: string;
  wabaId: string;
  contactPhone: string;
  contactName?: string | null;
  contactPushName?: string | null;
  linkedEntityType?: string | null;
  linkedEntityId?: string | null;
  status: WaConversationStatus;
  assignedToId?: string | null;
  assignedTo?: { id: string; firstName: string; lastName: string } | null;
  windowExpiresAt?: string | null;
  isWindowOpen: boolean;
  lastMessageAt?: string | null;
  lastMessageSnippet?: string | null;
  lastMessageDirection?: WaMessageDirection | null;
  unreadCount: number;
  messageCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WaMessageItem {
  id: string;
  wabaId: string;
  conversationId: string;
  waMessageId?: string | null;
  direction: WaMessageDirection;
  messageType: WaMessageType;
  status: WaMessageStatus;
  textBody?: string | null;
  mediaUrl?: string | null;
  mediaId?: string | null;
  mediaMimeType?: string | null;
  mediaCaption?: string | null;
  mediaFileName?: string | null;
  templateId?: string | null;
  templateName?: string | null;
  templateVariables?: Record<string, string> | null;
  interactiveType?: string | null;
  interactiveData?: unknown;
  buttonReplyId?: string | null;
  buttonReplyTitle?: string | null;
  listReplyId?: string | null;
  listReplyTitle?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
  locationAddress?: string | null;
  reactionEmoji?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  failedAt?: string | null;
  failureReason?: string | null;
  isForwarded?: boolean;
  isChatbotReply?: boolean;
  createdAt: string;
}

export interface ConversationListParams {
  wabaId?: string;
  page?: number;
  limit?: number;
  status?: WaConversationStatus;
  assignedToId?: string;
  search?: string;
}

export interface MessageListParams {
  page?: number;
  limit?: number;
}

export interface SendTextPayload {
  wabaId: string;
  text: string;
}

export interface SendTemplatePayload {
  wabaId: string;
  templateId: string;
  variables?: Record<string, string>;
}

export interface SendMediaPayload {
  wabaId: string;
  type: 'image' | 'video' | 'audio' | 'document';
  mediaUrl: string;
  caption?: string;
}

export interface SendInteractivePayload {
  wabaId: string;
  interactiveType: string;
  interactiveData: unknown;
}

export interface SendLocationPayload {
  wabaId: string;
  lat: number;
  lng: number;
  name?: string;
  address?: string;
}

export interface AssignConversationPayload {
  assignToUserId: string;
}

export interface LinkEntityPayload {
  entityType: 'contact' | 'lead' | 'organization';
  entityId: string;
}
