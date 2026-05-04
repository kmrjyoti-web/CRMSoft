import { SetMetadata } from '@nestjs/common';

export const REQUIRE_VERIFICATION_KEY = 'requireVerification';

/**
 * Decorator to require specific verification level for an endpoint.
 *
 * @example
 * @RequireVerification('enquiry')       // Requires FULLY_VERIFIED
 * @RequireVerification('like')           // Requires PARTIALLY_VERIFIED
 * @RequireVerification('view_b2b_price') // Requires B2B_VERIFIED (Business + GST)
 */
export const RequireVerification = (action: string) =>
  SetMetadata(REQUIRE_VERIFICATION_KEY, action);
