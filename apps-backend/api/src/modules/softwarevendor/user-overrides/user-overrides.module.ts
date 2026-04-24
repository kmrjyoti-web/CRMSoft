import { Module } from '@nestjs/common';
import { UserOverridesController } from './presentation/user-overrides.controller';

@Module({
  controllers: [UserOverridesController],
})
export class UserOverridesModule {}
