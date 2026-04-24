// Badge variant maps for all WhatsApp entity statuses

export const TEMPLATE_STATUS_BADGE: Record<string, 'success' | 'danger' | 'warning' | 'default' | 'primary'> = {
  APPROVED: 'success',
  REJECTED: 'danger',
  PENDING: 'warning',
  PAUSED: 'warning',
  DISABLED: 'default',
  DELETED: 'danger',
};

export const CONVERSATION_STATUS_BADGE: Record<string, 'success' | 'danger' | 'warning' | 'default' | 'primary'> = {
  OPEN: 'primary',
  PENDING: 'warning',
  RESOLVED: 'success',
  EXPIRED: 'default',
  SPAM: 'danger',
};

export const MESSAGE_STATUS_BADGE: Record<string, 'success' | 'danger' | 'warning' | 'default' | 'primary'> = {
  PENDING: 'default',
  QUEUED: 'default',
  SENT: 'primary',
  DELIVERED: 'primary',
  READ: 'success',
  FAILED: 'danger',
};

export const BROADCAST_STATUS_BADGE: Record<string, 'success' | 'danger' | 'warning' | 'default' | 'primary'> = {
  DRAFT: 'default',
  SCHEDULED: 'warning',
  SENDING: 'primary',
  PAUSED: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  FAILED: 'danger',
};

export const CHATBOT_STATUS_BADGE: Record<string, 'success' | 'danger' | 'warning' | 'default'> = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  DRAFT: 'warning',
};

export const CATEGORY_BADGE: Record<string, 'success' | 'danger' | 'warning' | 'default' | 'primary'> = {
  UTILITY: 'primary',
  AUTHENTICATION: 'warning',
  MARKETING: 'success',
};
