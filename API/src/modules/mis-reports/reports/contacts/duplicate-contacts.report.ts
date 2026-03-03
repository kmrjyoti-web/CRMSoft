import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
} from '../../interfaces/report.interface';

@Injectable()
export class DuplicateContactsReport implements IReport {
  readonly code = 'DUPLICATE_CONTACTS';
  readonly name = 'Duplicate Contacts';
  readonly category = 'CONTACT_ORG';
  readonly description = 'Identifies potential duplicate contacts by name matching and groups them by severity';
  readonly supportsDrillDown = false;
  readonly supportsPeriodComparison = false;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'severity', label: 'Severity', type: 'select', options: [
      { value: 'exact', label: 'Exact Match' },
      { value: 'likely', label: 'Likely Match' },
      { value: 'possible', label: 'Possible Match' },
    ]},
    { key: 'isActive', label: 'Active Only', type: 'boolean', defaultValue: true },
  ];

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = {
      tenantId: params.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.filters?.isActive !== undefined) where.isActive = params.filters.isActive;

    const contacts = await this.prisma.contact.findMany({
      where,
      select: {
        id: true, firstName: true, lastName: true, createdAt: true,
        organization: { select: { id: true, name: true } },
      },
    });

    // Group contacts by normalized full name (case-insensitive)
    const nameGroups = new Map<string, typeof contacts>();
    for (const contact of contacts) {
      const nameKey = `${contact.firstName.toLowerCase().trim()}|${contact.lastName.toLowerCase().trim()}`;
      if (!nameGroups.has(nameKey)) nameGroups.set(nameKey, []);
      nameGroups.get(nameKey)!.push(contact);
    }

    // Filter to only groups with 2+ contacts (duplicates)
    const duplicateGroups = [...nameGroups.entries()]
      .filter(([, group]) => group.length >= 2)
      .map(([nameKey, group]) => {
        const severity = this.classifySeverity(group);
        return { nameKey, contacts: group, severity };
      });

    // Apply severity filter
    const filtered = params.filters?.severity
      ? duplicateGroups.filter(g => g.severity === params.filters!.severity)
      : duplicateGroups;

    const severityCounts = { exact: 0, likely: 0, possible: 0 };
    duplicateGroups.forEach(g => severityCounts[g.severity as keyof typeof severityCounts]++);

    const totalDuplicateGroups = duplicateGroups.length;
    const exactMatches = severityCounts.exact;
    const totalAffectedContacts = duplicateGroups.reduce((s, g) => s + g.contacts.length, 0);
    const deduplicationPotential = totalAffectedContacts - totalDuplicateGroups;

    const summary: ReportMetric[] = [
      { key: 'totalDuplicateGroups', label: 'Duplicate Groups', value: totalDuplicateGroups, format: 'number' },
      { key: 'exactMatches', label: 'Exact Matches', value: exactMatches, format: 'number' },
      { key: 'totalAffectedContacts', label: 'Affected Contacts', value: totalAffectedContacts, format: 'number' },
      { key: 'deduplicationPotential', label: 'Dedup Potential', value: deduplicationPotential, format: 'number' },
    ];

    const severityLabels = ['exact', 'likely', 'possible'];
    const charts: ChartData[] = [
      {
        type: 'PIE', title: 'Duplicate Severity Distribution',
        labels: severityLabels,
        datasets: [{
          label: 'Groups',
          data: severityLabels.map(s => severityCounts[s as keyof typeof severityCounts]),
          color: '#FF5722',
        }],
      },
    ];

    // Build table rows from filtered groups
    const tableRows: any[] = [];
    for (const group of filtered) {
      const firstName = group.contacts[0].firstName;
      const lastName = group.contacts[0].lastName;
      const orgNames = [...new Set(group.contacts.map(c => c.organization?.name || 'No Org'))].join(', ');
      const dates = group.contacts.map(c => c.createdAt).sort((a, b) => a.getTime() - b.getTime());

      tableRows.push({
        name: `${firstName} ${lastName}`,
        count: group.contacts.length,
        organizations: orgNames,
        severity: group.severity,
        firstCreated: dates[0],
        lastCreated: dates[dates.length - 1],
      });
    }

    tableRows.sort((a, b) => {
      const order = { exact: 0, likely: 1, possible: 2 };
      return (order[a.severity as keyof typeof order] || 0) - (order[b.severity as keyof typeof order] || 0);
    });

    const tableColumns: ColumnDef[] = [
      { key: 'name', header: 'Contact Name', width: 22 },
      { key: 'count', header: 'Duplicates', width: 12, format: 'number' },
      { key: 'organizations', header: 'Organizations', width: 30 },
      { key: 'severity', header: 'Severity', width: 12 },
      { key: 'firstCreated', header: 'First Created', width: 15, format: 'date' },
      { key: 'lastCreated', header: 'Last Created', width: 15, format: 'date' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Duplicate Contact Groups', columns: tableColumns, rows: tableRows }],
    };
  }

  private classifySeverity(
    group: Array<{ organization?: { id: string; name: string } | null }>,
  ): string {
    const orgIds = group.map(c => c.organization?.id).filter(Boolean);
    const uniqueOrgs = new Set(orgIds);

    // All contacts share the same organization (or all have no org)
    if (uniqueOrgs.size <= 1) return 'exact';
    // Some share orgs, some don't
    if (uniqueOrgs.size < group.length) return 'likely';
    // All in different orgs
    return 'possible';
  }
}
