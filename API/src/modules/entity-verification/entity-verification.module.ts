import { Module } from '@nestjs/common';
import { EntityVerificationService } from './services/entity-verification.service';
import { EntityVerificationController } from './presentation/entity-verification.controller';
import { PublicEntityVerificationController } from './presentation/public-entity-verification.controller';

@Module({
  controllers: [EntityVerificationController, PublicEntityVerificationController],
  providers: [EntityVerificationService],
  exports: [EntityVerificationService],
})
export class EntityVerificationModule {}
