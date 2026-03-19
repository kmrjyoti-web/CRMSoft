// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { getErrorMessage } from '@/common/utils/error.utils';

export interface MaskingRule {
  columnId: string;
  maskType: 'FULL' | 'PARTIAL';
  canUnmask: boolean;
}

@Injectable()
export class DataMaskingService {
  private readonly logger = new Logger(DataMaskingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get effective masking rules for a user on a specific table.
   * Resolution: user-specific → role-specific → global (no role/user).
   */
  async getMaskingRules(
    tableKey: string,
    userId: string,
    roleId: string,
    tenantId: string,
  ): Promise<MaskingRule[]> {
    // Build OR conditions — only include roleId condition if roleId is defined
    const orConditions: any[] = [
      { userId, roleId: null },           // user-specific
      { roleId: null, userId: null },     // global (applies to everyone)
    ];
    if (roleId) {
      orConditions.splice(1, 0, { roleId, userId: null }); // role-specific (insert before global)
    }

    const policies = await this.prisma.working.dataMaskingPolicy.findMany({
      where: {
        tenantId,
        tableKey,
        isActive: true,
        OR: orConditions,
      },
      orderBy: { createdAt: 'desc' },
    });

    this.logger.debug(
      `getMaskingRules: table=${tableKey}, userId=${userId}, roleId=${roleId}, ` +
      `tenantId=${tenantId}, found ${policies.length} policies`,
    );

    // Deduplicate: user-specific > role-specific > global
    const ruleMap = new Map<string, MaskingRule>();
    // Process global first, then role, then user (last wins)
    const sorted = policies.sort((a, b) => {
      const priority = (p: typeof a) =>
        p.userId ? 3 : p.roleId ? 2 : 1;
      return priority(a) - priority(b);
    });

    for (const p of sorted) {
      if (p.maskType === 'NONE') {
        ruleMap.delete(p.columnId);
      } else {
        ruleMap.set(p.columnId, {
          columnId: p.columnId,
          maskType: p.maskType as MaskingRule['maskType'],
          canUnmask: p.canUnmask,
        });
      }
    }

    const rules = Array.from(ruleMap.values());
    if (rules.length > 0) {
      this.logger.log(
        `Masking rules for ${tableKey}: ${rules.map(r => `${r.columnId}(${r.maskType})`).join(', ')}`,
      );
    }

    return rules;
  }

  /**
   * Apply masking to a list of records.
   */
  applyMasking(
    records: Record<string, any>[],
    rules: MaskingRule[],
  ): Record<string, any>[] {
    if (rules.length === 0) return records;

    return records.map((record) => {
      const masked = { ...record };
      const maskingMeta: Record<string, { masked: boolean; canUnmask: boolean }> = {};

      for (const rule of rules) {
        const value = record[rule.columnId];
        if (value == null) continue;

        maskingMeta[rule.columnId] = {
          masked: true,
          canUnmask: rule.canUnmask,
        };

        masked[rule.columnId] = this.maskValue(String(value), rule.maskType);
      }

      if (Object.keys(maskingMeta).length > 0) {
        masked._maskingMeta = maskingMeta;
      }

      return masked;
    });
  }

  /**
   * Mask a string value based on mask type.
   * FULL: replaces entire value with ****
   * PARTIAL: shows start + end characters with **** in the middle
   *   - Email: j***n@gmail.com (first + last char of local part + full domain)
   *   - Phone: 98****7890 (first 2 + last 4 digits)
   *   - Other: first 2 + last 2 chars with **** in between
   */
  private maskValue(value: string, maskType: 'FULL' | 'PARTIAL'): string {
    if (maskType === 'FULL') {
      return '****';
    }

    // PARTIAL masking — show start + end
    if (value.includes('@')) {
      // Email: show first + last char of local part + full domain
      const [local, domain] = value.split('@');
      if (local.length <= 2) {
        return `${local[0]}***@${domain}`;
      }
      return `${local[0]}${'*'.repeat(Math.min(local.length - 2, 4))}${local[local.length - 1]}@${domain}`;
    }

    // Phone: show first 2 + last 4 digits
    if (value.length >= 8) {
      const maskedLen = Math.min(value.length - 6, 6);
      return value.slice(0, 2) + '*'.repeat(maskedLen) + value.slice(-4);
    }

    // Short phone (4-7 chars): show first 1 + last 2
    if (value.length >= 4) {
      return value[0] + '***' + value.slice(-2);
    }

    return '****';
  }

  /**
   * Get the unmasked value for a specific record + column.
   * Handles both direct fields and communication-based fields (email, phone).
   */
  async getUnmaskedValue(
    tableKey: string,
    columnId: string,
    recordId: string,
    userId: string,
    tenantId: string,
  ): Promise<string | null> {
    // Map table keys to Prisma model names
    const modelMap: Record<string, string> = {
      contacts: 'contact',
      organizations: 'organization',
      leads: 'lead',
      activities: 'activity',
      'raw-contacts': 'rawContact',
      users: 'user',
    };

    // Communication-based fields: email/phone are in the communications relation
    const commFieldMap: Record<string, 'EMAIL' | 'MOBILE' | 'PHONE'> = {
      email: 'EMAIL',
      phone: 'MOBILE',
    };

    const model = modelMap[tableKey];
    if (!model) return null;

    // Log the unmask action
    await this.prisma.working.unmaskAuditLog.create({
      data: { tenantId, userId, tableKey, columnId, recordId },
    });

    // Check if this is a communication-based field
    const commType = commFieldMap[columnId];
    const commTables = ['contacts', 'raw-contacts', 'organizations'];
    if (commType && commTables.includes(tableKey)) {
      // Build the FK filter based on table
      const fkField =
        tableKey === 'contacts' ? 'contactId'
          : tableKey === 'raw-contacts' ? 'rawContactId'
            : 'organizationId';

      const comm = await this.prisma.working.communication.findFirst({
        where: {
          [fkField]: recordId,
          type: commType,
        },
        orderBy: { isPrimary: 'desc' },
        select: { value: true },
      });
      return comm?.value ?? null;
    }

    // Direct field on the model
    try {
      const record = await (this.prisma as any)[model].findUnique({
        where: { id: recordId },
        select: { [columnId]: true },
      });
      return record?.[columnId] ?? null;
    } catch (err) {
      this.logger.warn(`Failed to unmask ${tableKey}.${columnId}: ${getErrorMessage(err)}`);
      return null;
    }
  }

  // ── Admin CRUD for policies ──────────────────────────────

  async listPolicies(tenantId: string, tableKey?: string) {
    const where: any = { tenantId };
    if (tableKey) where.tableKey = tableKey;

    return this.prisma.working.dataMaskingPolicy.findMany({
      where,
      include: { role: { select: { id: true, displayName: true } } },
      orderBy: [{ tableKey: 'asc' }, { columnId: 'asc' }],
    });
  }

  async createPolicy(tenantId: string, data: {
    tableKey: string;
    columnId: string;
    roleId?: string;
    userId?: string;
    maskType: string;
    canUnmask?: boolean;
  }) {
    return this.prisma.working.dataMaskingPolicy.create({
      data: {
        tenantId,
        tableKey: data.tableKey,
        columnId: data.columnId,
        roleId: data.roleId ?? null,
        userId: data.userId ?? null,
        maskType: data.maskType,
        canUnmask: data.canUnmask ?? false,
      },
    });
  }

  async updatePolicy(id: string, data: {
    maskType?: string;
    canUnmask?: boolean;
    isActive?: boolean;
  }) {
    return this.prisma.working.dataMaskingPolicy.update({
      where: { id },
      data,
    });
  }

  async deletePolicy(id: string) {
    await this.prisma.working.dataMaskingPolicy.delete({ where: { id } });
    return { deleted: true };
  }
}
