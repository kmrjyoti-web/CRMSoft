import { SetMetadata } from '@nestjs/common';
import { REQUIRE_MODULE_KEY } from '../module-access.guard';

export const RequireModule = (moduleCode: string) =>
  SetMetadata(REQUIRE_MODULE_KEY, moduleCode);
