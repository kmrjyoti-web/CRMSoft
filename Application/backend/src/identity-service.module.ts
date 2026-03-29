/**
 * IDENTITY SERVICE MODULE — TEST ONLY
 *
 * This file is NOT used in production. It proves that the Identity service
 * boundary can boot independently (DI graph resolves) with no stubs required.
 *
 * Identity boundary contains:
 *   - src/core/auth/**                          (AuthModule)
 *   - src/core/permissions/**                   (PermissionsCoreModule)
 *   - src/modules/core/identity/tenant/**       (TenantModule)
 *   - src/modules/core/identity/menus/**        (MenusModule)
 *   - src/modules/core/identity/audit/**        (AuditModule)
 *   - src/modules/core/identity/settings/**     (SettingsModule)
 *   - src/modules/core/identity/entity-filters  (EntityFiltersModule)
 *
 * Cross-service deps:
 *   - PlatformBootstrapService imports BUSINESS_TYPE_SEED_DATA from softwarevendor
 *     (static constant — NOT a provider, no stub needed, will become shared-lib constant)
 *
 * This service has the lowest cross-service coupling and should be extracted FIRST.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

// ─── Prisma ──────────────────────────────────────────────────────────────────
import { PrismaModule } from './core/prisma/prisma.module';

// ─── Common/shared (will become shared-lib at extraction) ─────────────────────
import { ErrorsModule } from './common/errors/errors.module';

// ─── Identity boundary ────────────────────────────────────────────────────────
import { AuthModule } from './core/auth/auth.module';
import { PermissionsCoreModule } from './core/permissions/permissions-core.module';
import { TenantModule } from './modules/core/identity/tenant/tenant.module';
import { MenusModule } from './modules/core/identity/menus/menus.module';
import { AuditModule } from './modules/core/identity/audit/audit.module';
import { SettingsModule } from './modules/core/identity/settings/settings.module';
import { EntityFiltersModule } from './modules/core/identity/entity-filters/entity-filters.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule.forRoot(),
    PrismaModule,

    // ── Common shared module (shared-lib at extraction time) ──────────────────
    ErrorsModule,

    // ── Identity boundary (all 7 modules — zero external stubs needed) ────────
    AuthModule,
    PermissionsCoreModule,
    TenantModule,
    MenusModule,
    AuditModule,
    SettingsModule,
    EntityFiltersModule,
  ],
})
export class IdentityServiceModule {}
