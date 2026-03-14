import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MENU_SEED_DATA } from '../../modules/menus/presentation/menu-seed-data';
import { BUSINESS_TYPE_SEED_DATA } from '../../modules/business-type/services/business-type-seed-data';

@Injectable()
export class PlatformBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(PlatformBootstrapService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.ensureSuperAdmin();
    await this.ensureDemoVendor();
    // Run heavy tasks in background so they don't block app startup
    this.runBackgroundTasks();
  }

  private runBackgroundTasks() {
    Promise.all([
      this.ensureMissingPermissions().catch((e) =>
        this.logger.error('ensureMissingPermissions failed', e),
      ),
      this.ensureTenantMenus().catch((e) =>
        this.logger.error('ensureTenantMenus failed', e),
      ),
      this.ensureBusinessTypes().catch((e) =>
        this.logger.error('ensureBusinessTypes failed', e),
      ),
    ]).then(() => this.logger.log('Background bootstrap tasks completed'));
  }

  /** Create a platform SuperAdmin if none exists. */
  private async ensureSuperAdmin() {
    const existing = await this.prisma.superAdmin.findFirst();
    if (existing) {
      this.logger.log('Platform Admin already exists — skipping bootstrap');
      return;
    }

    const email = 'platform@crm.com';
    const password = 'PlatformAdmin@123';
    const hashed = await bcrypt.hash(password, 12);

    await this.prisma.superAdmin.create({
      data: {
        email,
        password: hashed,
        firstName: 'Platform',
        lastName: 'Admin',
      },
    });

    this.logger.warn('================================================');
    this.logger.warn('  PLATFORM ADMIN AUTO-PROVISIONED');
    this.logger.warn(`  Email:    ${email}`);
    this.logger.warn(`  Password: ${password}`);
    this.logger.warn('  Change this password after first login!');
    this.logger.warn('================================================');
  }

  /** Create a demo MarketplaceVendor if none exists, so vendor portal login works. */
  private async ensureDemoVendor() {
    const existing = await this.prisma.marketplaceVendor.findFirst();
    if (existing) {
      // If vendor exists but has no password, set one
      if (!existing.password) {
        const password = 'Vendor@123';
        const hashed = await bcrypt.hash(password, 12);
        await this.prisma.marketplaceVendor.update({
          where: { id: existing.id },
          data: { password: hashed, status: 'APPROVED' },
        });
        this.logger.warn('================================================');
        this.logger.warn('  VENDOR PASSWORD SET');
        this.logger.warn(`  Email:    ${existing.contactEmail}`);
        this.logger.warn(`  Password: ${password}`);
        this.logger.warn('================================================');
      }
      return;
    }

    const email = 'vendor@demo.com';
    const password = 'Vendor@123';
    const hashed = await bcrypt.hash(password, 12);

    await this.prisma.marketplaceVendor.create({
      data: {
        companyName: 'Demo Vendor Co.',
        contactName: 'Demo Vendor',
        contactEmail: email,
        password: hashed,
        status: 'APPROVED',
      },
    });

    this.logger.warn('================================================');
    this.logger.warn('  DEMO VENDOR AUTO-PROVISIONED');
    this.logger.warn(`  Email:    ${email}`);
    this.logger.warn(`  Password: ${password}`);
    this.logger.warn('  Change this password after first login!');
    this.logger.warn('================================================');
  }

  /**
   * Ensure permissions for modules added after initial seed (audit, settings, wallet).
   * For each missing permission, create it and assign to all ADMIN roles across tenants.
   */
  private async ensureMissingPermissions() {
    const missingModules = ['audit', 'settings', 'wallet', 'raw_contacts', 'inventory'];
    const actions = ['create', 'read', 'update', 'delete', 'export'];

    const created: string[] = [];
    for (const mod of missingModules) {
      for (const action of actions) {
        const perm = await this.prisma.permission.upsert({
          where: { module_action: { module: mod, action } },
          update: {},
          create: { module: mod, action, description: `${action} ${mod}` },
        });

        // Assign to every ADMIN role across all tenants (upsert = safe re-run)
        const adminRoles = await this.prisma.role.findMany({
          where: { name: { in: ['ADMIN', 'SUPER_ADMIN'] } },
          select: { id: true, tenantId: true },
        });

        for (const role of adminRoles) {
          if (!role.tenantId) continue;
          await this.prisma.rolePermission.upsert({
            where: {
              tenantId_roleId_permissionId: {
                tenantId: role.tenantId,
                roleId: role.id,
                permissionId: perm.id,
              },
            },
            update: {},
            create: { tenantId: role.tenantId, roleId: role.id, permissionId: perm.id },
          });
        }
        created.push(`${mod}:${action}`);
      }
    }
    this.logger.log(`Permissions ensured: ${missingModules.join(', ')} (${created.length} entries)`);
  }

  /** Re-seed menus for any tenant that has fewer than expected menus or stale permissionAction values. */
  private async ensureTenantMenus() {
    // Step 0: Clean up orphaned menus with empty tenantId (from older seed runs)
    const orphanedCount = await this.prisma.menu.count({ where: { tenantId: '' } });
    if (orphanedCount > 0) {
      await this.prisma.menu.deleteMany({ where: { tenantId: '', parentId: { not: null } } });
      await this.prisma.menu.deleteMany({ where: { tenantId: '' } });
      this.logger.warn(`Cleaned up ${orphanedCount} orphaned menus (empty tenantId)`);
    }

    const expectedCount = this.countExpectedMenus();
    const tenants = await this.prisma.tenant.findMany({
      select: { id: true, name: true, slug: true },
    });

    for (const tenant of tenants) {
      // Step 1: Deduplicate — remove duplicate menus with same code for this tenant
      await this.deduplicateMenus(tenant.id);

      const menuCount = await this.prisma.menu.count({
        where: { tenantId: tenant.id },
      });

      // Check for stale 'view' permissionAction (should be 'read')
      const staleCount = await this.prisma.menu.count({
        where: { tenantId: tenant.id, permissionAction: 'view' },
      });

      if (menuCount < expectedCount || staleCount > 0) {
        const reason = staleCount > 0
          ? `${staleCount} menus with stale permissionAction='view'`
          : `${menuCount}/${expectedCount} menus`;
        this.logger.warn(
          `Tenant "${tenant.name}" needs repair (${reason}) — re-seeding...`,
        );
        await this.repairMenusForTenant(tenant.id);
        const newCount = await this.prisma.menu.count({
          where: { tenantId: tenant.id },
        });
        this.logger.log(
          `Tenant "${tenant.name}" menus repaired: ${newCount} items`,
        );
      }
    }
  }

  /** Remove duplicate menus (same tenantId + code), keeping only the newest one. */
  private async deduplicateMenus(tenantId: string) {
    const allMenus = await this.prisma.menu.findMany({
      where: { tenantId },
      select: { id: true, code: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const seen = new Set<string>();
    const duplicateIds: string[] = [];

    for (const menu of allMenus) {
      if (seen.has(menu.code)) {
        duplicateIds.push(menu.id);
      } else {
        seen.add(menu.code);
      }
    }

    if (duplicateIds.length > 0) {
      // Delete children of duplicates first
      await this.prisma.menu.deleteMany({
        where: { parentId: { in: duplicateIds } },
      });
      await this.prisma.menu.deleteMany({
        where: { id: { in: duplicateIds } },
      });
      this.logger.warn(
        `Tenant ${tenantId}: removed ${duplicateIds.length} duplicate menus`,
      );
    }
  }

  /** Count how many menu items MENU_SEED_DATA produces (parents + children). */
  private countExpectedMenus(): number {
    let count = 0;
    for (const item of MENU_SEED_DATA) {
      count++; // parent
      if (item.children) count += item.children.length;
    }
    return count;
  }

  /** Seed business types if table is empty or missing entries. */
  private async ensureBusinessTypes() {
    const count = await this.prisma.businessTypeRegistry.count();
    if (count >= BUSINESS_TYPE_SEED_DATA.length) {
      this.logger.log(`Business types already seeded (${count} entries)`);
      return;
    }

    for (let i = 0; i < BUSINESS_TYPE_SEED_DATA.length; i++) {
      const bt = BUSINESS_TYPE_SEED_DATA[i];
      await this.prisma.businessTypeRegistry.upsert({
        where: { typeCode: bt.typeCode },
        update: {
          typeName: bt.typeName,
          industryCategory: bt.industryCategory as any,
          description: bt.description,
          icon: bt.icon,
          colorTheme: bt.colorTheme,
          terminologyMap: bt.terminologyMap,
          defaultModules: bt.defaultModules,
          recommendedModules: bt.recommendedModules,
          excludedModules: bt.excludedModules,
          dashboardWidgets: bt.dashboardWidgets,
          workflowTemplates: bt.workflowTemplates,
          extraFields: bt.extraFields ?? {},
          isDefault: bt.isDefault ?? false,
        },
        create: {
          typeCode: bt.typeCode,
          typeName: bt.typeName,
          industryCategory: bt.industryCategory as any,
          description: bt.description,
          icon: bt.icon,
          colorTheme: bt.colorTheme,
          terminologyMap: bt.terminologyMap,
          defaultModules: bt.defaultModules,
          recommendedModules: bt.recommendedModules,
          excludedModules: bt.excludedModules,
          dashboardWidgets: bt.dashboardWidgets,
          workflowTemplates: bt.workflowTemplates,
          extraFields: bt.extraFields ?? {},
          isDefault: bt.isDefault ?? false,
          sortOrder: i,
        },
      });
    }
    this.logger.log(`Business types seeded: ${BUSINESS_TYPE_SEED_DATA.length} industries`);
  }

  /**
   * Delete all menus for a tenant and re-seed from scratch.
   * Using delete+create is simpler and avoids orphaned parent references.
   */
  private async repairMenusForTenant(tenantId: string) {
    // Delete children first (parentId not null), then parents
    await this.prisma.menu.deleteMany({
      where: { tenantId, parentId: { not: null } },
    });
    await this.prisma.menu.deleteMany({ where: { tenantId } });

    // Re-create from seed data
    let sortOrder = 0;
    for (const item of MENU_SEED_DATA) {
      const parent = await this.prisma.menu.create({
        data: {
          tenantId,
          name: item.name,
          code: item.code,
          icon: item.icon ?? null,
          route: item.route ?? null,
          menuType: item.menuType ?? 'ITEM',
          permissionModule: item.permissionModule ?? null,
          permissionAction: item.permissionAction ?? null,
          badgeText: item.badgeText ?? null,
          badgeColor: item.badgeColor ?? null,
          sortOrder: sortOrder++,
        },
      });

      if (item.children) {
        let childOrder = 0;
        for (const child of item.children) {
          await this.prisma.menu.create({
            data: {
              tenantId,
              parentId: parent.id,
              name: child.name,
              code: child.code,
              icon: child.icon ?? null,
              route: child.route ?? null,
              menuType: child.menuType ?? 'ITEM',
              permissionModule: child.permissionModule ?? null,
              permissionAction: child.permissionAction ?? null,
              badgeText: child.badgeText ?? null,
              badgeColor: child.badgeColor ?? null,
              sortOrder: childOrder++,
            },
          });
        }
      }
    }
  }
}
