import { SetMetadata } from '@nestjs/common';
import { CHECK_LIMIT_KEY } from '../plan-limit.guard';
import { LimitResource } from '../../services/limit-checker.service';

export const CheckLimit = (resource: LimitResource) =>
  SetMetadata(CHECK_LIMIT_KEY, resource);
