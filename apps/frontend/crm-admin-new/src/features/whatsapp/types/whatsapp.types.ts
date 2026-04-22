// ── Shared Enums ────────────────────────────────────────

export type WaConversationStatus = 'OPEN' | 'PENDING' | 'RESOLVED' | 'EXPIRED' | 'SPAM';
export type WaMessageDirection = 'INBOUND' | 'OUTBOUND';
export type WaMessageType =
  | 'TEXT' | 'TEMPLATE' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT'
  | 'STICKER' | 'LOCATION' | 'CONTACT_CARD' | 'INTERACTIVE'
  | 'REACTION' | 'BUTTON_REPLY' | 'LIST_REPLY' | 'ORDER' | 'UNKNOWN';
export type WaMessageStatus = 'PENDING' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
export type WaTemplateStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED' | 'DISABLED' | 'DELETED';
export type WaTemplateCategory = 'UTILITY' | 'AUTHENTICATION' | 'MARKETING';
export type WaBroadcastStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
export type WaBroadcastRecipientStatus = 'PENDING' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'OPTED_OUT';
export type WaChatbotFlowStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';
export type WaChatbotNodeType =
  | 'WELCOME' | 'KEYWORD_TRIGGER' | 'MENU' | 'TEXT_REPLY'
  | 'MEDIA_REPLY' | 'QUICK_BUTTONS' | 'COLLECT_INPUT'
  | 'CONDITION' | 'API_CALL' | 'ASSIGN_AGENT' | 'DELAY'
  | 'TAG_CONTACT' | 'LINK_LEAD';

// ── Quick Reply ─────────────────────────────────────────

export interface WaQuickReplyItem {
  id: string;
  wabaId: string;
  shortcut: string;
  message: string;
  category?: string | null;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
}

export interface WaQuickReplyCreateData {
  wabaId: string;
  shortcut: string;
  message: string;
  category?: string;
}

// ── Opt-out ─────────────────────────────────────────────

export interface WaOptOutItem {
  id: string;
  wabaId: string;
  phoneNumber: string;
  contactId?: string | null;
  reason?: string | null;
  createdAt: string;
}

export interface WaOptOutPayload {
  wabaId: string;
  phoneNumber: string;
  reason?: string;
}

export interface WaOptInPayload {
  wabaId: string;
  phoneNumber: string;
}
