import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

export interface PatchField {
  field: string;
  oldValue: any;
  newValue: any;
  action: 'ADD' | 'UPDATE' | 'NO_CHANGE';
  recommendation: string;
}

export interface PatchPreview {
  entityId: string;
  entityLabel: string;
  fields: PatchField[];
  hasChanges: boolean;
  summary: string;
}

@Injectable()
export class PatchGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  /** Generate patch preview comparing import data vs existing entity */
  async generatePatch(
    entityId: string,
    mappedData: Record<string, any>,
    targetEntity: string,
  ): Promise<PatchPreview> {
    const existing = await this.loadEntity(entityId, targetEntity);
    if (!existing) {
      return {
        entityId,
        entityLabel: 'Unknown',
        fields: [],
        hasChanges: false,
        summary: 'Entity not found',
      };
    }

    const entityLabel = this.getLabel(existing, targetEntity);
    const fields: PatchField[] = [];

    // Compare flat fields
    for (const [key, newVal] of Object.entries(mappedData)) {
      if (key === 'organization' || typeof newVal === 'object') continue;
      if (!newVal || newVal === '') continue; // empty doesn't overwrite

      const oldVal = (existing as any)[key];
      if (oldVal === undefined) continue; // field doesn't exist on entity

      const oldStr = oldVal != null ? String(oldVal) : '';
      const newStr = String(newVal);

      if (!oldStr && newStr) {
        fields.push({ field: key, oldValue: null, newValue: newStr, action: 'ADD', recommendation: `Will add ${key}` });
      } else if (oldStr && oldStr.toLowerCase() !== newStr.toLowerCase()) {
        fields.push({ field: key, oldValue: oldStr, newValue: newStr, action: 'UPDATE', recommendation: `Will update ${key} from "${oldStr}" to "${newStr}"` });
      } else {
        fields.push({ field: key, oldValue: oldStr, newValue: newStr, action: 'NO_CHANGE', recommendation: 'No change' });
      }
    }

    const changes = fields.filter(f => f.action !== 'NO_CHANGE');
    const addCount = changes.filter(f => f.action === 'ADD').length;
    const updateCount = changes.filter(f => f.action === 'UPDATE').length;

    let summary = 'No changes detected';
    if (changes.length > 0) {
      const parts: string[] = [];
      if (addCount) parts.push(`${addCount} field(s) to add`);
      if (updateCount) parts.push(`${updateCount} field(s) to update`);
      summary = parts.join(', ');
    }

    return { entityId, entityLabel, fields, hasChanges: changes.length > 0, summary };
  }

  /** Generate patches for all duplicate rows with entityIds */
  async generatePatchesForRows(
    rows: { rowNumber: number; mappedData: Record<string, any>; entityId: string }[],
    targetEntity: string,
  ): Promise<Map<number, PatchPreview>> {
    const patches = new Map<number, PatchPreview>();
    for (const row of rows) {
      const patch = await this.generatePatch(row.entityId, row.mappedData, targetEntity);
      patches.set(row.rowNumber, patch);
    }
    return patches;
  }

  /** Load entity by ID */
  private async loadEntity(entityId: string, targetEntity: string): Promise<any> {
    try {
      switch (targetEntity) {
        case 'CONTACT':
          return this.prisma.contact.findUnique({ where: { id: entityId } });
        case 'ORGANIZATION':
          return this.prisma.organization.findUnique({ where: { id: entityId } });
        case 'LEAD':
          return this.prisma.lead.findUnique({ where: { id: entityId } });
        default:
          return null;
      }
    } catch {
      return null;
    }
  }

  /** Get human-readable label */
  private getLabel(entity: any, targetEntity: string): string {
    switch (targetEntity) {
      case 'CONTACT': return `${entity.firstName || ''} ${entity.lastName || ''}`.trim();
      case 'ORGANIZATION': return entity.name || '';
      case 'LEAD': return entity.leadNumber || '';
      default: return entity.id || '';
    }
  }
}
