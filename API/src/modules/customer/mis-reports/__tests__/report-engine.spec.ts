/* Mock the renderer modules before importing anything else to prevent
   ExcelJS and PDFKit from loading (they require native fs constants). */
jest.mock('../infrastructure/report-renderer-excel.service', () => ({
  ReportRendererExcelService: jest.fn().mockImplementation(() => ({
    render: jest.fn().mockResolvedValue(Buffer.from('xlsx')),
  })),
}));
jest.mock('../infrastructure/report-renderer-csv.service', () => ({
  ReportRendererCsvService: jest.fn().mockImplementation(() => ({
    render: jest.fn().mockResolvedValue(Buffer.from('csv')),
  })),
}));
jest.mock('../infrastructure/report-renderer-pdf.service', () => ({
  ReportRendererPdfService: jest.fn().mockImplementation(() => ({
    render: jest.fn().mockResolvedValue(Buffer.from('pdf')),
  })),
}));

const realFs = jest.requireActual('fs');
jest.mock('fs', () => ({
  ...realFs,
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

import { ReportEngineService } from '../infrastructure/report-engine.service';
import { NotFoundException } from '@nestjs/common';
import { IReport } from '../interfaces/report-class.interface';
import { ReportParams, ReportData } from '../interfaces/report.interface';

const mockPrisma = { reportExportLog: { create: jest.fn() } } as any;

const mockComparator = {
  getComparisonPeriod: jest.fn().mockReturnValue({
    from: new Date('2024-12-01'),
    to: new Date('2024-12-31'),
  }),
  compare: jest.fn().mockReturnValue([
    { key: 'totalLeads', label: 'Total Leads', value: 100, previousValue: 80, changePercent: 25, changeDirection: 'UP' },
  ]),
};

const mockExcel = { render: jest.fn().mockResolvedValue(Buffer.from('xlsx')) };
const mockCsv = { render: jest.fn().mockResolvedValue(Buffer.from('csv')) };
const mockPdf = { render: jest.fn().mockResolvedValue(Buffer.from('pdf')) };

const baseParams: ReportParams = {
  dateFrom: new Date('2025-01-01'),
  dateTo: new Date('2025-01-31'),
  tenantId: 'tenant-1',
};

const sampleReportData: ReportData = {
  reportCode: 'TEST_CODE',
  reportName: 'Test Report',
  category: 'TEST',
  generatedAt: new Date(),
  params: baseParams,
  summary: [{ key: 'totalLeads', label: 'Total Leads', value: 100, format: 'number' }],
  charts: [],
  tables: [{ title: 'Test Table', columns: [], rows: [{ a: 1 }] }],
};

function createMockReport(overrides: Partial<IReport> = {}): IReport {
  return {
    code: 'TEST_CODE',
    name: 'Test Report',
    category: 'TEST',
    description: 'A test report',
    availableFilters: [],
    supportsDrillDown: false,
    supportsPeriodComparison: false,
    generate: jest.fn().mockResolvedValue(sampleReportData),
    ...overrides,
  };
}

describe('ReportEngineService', () => {
  let engine: ReportEngineService;

  beforeEach(() => {
    jest.clearAllMocks();
    engine = new ReportEngineService(
      mockPrisma,
      mockComparator as any,
      mockExcel as any,
      mockCsv as any,
      mockPdf as any,
    );
  });

  it('registerReport adds report to registry and getDefinitions includes it', () => {
    const report = createMockReport();
    engine.registerReport(report);

    const defs = engine.getDefinitions();
    expect(defs).toHaveLength(1);
    expect(defs[0].code).toBe('TEST_CODE');
    expect(defs[0].name).toBe('Test Report');
    expect(defs[0].category).toBe('TEST');
    expect(defs[0].supportsDrillDown).toBe(false);
    expect(defs[0].supportsPeriodComparison).toBe(false);
  });

  it('generate calls the registered report generate() and returns data', async () => {
    const report = createMockReport();
    engine.registerReport(report);

    const result = await engine.generate('TEST_CODE', baseParams);

    expect(report.generate).toHaveBeenCalledWith(baseParams);
    expect(result.reportCode).toBe('TEST_CODE');
    expect(result.summary).toHaveLength(1);
    expect(result.summary[0].key).toBe('totalLeads');
  });

  it('generate with comparePrevious=true calls generate() twice and comparator.compare()', async () => {
    const report = createMockReport({ supportsPeriodComparison: true });
    engine.registerReport(report);

    const paramsWithCompare: ReportParams = { ...baseParams, comparePrevious: true };
    const result = await engine.generate('TEST_CODE', paramsWithCompare);

    expect(report.generate).toHaveBeenCalledTimes(2);
    expect(report.generate).toHaveBeenCalledWith(paramsWithCompare);
    expect(report.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: new Date('2024-12-01'),
        dateTo: new Date('2024-12-31'),
        comparePrevious: false,
      }),
    );
    expect(mockComparator.getComparisonPeriod).toHaveBeenCalledWith(
      baseParams.dateFrom,
      baseParams.dateTo,
    );
    expect(mockComparator.compare).toHaveBeenCalled();
    expect(result.comparison).toBeDefined();
    expect(result.comparison!.metrics).toHaveLength(1);
  });

  it('getDefinition throws NotFoundException on unknown report code', () => {
    expect(() => engine.getDefinition('UNKNOWN')).toThrow(NotFoundException);
  });
});
