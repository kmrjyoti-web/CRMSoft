import { SetMetadata } from '@nestjs/common';
import { REQUIRE_FEATURE_KEY } from '../feature-flag.guard';

export const RequireFeature = (feature: string) =>
  SetMetadata(REQUIRE_FEATURE_KEY, feature);
