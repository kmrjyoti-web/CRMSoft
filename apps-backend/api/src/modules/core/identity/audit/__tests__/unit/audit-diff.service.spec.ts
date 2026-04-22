import { AuditDiffService } from '../../services/audit-diff.service';
import { AuditSanitizerService } from '../../services/audit-sanitizer.service';

describe('AuditDiffService', () => {
  let service: AuditDiffService;

  beforeEach(() => {
    const sanitizer = new AuditSanitizerService();
    service = new AuditDiffService(sanitizer);
  });

  it('should detect field change: status from NEW to VERIFIED', () => {
    const before = { id: '1', status: 'NEW', priority: 'MEDIUM', createdAt: new Date() };
    const after = { id: '1', status: 'VERIFIED', priority: 'MEDIUM', createdAt: new Date() };
    const changes = service.computeDiff(before, after, 'LEAD');
    expect(changes).toHaveLength(1);
    expect(changes[0].fieldName).toBe('status');
    expect(changes[0].oldValue).toBe('NEW');
    expect(changes[0].newValue).toBe('VERIFIED');
    expect(changes[0].fieldLabel).toBe('Lead Status');
  });

  it('should detect multiple field changes in one update', () => {
    const before = { id: '1', status: 'NEW', priority: 'MEDIUM', notes: null };
    const after = { id: '1', status: 'VERIFIED', priority: 'HIGH', notes: 'Hot lead' };
    const changes = service.computeDiff(before, after, 'LEAD');
    expect(changes.length).toBeGreaterThanOrEqual(3);
    const fields = changes.map(c => c.fieldName);
    expect(fields).toContain('status');
    expect(fields).toContain('priority');
    expect(fields).toContain('notes');
  });

  it('should ignore unchanged fields', () => {
    const before = { id: '1', status: 'NEW', priority: 'MEDIUM' };
    const after = { id: '1', status: 'VERIFIED', priority: 'MEDIUM' };
    const changes = service.computeDiff(before, after, 'LEAD');
    const fields = changes.map(c => c.fieldName);
    expect(fields).not.toContain('priority');
  });

  it('should handle null → value (ADDED)', () => {
    const before = { id: '1', notes: null };
    const after = { id: '1', notes: 'New note' };
    const changes = service.computeDiff(before, after, 'LEAD');
    expect(changes).toHaveLength(1);
    expect(changes[0].oldValue).toBeNull();
    expect(changes[0].newValue).toBe('New note');
  });

  it('should handle value → null (REMOVED)', () => {
    const before = { id: '1', notes: 'Some note' };
    const after = { id: '1', notes: null };
    const changes = service.computeDiff(before, after, 'LEAD');
    expect(changes).toHaveLength(1);
    expect(changes[0].oldValue).toBe('Some note');
    expect(changes[0].newValue).toBeNull();
  });

  it('should skip IGNORED_FIELDS (id, createdAt, updatedAt, password)', () => {
    const before = { id: '1', status: 'NEW', createdAt: '2025-01-01', updatedAt: '2025-01-01', password: 'old' };
    const after = { id: '1', status: 'VERIFIED', createdAt: '2025-01-02', updatedAt: '2025-01-02', password: 'new' };
    const changes = service.computeDiff(before, after, 'USER');
    const fields = changes.map(c => c.fieldName);
    expect(fields).not.toContain('id');
    expect(fields).not.toContain('createdAt');
    expect(fields).not.toContain('updatedAt');
    expect(fields).not.toContain('password');
  });

  it('should correctly compare Decimal values as strings', () => {
    const before = { id: '1', expectedValue: '50000' };
    const after = { id: '1', expectedValue: '75000' };
    const changes = service.computeDiff(before, after, 'LEAD');
    expect(changes).toHaveLength(1);
    expect(changes[0].fieldName).toBe('expectedValue');
    expect(changes[0].oldValue).toBe('50000');
    expect(changes[0].newValue).toBe('75000');
  });
});
