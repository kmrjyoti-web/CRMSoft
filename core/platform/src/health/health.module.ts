import { Module } from '@nestjs/common';
import { HealthController, HEALTH_DB_CHECKER } from './health.controller';

export { HEALTH_DB_CHECKER };
export type { HealthDbChecker } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
