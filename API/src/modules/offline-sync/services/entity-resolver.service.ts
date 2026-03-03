import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

export interface EntityConfig {
  /** Prisma model delegate name (e.g., 'lead', 'contact') */
  delegateName: string;
  /** Field that indicates the owner/assignee (for OWNED scope) */
  ownerFields: string[];
  /** Field used for soft-delete detection (null = never deleted) */
  softDeleteField: string | null;
  /** Terminal status values that indicate "deleted" records */
  terminalStatuses: string[];
  /** Include relations for sync download (lightweight) */
  syncInclude: Record<string, boolean> | null;
  /** Fields to exclude from sync (sensitive data) */
  excludeFields: string[];
}

const ENTITY_CONFIG_MAP: Record<string, EntityConfig> = {
  Contact: {
    delegateName: 'contact',
    ownerFields: ['createdById'],
    softDeleteField: 'isActive',
    terminalStatuses: [],
    syncInclude: { communications: true },
    excludeFields: [],
  },
  Organization: {
    delegateName: 'organization',
    ownerFields: ['createdById'],
    softDeleteField: 'isActive',
    terminalStatuses: [],
    syncInclude: null,
    excludeFields: [],
  },
  Lead: {
    delegateName: 'lead',
    ownerFields: ['allocatedToId', 'createdById'],
    softDeleteField: null,
    terminalStatuses: ['LOST', 'ON_HOLD'],
    syncInclude: { contact: true, organization: true, filters: true },
    excludeFields: [],
  },
  Activity: {
    delegateName: 'activity',
    ownerFields: ['createdById'],
    softDeleteField: null,
    terminalStatuses: [],
    syncInclude: null,
    excludeFields: [],
  },
  Demo: {
    delegateName: 'demo',
    ownerFields: ['conductedById'],
    softDeleteField: null,
    terminalStatuses: ['CANCELLED', 'NO_SHOW'],
    syncInclude: null,
    excludeFields: [],
  },
  TourPlan: {
    delegateName: 'tourPlan',
    ownerFields: ['salesPersonId'],
    softDeleteField: null,
    terminalStatuses: ['CANCELLED'],
    syncInclude: { visits: true },
    excludeFields: [],
  },
  TourPlanVisit: {
    delegateName: 'tourPlanVisit',
    ownerFields: [],
    softDeleteField: null,
    terminalStatuses: [],
    syncInclude: null,
    excludeFields: [],
  },
  Quotation: {
    delegateName: 'quotation',
    ownerFields: ['createdById'],
    softDeleteField: null,
    terminalStatuses: ['CANCELLED', 'EXPIRED', 'REJECTED'],
    syncInclude: { lineItems: true },
    excludeFields: [],
  },
  LookupValue: {
    delegateName: 'lookupValue',
    ownerFields: [],
    softDeleteField: 'isActive',
    terminalStatuses: [],
    syncInclude: { lookup: true },
    excludeFields: [],
  },
  MasterLookup: {
    delegateName: 'masterLookup',
    ownerFields: [],
    softDeleteField: 'isActive',
    terminalStatuses: [],
    syncInclude: null,
    excludeFields: [],
  },
  User: {
    delegateName: 'user',
    ownerFields: [],
    softDeleteField: null,
    terminalStatuses: [],
    syncInclude: null,
    excludeFields: ['password'],
  },
  Role: {
    delegateName: 'role',
    ownerFields: [],
    softDeleteField: null,
    terminalStatuses: [],
    syncInclude: null,
    excludeFields: [],
  },
  Product: {
    delegateName: 'product',
    ownerFields: ['createdById'],
    softDeleteField: 'isActive',
    terminalStatuses: [],
    syncInclude: null,
    excludeFields: [],
  },
};

@Injectable()
export class EntityResolverService {
  constructor(private readonly prisma: PrismaService) {}

  /** Get entity configuration by name. Throws if entity is not supported. */
  getEntityConfig(entityName: string): EntityConfig {
    const config = ENTITY_CONFIG_MAP[entityName];
    if (!config) {
      throw new BadRequestException(
        `Unknown sync entity: "${entityName}". Supported: ${Object.keys(ENTITY_CONFIG_MAP).join(', ')}`,
      );
    }
    return config;
  }

  /** Get the Prisma delegate for a given entity name. */
  getDelegate(entityName: string): any {
    const config = this.getEntityConfig(entityName);
    return (this.prisma as any)[config.delegateName];
  }

  /** Get all supported entity names. */
  getSupportedEntities(): string[] {
    return Object.keys(ENTITY_CONFIG_MAP);
  }

  /** Check if an entity name is supported. */
  isSupported(entityName: string): boolean {
    return entityName in ENTITY_CONFIG_MAP;
  }
}
