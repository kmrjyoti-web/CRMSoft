import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrismaModule } from '../../core/prisma/prisma.module';

// Services
import { AutoNumberService } from './services/auto-number.service';
import { BusinessHoursService } from './services/business-hours.service';
import { HolidayService } from './services/holiday.service';
import { BrandingService } from './services/branding.service';
import { DomainVerifierService } from './services/domain-verifier.service';
import { NotificationPrefService } from './services/notification-pref.service';
import { CompanyProfileService } from './services/company-profile.service';
import { SecurityPolicyService } from './services/security-policy.service';
import { DataRetentionService } from './services/data-retention.service';
import { EmailFooterService } from './services/email-footer.service';
import { SettingsSeederService } from './services/settings-seeder.service';
import { NotionSyncService } from './services/notion-sync.service';

// Controllers
import { BrandingController } from './presentation/branding.controller';
import { BusinessHoursController } from './presentation/business-hours.controller';
import { HolidayController } from './presentation/holiday.controller';
import { AutoNumberController } from './presentation/auto-number.controller';
import { CompanyProfileController } from './presentation/company-profile.controller';
import { NotificationPrefController } from './presentation/notification-pref.controller';
import { SecurityPolicyController } from './presentation/security-policy.controller';
import { DataRetentionController } from './presentation/data-retention.controller';
import { EmailFooterController } from './presentation/email-footer.controller';
import { NotionController } from './presentation/notion.controller';
import { UsersController } from './presentation/users.controller';
import { RolesController } from './presentation/roles.controller';
import { PermissionsController } from './presentation/permissions.controller';

// User Command Handlers
import { SoftDeleteUserHandler } from './application/commands/soft-delete-user/soft-delete-user.handler';
import { RestoreUserHandler } from './application/commands/restore-user/restore-user.handler';
import { PermanentDeleteUserHandler } from './application/commands/permanent-delete-user/permanent-delete-user.handler';

const SERVICES = [
  AutoNumberService,
  BusinessHoursService,
  HolidayService,
  BrandingService,
  DomainVerifierService,
  NotificationPrefService,
  CompanyProfileService,
  SecurityPolicyService,
  DataRetentionService,
  EmailFooterService,
  SettingsSeederService,
  NotionSyncService,
];

const UserCommandHandlers = [
  SoftDeleteUserHandler,
  RestoreUserHandler,
  PermanentDeleteUserHandler,
];

const CONTROLLERS = [
  BrandingController,
  BusinessHoursController,
  HolidayController,
  AutoNumberController,
  CompanyProfileController,
  NotificationPrefController,
  SecurityPolicyController,
  DataRetentionController,
  EmailFooterController,
  NotionController,
  UsersController,
  RolesController,
  PermissionsController,
];

@Module({
  imports: [
    CqrsModule,
    PrismaModule,
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: CONTROLLERS,
  providers: [...SERVICES, ...UserCommandHandlers],
  exports: [
    AutoNumberService,
    BusinessHoursService,
    HolidayService,
    NotificationPrefService,
    SecurityPolicyService,
    SettingsSeederService,
    BrandingService,
    CompanyProfileService,
  ],
})
export class SettingsModule {}
