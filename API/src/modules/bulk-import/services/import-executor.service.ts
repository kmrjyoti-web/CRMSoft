import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

export interface ImportRowResult {
  rowNumber: number;
  success: boolean;
  action?: 'CREATED' | 'UPDATED' | 'SKIPPED' | 'FAILED';
  entityId?: string;
  error?: string;
}

@Injectable()
export class ImportExecutorService {
  constructor(private readonly prisma: PrismaService) {}

  /** Execute import for a single row */
  async executeRow(
    row: { rowNumber: number; mappedData: Record<string, any>; userAction?: string; duplicateOfEntityId?: string },
    targetEntity: string,
    createdById: string,
  ): Promise<ImportRowResult> {
    try {
      // Handle user overrides
      if (row.userAction === 'SKIP') {
        return { rowNumber: row.rowNumber, success: true, action: 'SKIPPED' };
      }

      // If duplicate with FORCE_CREATE, create new
      const isUpdate = row.userAction === 'ACCEPT' && row.duplicateOfEntityId;

      if (isUpdate) {
        return await this.updateEntity(row, targetEntity);
      }

      return await this.createEntity(row, targetEntity, createdById);
    } catch (error: any) {
      return {
        rowNumber: row.rowNumber,
        success: false,
        action: 'FAILED',
        error: error.message || 'Unknown error',
      };
    }
  }

  /** Create new entity from mapped data */
  private async createEntity(
    row: { rowNumber: number; mappedData: Record<string, any> },
    targetEntity: string,
    createdById: string,
  ): Promise<ImportRowResult> {
    const data = row.mappedData;

    switch (targetEntity) {
      case 'CONTACT': {
        const contact = await this.createContact(data, createdById);
        return { rowNumber: row.rowNumber, success: true, action: 'CREATED', entityId: contact.id };
      }
      case 'ORGANIZATION': {
        const org = await this.createOrganization(data, createdById);
        return { rowNumber: row.rowNumber, success: true, action: 'CREATED', entityId: org.id };
      }
      default:
        return { rowNumber: row.rowNumber, success: false, action: 'FAILED', error: `Unsupported entity: ${targetEntity}` };
    }
  }

  /** Update existing entity with import data (empty values don't overwrite) */
  private async updateEntity(
    row: { rowNumber: number; mappedData: Record<string, any>; duplicateOfEntityId?: string },
    targetEntity: string,
  ): Promise<ImportRowResult> {
    const entityId = row.duplicateOfEntityId!;
    const data = this.filterEmptyValues(row.mappedData);

    try {
      switch (targetEntity) {
        case 'CONTACT':
          await this.prisma.contact.update({
            where: { id: entityId },
            data: { firstName: data.firstName, lastName: data.lastName, designation: data.designation, notes: data.notes },
          });
          break;
        case 'ORGANIZATION':
          await this.prisma.organization.update({
            where: { id: entityId },
            data: { name: data['organization']?.name || data.name, city: data.city, state: data.state },
          });
          break;
      }
      return { rowNumber: row.rowNumber, success: true, action: 'UPDATED', entityId };
    } catch (error: any) {
      return { rowNumber: row.rowNumber, success: false, action: 'FAILED', error: error.message };
    }
  }

  /** Create RawContact + communications from mapped data */
  private async createContact(data: Record<string, any>, createdById: string) {
    // Create raw contact first
    const rawContact = await this.prisma.rawContact.create({
      data: {
        firstName: data.firstName || 'Unknown',
        lastName: data.lastName || '',
        companyName: data.organization?.name || data.companyName || null,
        designation: data.designation || null,
        notes: data.notes || null,
        source: 'BULK_IMPORT',
        status: 'RAW',
        createdById,
      },
    });

    // Create communications (email, mobile, phone)
    const comms: { type: string; value: string; priorityType: string }[] = [];
    if (data.email) comms.push({ type: 'EMAIL', value: data.email, priorityType: 'PRIMARY' });
    if (data.mobile) comms.push({ type: 'MOBILE', value: data.mobile, priorityType: 'PRIMARY' });
    if (data.phone) comms.push({ type: 'PHONE', value: data.phone, priorityType: 'WORK' });

    if (comms.length > 0) {
      await this.prisma.communication.createMany({
        data: comms.map(c => ({
          type: c.type as any,
          value: c.value,
          priorityType: c.priorityType as any,
          rawContactId: rawContact.id,
        })),
      });
    }

    return rawContact;
  }

  /** Create Organization from mapped data */
  private async createOrganization(data: Record<string, any>, createdById: string) {
    return this.prisma.organization.create({
      data: {
        name: data.organization?.name || data.name || 'Unknown',
        website: data.website || null,
        gstNumber: data.gstNumber || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || 'India',
        pincode: data.pincode || null,
        createdById,
      },
    });
  }

  /** Remove empty/null values from data (empty doesn't overwrite) */
  private filterEmptyValues(data: Record<string, any>): Record<string, any> {
    const filtered: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      if (val !== null && val !== undefined && val !== '') {
        filtered[key] = val;
      }
    }
    return filtered;
  }
}
