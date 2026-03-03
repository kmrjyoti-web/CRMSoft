import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EncryptionService } from './services/encryption.service';
import { CredentialSchemaService } from './services/credential-schema.service';
import { TenantConfigService } from './services/tenant-config.service';
import { ConfigSeederService } from './services/config-seeder.service';
import { CredentialService } from './services/credential.service';
import { CredentialVerifierService } from './services/credential-verifier.service';
import { TokenRefresherService } from './services/token-refresher.service';
import { ConfigController } from './presentation/config.controller';
import { CredentialController } from './presentation/credential.controller';
import { CredentialAdminController } from './presentation/credential-admin.controller';

@Module({
  imports: [ScheduleModule],
  controllers: [ConfigController, CredentialController, CredentialAdminController],
  providers: [
    EncryptionService,
    CredentialSchemaService,
    TenantConfigService,
    ConfigSeederService,
    CredentialService,
    CredentialVerifierService,
    TokenRefresherService,
  ],
  exports: [TenantConfigService, CredentialService, EncryptionService],
})
export class TenantConfigModule {}
