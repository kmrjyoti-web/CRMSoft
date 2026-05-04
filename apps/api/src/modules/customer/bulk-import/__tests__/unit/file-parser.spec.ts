import { FileParserService } from '../../services/file-parser.service';

describe('FileParserService', () => {
  let service: FileParserService;

  beforeEach(() => {
    service = new FileParserService();
  });

  it('should parse CSV with headers and rows', async () => {
    const csv = 'Name,Email,Mobile\nRahul,rahul@test.com,9876543210\nPriya,priya@test.com,8765432109';
    const buf = Buffer.from(csv);
    const result = await service.parse(buf, 'test.csv', buf.length);

    expect(result.headers).toEqual(['Name', 'Email', 'Mobile']);
    expect(result.totalRows).toBe(2);
    expect(result.rows[0]).toEqual({ Name: 'Rahul', Email: 'rahul@test.com', Mobile: '9876543210' });
  });

  it('should preserve raw rowData immutably', async () => {
    const csv = 'Company Name,Contact Person\nABC Corp,Mr Rahul';
    const buf = Buffer.from(csv);
    const result = await service.parse(buf, 'test.csv', buf.length);

    expect(result.rows[0]['Company Name']).toBe('ABC Corp');
    expect(result.rows[0]['Contact Person']).toBe('Mr Rahul');
  });

  it('should skip empty rows', async () => {
    const csv = 'Name,Email\nRahul,rahul@test.com\n\nPriya,priya@test.com';
    const buf = Buffer.from(csv);
    const result = await service.parse(buf, 'test.csv', buf.length);

    expect(result.totalRows).toBe(2);
  });

  it('should handle BOM character', async () => {
    const csv = '\uFEFFName,Email\nRahul,rahul@test.com';
    const buf = Buffer.from(csv);
    const result = await service.parse(buf, 'test.csv', buf.length);

    expect(result.headers).toEqual(['Name', 'Email']);
    expect(result.totalRows).toBe(1);
  });
});
