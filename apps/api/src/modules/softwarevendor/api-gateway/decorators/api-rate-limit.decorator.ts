import { SetMetadata } from '@nestjs/common';

export const API_RATE_LIMIT_KEY = 'api_rate_limit';
export const ApiRateLimit = (limit: number, window: 'SECOND' | 'MINUTE' | 'HOUR' | 'DAY') =>
  SetMetadata(API_RATE_LIMIT_KEY, { limit, window });
