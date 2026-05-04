import { Module } from '@nestjs/common';
import { WhatsAppModule } from '../../customer/whatsapp/whatsapp.module';
import { EntityVerificationService } from './services/entity-verification.service';
import { EntityVerificationController } from './presentation/entity-verification.controller';
import { PublicEntityVerificationController } from './presentation/public-entity-verification.controller';

@Module({
  imports: [WhatsAppModule],
  controllers: [EntityVerificationController, PublicEntityVerificationController],
  providers: [EntityVerificationService],
  exports: [EntityVerificationService],
})
export class EntityVerificationModule {}
