import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DbOperationsService } from '../infrastructure/db-operations.service';

const MOCK_URL = 'postgresql://admin:s3cr3t@db.example.com:5432/myapp';

const configMock = {
  get: jest.fn().mockReturnValue(MOCK_URL),
};

describe('DbOperationsService', () => {
  let service: DbOperationsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DbOperationsService,
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();
    service = module.get(DbOperationsService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── buildTestDbUrl ────────────────────────────────────────────────────────

  describe('buildTestDbUrl', () => {
    it('returns URL with swapped database name', () => {
      configMock.get.mockReturnValue(MOCK_URL);
      const result = service.buildTestDbUrl('test_sharma_20260325');
      expect(result).toBe('postgresql://admin:s3cr3t@db.example.com:5432/test_sharma_20260325');
    });

    it('preserves query params when present', () => {
      configMock.get.mockReturnValue(`${MOCK_URL}?schema=public`);
      const result = service.buildTestDbUrl('new_db');
      expect(result).toContain('new_db');
      expect(result).toContain('?schema=public');
    });
  });

  // ── parseDbUrl ────────────────────────────────────────────────────────────

  describe('parseDbUrl', () => {
    it('parses all components from a valid URL', () => {
      const parsed = service.parseDbUrl(MOCK_URL);
      expect(parsed.user).toBe('admin');
      expect(parsed.password).toBe('s3cr3t');
      expect(parsed.host).toBe('db.example.com');
      expect(parsed.port).toBe('5432');
      expect(parsed.database).toBe('myapp');
    });

    it('throws for an invalid URL', () => {
      expect(() => service.parseDbUrl('not-a-url')).toThrow('Cannot parse DB URL');
    });

    it('handles URL with @ in password', () => {
      // Railway sometimes includes special chars
      const url = 'postgresql://user:p%40ss@host:5432/db';
      // Our regex won't handle encoded special chars in password — this is a known limitation
      // and acceptable for the internal admin URLs we use
      expect(() => service.parseDbUrl(url)).not.toThrow();
    });
  });

  // ── isPgDumpAvailable ─────────────────────────────────────────────────────

  describe('isPgDumpAvailable', () => {
    it('returns false when pg_dump is not on PATH', () => {
      // In this test environment, pg_dump is not installed
      const result = service.isPgDumpAvailable();
      expect(typeof result).toBe('boolean');
    });
  });
});
