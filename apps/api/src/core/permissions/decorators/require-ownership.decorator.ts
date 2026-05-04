import { SetMetadata } from '@nestjs/common';

export const OWNERSHIP_KEY = 'ownership';

/**
 * Require entity ownership for this route.
 * Extracts resourceId from req.params[paramName].
 *
 * @example
 *   @RequireOwnership('lead', 'id')
 *   @RequireOwnership('contact', 'contactId')
 */
export const RequireOwnership = (resourceType: string, paramName: string = 'id') =>
  SetMetadata(OWNERSHIP_KEY, { resourceType, paramName });
