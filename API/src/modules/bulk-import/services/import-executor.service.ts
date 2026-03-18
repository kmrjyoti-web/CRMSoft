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
      case 'ROW_CONTACT':
      case 'CONTACT': {
        const contact = await this.createContact(data, createdById);
        return { rowNumber: row.rowNumber, success: true, action: 'CREATED', entityId: contact.id };
      }
      case 'ORGANIZATION': {
        const org = await this.createOrganization(data, createdById);
        return { rowNumber: row.rowNumber, success: true, action: 'CREATED', entityId: org.id };
      }
      case 'LEAD': {
        const lead = await this.createLead(data, createdById);
        return { rowNumber: row.rowNumber, success: true, action: 'CREATED', entityId: lead.id };
      }
      case 'PRODUCT': {
        const product = await this.createProduct(data, createdById);
        return { rowNumber: row.rowNumber, success: true, action: 'CREATED', entityId: product.id };
      }
      case 'LEDGER': {
        const ledger = await this.createLedger(data);
        return { rowNumber: row.rowNumber, success: true, action: 'CREATED', entityId: ledger.id };
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
        case 'ROW_CONTACT':
        case 'CONTACT':
          await this.prisma.rawContact.update({
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

  /** Create Lead from mapped data */
  private async createLead(data: Record<string, any>, createdById: string) {
    // Generate lead number
    const count = await this.prisma.lead.count();
    const leadNumber = `LD-${String(count + 1).padStart(5, '0')}`;

    return this.prisma.lead.create({
      data: {
        leadNumber,
        status: 'NEW' as any,
        priority: (data.priority as any) || 'MEDIUM',
        expectedValue: data.expectedValue ? Number(data.expectedValue) : null,
        notes: data.notes || null,
        createdById,
        contactId: data.contactId || createdById, // placeholder
      },
    });
  }

  /** Create Product from mapped data */
  private async createProduct(data: Record<string, any>, createdById: string) {
    return this.prisma.product.create({
      data: {
        name: data.name || 'Unknown Product',
        code: data.code || null,
        description: data.description || null,
        hsnCode: data.hsnCode || null,
        mrp: data.mrp ? Number(data.mrp) : null,
        sellingPrice: data.sellingPrice ? Number(data.sellingPrice) : null,
        purchasePrice: data.purchasePrice ? Number(data.purchasePrice) : null,
        taxRate: data.taxRate ? Number(data.taxRate) : null,
        unit: data.unit || 'PCS',
        barcode: data.barcode || null,
      } as any,
    });
  }

  /** Create Ledger from mapped data */
  private async createLedger(data: Record<string, any>) {
    return this.prisma.ledgerMaster.create({
      data: {
        name: data.name || 'Unknown Ledger',
        code: data.code || `LDG${Date.now().toString().slice(-6)}`,
        groupType: data.groupType || 'ASSET',
        openingBalance: data.openingBalance ? Number(data.openingBalance) : 0,
        openingBalanceType: data.balanceType || 'Dr',
        currentBalance: data.openingBalance ? Number(data.openingBalance) : 0,
        gstin: data.gstin || null,
        panNo: data.pan || null,
        mobile1: data.mobile || null,
        email: data.email || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        creditLimit: data.creditLimit ? Number(data.creditLimit) : null,
        creditDays: data.creditDays ? Number(data.creditDays) : null,
      } as any,
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
