import { StorageLocalService } from '../services/storage-local.service';
import * as fs from 'fs';

jest.mock('fs');

describe('StorageLocalService', () => {
  let service: StorageLocalService;

  beforeEach(() => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
    (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('test'));
    (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);
    service = new StorageLocalService();
  });

  it('should save a file and return upload result', async () => {
    const mockFile = {
      originalname: 'test-doc.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('pdf-content'),
    } as Express.Multer.File;

    const result = await service.saveFile(mockFile);

    expect(result.originalName).toBe('test-doc.pdf');
    expect(result.mimeType).toBe('application/pdf');
    expect(result.fileSize).toBe(1024);
    expect(result.storagePath).toContain('uploads/documents');
    expect(result.fileName).toMatch(/\.pdf$/);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should reject files exceeding 50MB', async () => {
    const mockFile = {
      originalname: 'huge.pdf',
      mimetype: 'application/pdf',
      size: 60 * 1024 * 1024,
      buffer: Buffer.alloc(0),
    } as Express.Multer.File;

    await expect(service.saveFile(mockFile)).rejects.toThrow('File size exceeds');
  });

  it('should reject disallowed mime types', async () => {
    const mockFile = {
      originalname: 'malware.exe',
      mimetype: 'application/x-msdownload',
      size: 1024,
      buffer: Buffer.alloc(0),
    } as Express.Multer.File;

    await expect(service.saveFile(mockFile)).rejects.toThrow('not allowed');
  });

  it('should delete a file from disk', async () => {
    await service.deleteFile('uploads/documents/2026-02/test.pdf');
    expect(fs.unlinkSync).toHaveBeenCalled();
  });

  it('should read a file from disk', async () => {
    const result = await service.getFile('uploads/documents/2026-02/test.pdf');
    expect(result.buffer).toBeDefined();
    expect(result.fileName).toBe('test.pdf');
  });
});
