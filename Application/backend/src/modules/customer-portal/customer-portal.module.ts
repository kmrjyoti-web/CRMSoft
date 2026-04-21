import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PluginsModule } from '../plugins/plugins.module';

// ─── Presentation ───
import { CustomerAuthController } from './presentation/customer-auth.controller';
import { CustomerPortalAdminController } from './presentation/customer-portal-admin.controller';

// ─── Infrastructure ───
import { CustomerAuthGuard } from './infrastructure/guards/customer-auth.guard';
import { PrismaCustomerUserRepository } from './infrastructure/repositories/prisma-customer-user.repository';
import { CUSTOMER_USER_REPOSITORY } from './domain/interfaces/customer-user.repository.interface';

// ─── Command Handlers ───
import { CustomerLoginHandler } from './application/commands/customer-login/customer-login.handler';
import { RefreshCustomerTokenHandler } from './application/commands/refresh-customer-token/refresh-customer-token.handler';
import { ForgotCustomerPasswordHandler } from './application/commands/forgot-customer-password/forgot-customer-password.handler';
import { ResetCustomerPasswordHandler } from './application/commands/reset-customer-password/reset-customer-password.handler';
import { ChangeCustomerPasswordHandler } from './application/commands/change-customer-password/change-customer-password.handler';
import { ActivatePortalHandler } from './application/commands/activate-portal/activate-portal.handler';
import { DeactivatePortalHandler } from './application/commands/deactivate-portal/deactivate-portal.handler';
import { UpdatePortalUserHandler } from './application/commands/update-portal-user/update-portal-user.handler';
import { AdminResetCustomerPasswordHandler } from './application/commands/admin-reset-customer-password/admin-reset-customer-password.handler';
import { CreateMenuCategoryHandler } from './application/commands/create-menu-category/create-menu-category.handler';
import { UpdateMenuCategoryHandler } from './application/commands/update-menu-category/update-menu-category.handler';
import { DeleteMenuCategoryHandler } from './application/commands/delete-menu-category/delete-menu-category.handler';
import { RetryCommunicationHandler } from './application/commands/retry-communication/retry-communication.handler';

// ─── Query Handlers ───
import { GetCustomerMenuHandler } from './application/queries/get-customer-menu/get-customer-menu.handler';
import { GetCustomerProfileHandler } from './application/queries/get-customer-profile/get-customer-profile.handler';
import { GetEligibleEntitiesHandler } from './application/queries/get-eligible-entities/get-eligible-entities.handler';
import { ListPortalUsersHandler } from './application/queries/list-portal-users/list-portal-users.handler';
import { GetPortalUserHandler } from './application/queries/get-portal-user/get-portal-user.handler';
import { ListMenuCategoriesHandler } from './application/queries/list-menu-categories/list-menu-categories.handler';
import { GetMenuCategoryHandler } from './application/queries/get-menu-category/get-menu-category.handler';
import { GetPortalAnalyticsHandler } from './application/queries/get-portal-analytics/get-portal-analytics.handler';
import { ListCommunicationLogHandler } from './application/queries/list-communication-log/list-communication-log.handler';

const COMMAND_HANDLERS = [
  CustomerLoginHandler,
  RefreshCustomerTokenHandler,
  ForgotCustomerPasswordHandler,
  ResetCustomerPasswordHandler,
  ChangeCustomerPasswordHandler,
  ActivatePortalHandler,
  DeactivatePortalHandler,
  UpdatePortalUserHandler,
  AdminResetCustomerPasswordHandler,
  CreateMenuCategoryHandler,
  UpdateMenuCategoryHandler,
  DeleteMenuCategoryHandler,
  RetryCommunicationHandler,
];

const QUERY_HANDLERS = [
  GetCustomerMenuHandler,
  GetCustomerProfileHandler,
  GetEligibleEntitiesHandler,
  ListPortalUsersHandler,
  GetPortalUserHandler,
  ListMenuCategoriesHandler,
  GetMenuCategoryHandler,
  GetPortalAnalyticsHandler,
  ListCommunicationLogHandler,
];

@Module({
  imports: [
    CqrsModule,
    PluginsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '24h') },
      }),
    }),
  ],
  controllers: [CustomerAuthController, CustomerPortalAdminController],
  providers: [
    // Repository binding
    { provide: CUSTOMER_USER_REPOSITORY, useClass: PrismaCustomerUserRepository },

    // Guard
    CustomerAuthGuard,

    // Handlers
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
  ],
  exports: [CUSTOMER_USER_REPOSITORY],
})
export class CustomerPortalModule {}
