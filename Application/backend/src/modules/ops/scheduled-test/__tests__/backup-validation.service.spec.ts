import { ConflictException } from '@nestjs/common';
import { BackupValidationService } from '../infrastructure/services/backup-validation.service';

const mockRepo = {
  findById: jest.fn(),
  findLatestValidated: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  findByTenantId: jest.fn(),
};

function buildService() {
  return new BackupValidationService(mockRepo as any);
}

describe('BackupValidationService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('validateBackup', () => {
    it('returns { valid: false } when backup record not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      const result = await buildService().validateBackup('missing-id');
      expect(result).toEqual({ valid: false, reason: 'Backup record not found' });
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('returns { valid: false } when sizeBytes is 0', async () => {
      mockRepo.findById.mockResolvedValue({
        id: 'br-1',
        sizeBytes: BigInt(0),
        backupUrl: 'https://example.com/backup.sql',
        checksum: 'abc123',
        dbName: 'test_db',
      });

      const result = await buildService().validateBackup('br-1');
      expect(result).toEqual({ valid: false, reason: 'Backup file size is 0 bytes' });
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('returns { valid: false } when checksum does not match', async () => {
      const svc = buildService();
      jest.spyOn(svc, 'computeChecksum').mockResolvedValue('wrong-checksum');

      mockRepo.findById.mockResolvedValue({
        id: 'br-2',
        sizeBytes: BigInt(1024),
        backupUrl: 'https://example.com/backup.sql',
        checksum: 'correct-checksum',
        dbName: 'test_db',
      });

      const result = await svc.validateBackup('br-2');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Checksum mismatch');
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('marks isValidated=true when checksum matches', async () => {
      const svc = buildService();
      jest.spyOn(svc, 'computeChecksum').mockResolvedValue('correct-checksum');

      mockRepo.findById.mockResolvedValue({
        id: 'br-3',
        sizeBytes: BigInt(2048),
        backupUrl: 'https://example.com/backup.sql',
        checksum: 'correct-checksum',
        dbName: 'test_db',
      });
      mockRepo.update.mockResolvedValue({});

      const result = await svc.validateBackup('br-3');
      expect(result).toEqual({ valid: true });
      expect(mockRepo.update).toHaveBeenCalledWith(
        'br-3',
        expect.objectContaining({ isValidated: true, validatedAt: expect.any(Date) }),
      );
    });

    it('returns { valid: false } when computeChecksum throws', async () => {
      const svc = buildService();
      jest.spyOn(svc, 'computeChecksum').mockRejectedValue(new Error('Network timeout'));

      mockRepo.findById.mockResolvedValue({
        id: 'br-4',
        sizeBytes: BigInt(512),
        backupUrl: 'https://example.com/backup.sql',
        checksum: 'abc',
        dbName: 'test_db',
      });

      const result = await svc.validateBackup('br-4');
      expect(result).toEqual({ valid: false, reason: 'Network timeout' });
    });
  });

  describe('requireValidatedBackup', () => {
    it('throws ConflictException when no validated backup exists', async () => {
      mockRepo.findLatestValidated.mockResolvedValue(null);

      await expect(buildService().requireValidatedBackup('t-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('throws ConflictException when backup is older than 24 hours', async () => {
      const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
      mockRepo.findLatestValidated.mockResolvedValue({
        id: 'br-5',
        createdAt: twentyFiveHoursAgo,
        isValidated: true,
      });

      await expect(buildService().requireValidatedBackup('t-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('does not throw when a recent validated backup exists', async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      mockRepo.findLatestValidated.mockResolvedValue({
        id: 'br-6',
        createdAt: oneHourAgo,
        isValidated: true,
      });

      await expect(buildService().requireValidatedBackup('t-1')).resolves.toBeUndefined();
    });
  });

  describe('findBestBackupForTesting', () => {
    it('returns latest validated backup for the tenant', async () => {
      const backup = { id: 'br-7', tenantId: 't-1', isValidated: true };
      mockRepo.findLatestValidated.mockResolvedValue(backup);

      const result = await buildService().findBestBackupForTesting('t-1');
      expect(result).toEqual(backup);
      expect(mockRepo.findLatestValidated).toHaveBeenCalledWith('t-1');
    });

    it('returns null when no validated backup exists', async () => {
      mockRepo.findLatestValidated.mockResolvedValue(null);
      const result = await buildService().findBestBackupForTesting('t-no-backup');
      expect(result).toBeNull();
    });
  });
});
