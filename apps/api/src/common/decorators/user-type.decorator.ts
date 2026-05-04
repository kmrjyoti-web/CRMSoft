import { SetMetadata } from '@nestjs/common';
import { USER_TYPES_KEY } from '../guards/user-type.guard';

/**
 * Restrict endpoint to specific user types.
 *
 * @example
 * @UserTypes('ADMIN', 'EMPLOYEE')
 * @UserTypes('CUSTOMER')
 * @UserTypes('REFERRAL_PARTNER')
 */
export const UserTypes = (...types: string[]) =>
  SetMetadata(USER_TYPES_KEY, types);
