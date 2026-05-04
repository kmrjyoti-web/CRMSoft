import { SetMetadata } from '@nestjs/common';

export const APPROVAL_KEY = 'approval';

/**
 * Mark a route as requiring maker-checker approval.
 * The guard will check if approval rules apply and attach approval info to the request.
 *
 * @example
 *   @RequireApproval('lead', 'status_change_WON')
 *   @RequireApproval('quotation', 'approve')
 */
export const RequireApproval = (entityType: string, action: string) =>
  SetMetadata(APPROVAL_KEY, { entityType, action });
