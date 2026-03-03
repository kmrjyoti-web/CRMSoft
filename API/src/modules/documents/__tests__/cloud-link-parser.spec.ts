import { CloudLinkParserService } from '../services/cloud-link-parser.service';

describe('CloudLinkParserService', () => {
  let service: CloudLinkParserService;

  beforeEach(() => {
    service = new CloudLinkParserService();
  });

  it('should parse Google Drive file URL', () => {
    const result = service.parseUrl('https://drive.google.com/file/d/1aBcDeF_gHiJkLmNoP/view');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('GOOGLE_DRIVE');
    expect(result!.fileId).toBe('1aBcDeF_gHiJkLmNoP');
  });

  it('should parse Google Docs URL', () => {
    const result = service.parseUrl('https://docs.google.com/document/d/abc123/edit');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('GOOGLE_DRIVE');
    expect(result!.fileId).toBe('abc123');
  });

  it('should parse Google Sheets URL', () => {
    const result = service.parseUrl('https://docs.google.com/spreadsheets/d/xyz789/edit');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('GOOGLE_DRIVE');
    expect(result!.fileId).toBe('xyz789');
  });

  it('should parse Dropbox URL', () => {
    const result = service.parseUrl('https://www.dropbox.com/s/abc123/report.pdf?dl=0');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('DROPBOX');
    expect(result!.fileId).toBe('abc123');
    expect(result!.fileName).toBe('report.pdf');
  });

  it('should parse OneDrive URL', () => {
    const result = service.parseUrl('https://onedrive.live.com/?id=ABC123');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('ONEDRIVE');
  });

  it('should return null for non-cloud URLs', () => {
    const result = service.parseUrl('https://example.com/file.pdf');
    expect(result).toBeNull();
  });

  it('should detect provider from URL', () => {
    expect(service.detectProvider('https://drive.google.com/file/d/123')).toBe('GOOGLE_DRIVE');
    expect(service.detectProvider('https://1drv.ms/x/abc')).toBe('ONEDRIVE');
    expect(service.detectProvider('https://www.dropbox.com/s/abc/test.pdf')).toBe('DROPBOX');
    expect(service.detectProvider('https://example.com')).toBeNull();
  });

  it('should identify cloud URLs', () => {
    expect(service.isCloudUrl('https://drive.google.com/file/d/123')).toBe(true);
    expect(service.isCloudUrl('https://example.com')).toBe(false);
  });

  it('should get mime type from extension', () => {
    expect(service.getMimeTypeFromExtension('report.pdf')).toBe('application/pdf');
    expect(service.getMimeTypeFromExtension('photo.jpg')).toBe('image/jpeg');
    expect(service.getMimeTypeFromExtension('data.xlsx')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(service.getMimeTypeFromExtension('unknown.xyz')).toBe('application/octet-stream');
  });
});
