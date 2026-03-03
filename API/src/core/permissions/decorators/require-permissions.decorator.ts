import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Declare required permissions on a controller method.
 * Multiple permissions use OR logic — any one match grants access.
 *
 * @example
 *   @RequirePermissions('leads:create')
 *   @RequirePermissions('leads:read', 'leads:export')
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
