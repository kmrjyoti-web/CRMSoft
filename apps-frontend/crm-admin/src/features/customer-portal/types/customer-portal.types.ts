// Re-export from shared types + add any local-only types
export type {
  CustomerUser,
  CustomerMenuCategory,
  PortalRoute,
  EligibleEntity,
  PortalAnalytics,
  PortalLog,
  ActivatePortalDto,
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  UpdatePortalUserDto,
} from '@shared-types';

export type InviteChannel = 'EMAIL' | 'WHATSAPP';

export interface ActivatePortalWithChannelsDto {
  entityType: 'CONTACT' | 'ORGANIZATION' | 'LEDGER';
  entityId: string;
  menuCategoryId?: string;
  channels?: InviteChannel[];
  customMessage?: string;
}

export interface PortalDeliveryResult {
  channel: string;
  status: string;
  logId?: string;
  error?: string;
}

export interface ActivatePortalWithChannelsResponse {
  customerUserId: string;
  email: string;
  tempPassword: string;
  message: string;
  deliveries: PortalDeliveryResult[];
}
