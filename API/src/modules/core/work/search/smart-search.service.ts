import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { SmartSearchDto } from './dto/smart-search.dto';

@Injectable()
export class SmartSearchService {
  constructor(private prisma: PrismaService) {}

  async search(tenantId: string, query: SmartSearchDto) {
    const { entityType, filters, limit = 20, offset = 0, sortBy, sortOrder } = query;
    const whereConditions: any[] = [{ tenantId }];

    for (const filter of filters) {
      const fieldName = this.getFieldName(entityType, filter.parameter);
      if (!fieldName) continue;
      const cleanValue = filter.value.replace(/^[%=]|%$/g, '');
      switch (filter.pattern) {
        case 'CONTAINS':
          whereConditions.push({ [fieldName]: { contains: cleanValue, mode: 'insensitive' } });
          break;
        case 'STARTS_WITH':
          whereConditions.push({ [fieldName]: { startsWith: cleanValue, mode: 'insensitive' } });
          break;
        case 'ENDS_WITH':
          whereConditions.push({ [fieldName]: { endsWith: cleanValue, mode: 'insensitive' } });
          break;
        case 'EXACT':
          whereConditions.push({ [fieldName]: { equals: cleanValue, mode: 'insensitive' } });
          break;
      }
    }

    const where = { AND: whereConditions };
    const orderBy = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' as const };
    const select = this.getSelectFields(entityType);

    let results: any[] = [];
    let total = 0;

    try {
      switch (entityType) {
        case 'CONTACT': {
          const [data, count] = await Promise.all([
            this.prisma.contact.findMany({ where, take: limit, skip: offset, orderBy, select }),
            this.prisma.contact.count({ where }),
          ]);
          results = data; total = count; break;
        }
        case 'ORGANIZATION': {
          const [data, count] = await Promise.all([
            this.prisma.organization.findMany({ where, take: limit, skip: offset, orderBy, select }),
            this.prisma.organization.count({ where }),
          ]);
          results = data; total = count; break;
        }
        case 'PRODUCT': {
          const [data, count] = await Promise.all([
            (this.prisma as any).product?.findMany({ where, take: limit, skip: offset, orderBy, select }) ?? Promise.resolve([]),
            (this.prisma as any).product?.count({ where }) ?? Promise.resolve(0),
          ]);
          results = data; total = count; break;
        }
        case 'LEDGER': {
          const ledgerWhere = { AND: whereConditions };
          const [data, count] = await Promise.all([
            (this.prisma as any).ledger?.findMany({ where: ledgerWhere, take: limit, skip: offset, orderBy, select }) ?? Promise.resolve([]),
            (this.prisma as any).ledger?.count({ where: ledgerWhere }) ?? Promise.resolve(0),
          ]);
          results = data; total = count; break;
        }
        default:
          results = []; total = 0;
      }
    } catch {
      results = []; total = 0;
    }

    return { results, total, limit, offset };
  }

  getParameterConfig(entityType: string) {
    const configs: Record<string, any[]> = {
      CONTACT: [
        { code: 'NM', label: 'Name', isDefault: true },
        { code: 'EI', label: 'Email ID' },
        { code: 'MN', label: 'Mobile No' },
        { code: 'GS', label: 'GSTIN' },
        { code: 'CT', label: 'City' },
        { code: 'PN', label: 'PAN No' },
        { code: 'CD', label: 'Code' },
        { code: 'AD', label: 'Address' },
        { code: 'ST', label: 'State' },
      ],
      ORGANIZATION: [
        { code: 'NM', label: 'Name', isDefault: true },
        { code: 'EI', label: 'Email ID' },
        { code: 'MN', label: 'Mobile No' },
        { code: 'GS', label: 'GSTIN' },
        { code: 'CT', label: 'City' },
        { code: 'PN', label: 'PAN No' },
        { code: 'CD', label: 'Code' },
        { code: 'WB', label: 'Website' },
      ],
      PRODUCT: [
        { code: 'NM', label: 'Name', isDefault: true },
        { code: 'CD', label: 'Code' },
        { code: 'HSN', label: 'HSN/SAC' },
        { code: 'BR', label: 'Brand' },
        { code: 'CT', label: 'Category' },
        { code: 'MF', label: 'Manufacturer' },
        { code: 'BC', label: 'Barcode' },
      ],
      LEDGER: [
        { code: 'NM', label: 'Name', isDefault: true },
        { code: 'CD', label: 'Code' },
        { code: 'GR', label: 'Group' },
        { code: 'GS', label: 'GSTIN' },
        { code: 'STN', label: 'Station' },
      ],
    };
    return configs[entityType] || [{ code: 'NM', label: 'Name', isDefault: true }];
  }

  private getFieldName(entityType: string, parameter: string): string | null {
    const fieldMap: Record<string, Record<string, string>> = {
      CONTACT: { NM: 'firstName', EI: 'email', MN: 'phone', CT: 'city', PN: 'panNo', GS: 'gstin', AD: 'address', CD: 'code', ST: 'state' },
      ORGANIZATION: { NM: 'name', EI: 'email', MN: 'phone', CT: 'city', GS: 'gstin', PN: 'panNo', AD: 'address', CD: 'code', WB: 'website' },
      PRODUCT: { NM: 'name', CD: 'code', HSN: 'hsnCode', BR: 'brand', CT: 'category', MF: 'manufacturer', BC: 'barcode' },
      LEDGER: { NM: 'name', CD: 'code', GR: 'groupType', GS: 'gstin', STN: 'station' },
    };
    return fieldMap[entityType]?.[parameter] ?? null;
  }

  private getSelectFields(entityType: string): Record<string, boolean> {
    const selectMap: Record<string, Record<string, boolean>> = {
      CONTACT: { id: true, firstName: true, lastName: true, email: true, phone: true, city: true, gstin: true, panNo: true, state: true, address: true, createdAt: true },
      ORGANIZATION: { id: true, name: true, email: true, phone: true, city: true, gstin: true, panNo: true, state: true, address: true, website: true, createdAt: true },
      PRODUCT: { id: true, name: true, code: true, hsnCode: true, mrp: true, sellingPrice: true, brand: true, category: true, currentStock: true },
      LEDGER: { id: true, name: true, code: true, groupType: true, currentBalance: true, station: true, gstin: true },
    };
    return selectMap[entityType] || { id: true, name: true };
  }
}
