import { SetMetadata } from '@nestjs/common';
import { CHECK_LIMIT_KEY } from '../plan-limit.guard';

export const CheckLimit = (resource: string) =>
  SetMetadata(CHECK_LIMIT_KEY, resource);
