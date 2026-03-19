import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { DrillDownResult, ColumnDef } from '../interfaces/report.interface';

/**
 * Generic drill-down helper that fetches underlying records with pagination.
 * Used by individual report implementations to provide drill-down functionality
 * for leads, activities, demos, and contacts.
 */
@Injectable()
export class DrillDownService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch leads matching the given filter with pagination.
   * Includes related contact, organization, and allocatedTo user.
   * @param where - Prisma where clause for Lead
   * @param page - Page number (1-based)
   * @param limit - Records per page
   * @param columns - Optional custom column definitions
   * @returns Paginated drill-down result with lead records
   */
  async getLeads(
    where: any,
    page: number,
    limit: number,
    columns?: ColumnDef[],
  ): Promise<DrillDownResult> {
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: {
          contact: { select: { firstName: true, lastName: true } },
          organization: { select: { name: true } },
          allocatedTo: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.lead.count({ where }),
    ]);

    const cols: ColumnDef[] = columns || [
      { key: 'leadNumber', header: 'Lead #', width: 18 },
      { key: 'contactName', header: 'Contact', width: 22 },
      { key: 'organization', header: 'Organization', width: 25 },
      { key: 'status', header: 'Status', width: 14 },
      { key: 'expectedValue', header: 'Expected Value', width: 18, format: 'currency' },
      { key: 'allocatedTo', header: 'Allocated To', width: 20 },
      { key: 'createdAt', header: 'Created', width: 15, format: 'date' },
    ];

    const rows = records.map(l => ({
      leadNumber: l.leadNumber,
      contactName: l.contact ? `${l.contact.firstName} ${l.contact.lastName}` : '',
      organization: l.organization?.name || '',
      status: l.status,
      expectedValue: Number(l.expectedValue || 0),
      allocatedTo: l.allocatedTo ? `${l.allocatedTo.firstName} ${l.allocatedTo.lastName}` : 'Unassigned',
      createdAt: l.createdAt,
    }));

    return { dimension: '', value: '', columns: cols, rows, total, page, limit };
  }

  /**
   * Fetch activities matching the given filter with pagination.
   * Includes related lead and createdByUser.
   * @param where - Prisma where clause for Activity
   * @param page - Page number (1-based)
   * @param limit - Records per page
   * @returns Paginated drill-down result with activity records
   */
  async getActivities(where: any, page: number, limit: number): Promise<DrillDownResult> {
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        include: {
          lead: { select: { leadNumber: true } },
          createdByUser: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activity.count({ where }),
    ]);

    const columns: ColumnDef[] = [
      { key: 'date', header: 'Date', width: 15, format: 'date' },
      { key: 'type', header: 'Type', width: 14 },
      { key: 'subject', header: 'Subject', width: 30 },
      { key: 'outcome', header: 'Outcome', width: 20 },
      { key: 'leadNumber', header: 'Lead #', width: 18 },
      { key: 'performedBy', header: 'Performed By', width: 20 },
    ];

    const rows = records.map(a => ({
      date: a.createdAt,
      type: a.type,
      subject: a.subject,
      outcome: a.outcome || '',
      leadNumber: a.lead?.leadNumber || '',
      performedBy: `${a.createdByUser.firstName} ${a.createdByUser.lastName}`,
    }));

    return { dimension: '', value: '', columns, rows, total, page, limit };
  }

  /**
   * Fetch demos matching the given filter with pagination.
   * Includes related lead and assigned user.
   * @param where - Prisma where clause for Demo
   * @param page - Page number (1-based)
   * @param limit - Records per page
   * @returns Paginated drill-down result with demo records
   */
  async getDemos(where: any, page: number, limit: number): Promise<DrillDownResult> {
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      this.prisma.demo.findMany({
        where,
        include: {
          lead: { select: { leadNumber: true } },
          conductedBy: { select: { firstName: true, lastName: true } },
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.demo.count({ where }),
    ]);

    const columns: ColumnDef[] = [
      { key: 'scheduledAt', header: 'Scheduled', width: 18, format: 'date' },
      { key: 'status', header: 'Status', width: 14 },
      { key: 'leadNumber', header: 'Lead #', width: 18 },
      { key: 'conductedBy', header: 'Conducted By', width: 20 },
      { key: 'outcome', header: 'Outcome', width: 20 },
    ];

    const rows = records.map(d => ({
      scheduledAt: d.scheduledAt,
      status: d.status,
      leadNumber: d.lead?.leadNumber || '',
      conductedBy: d.conductedBy ? `${d.conductedBy.firstName} ${d.conductedBy.lastName}` : '',
      outcome: d.outcome || '',
    }));

    return { dimension: '', value: '', columns, rows, total, page, limit };
  }

  /**
   * Fetch contacts matching the given filter with pagination.
   * Includes related organization.
   * @param where - Prisma where clause for Contact
   * @param page - Page number (1-based)
   * @param limit - Records per page
   * @returns Paginated drill-down result with contact records
   */
  async getContacts(where: any, page: number, limit: number): Promise<DrillDownResult> {
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        include: { organization: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.contact.count({ where }),
    ]);

    const columns: ColumnDef[] = [
      { key: 'name', header: 'Name', width: 22 },
      { key: 'designation', header: 'Designation', width: 20 },
      { key: 'department', header: 'Department', width: 20 },
      { key: 'organization', header: 'Organization', width: 25 },
      { key: 'createdAt', header: 'Created', width: 15, format: 'date' },
    ];

    const rows = records.map(c => ({
      name: `${c.firstName} ${c.lastName}`,
      designation: c.designation || '',
      department: c.department || '',
      organization: c.organization?.name || '',
      createdAt: c.createdAt,
    }));

    return { dimension: '', value: '', columns, rows, total, page, limit };
  }
}
