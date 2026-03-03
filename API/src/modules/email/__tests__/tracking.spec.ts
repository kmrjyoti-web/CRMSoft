import { Test, TestingModule } from '@nestjs/testing';
import { TrackingService } from '../services/tracking.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('TrackingService', () => {
  let service: TrackingService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      email: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      emailTrackingEvent: {
        create: jest.fn(),
      },
      campaignRecipient: {
        update: jest.fn(),
      },
      emailCampaign: {
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TrackingService>(TrackingService);
  });

  it('should generate a tracking pixel ID as a UUID string', () => {
    const pixelId = service.generateTrackingPixelId();

    expect(typeof pixelId).toBe('string');
    expect(pixelId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('should inject open pixel before closing body tag', () => {
    const html = '<html><body><p>Hello</p></body></html>';
    const pixelId = 'test-pixel-123';

    const result = service.injectOpenPixel(html, pixelId);

    expect(result).toContain(`/email/track/open/${pixelId}`);
    expect(result).toContain('<img src=');
    expect(result.indexOf('<img')).toBeLessThan(result.indexOf('</body>'));
  });

  it('should append open pixel when no body tag is present', () => {
    const html = '<div><p>Hello World</p></div>';
    const pixelId = 'test-pixel-456';

    const result = service.injectOpenPixel(html, pixelId);

    expect(result).toContain(`/email/track/open/${pixelId}`);
    expect(result).toContain('<img src=');
    expect(result.startsWith('<div>')).toBe(true);
    expect(result.endsWith('/>'));
  });

  it('should rewrite normal URLs but skip mailto links', () => {
    const html = `
      <a href="https://example.com/page">Visit</a>
      <a href="mailto:test@example.com">Email Us</a>
      <a href="#section">Jump</a>
      <a href="https://example.com/unsubscribe">Unsubscribe</a>
    `;
    const emailId = 'email-789';

    const result = service.rewriteLinks(html, emailId);

    expect(result).toContain(`/email/track/click/${emailId}`);
    expect(result).toContain('url=' + encodeURIComponent('https://example.com/page'));
    expect(result).toContain('href="mailto:test@example.com"');
    expect(result).toContain('href="#section"');
    expect(result).toContain('href="https://example.com/unsubscribe"');
  });

  it('should return a Buffer from getTransparentPixel', () => {
    const pixel = service.getTransparentPixel();

    expect(Buffer.isBuffer(pixel)).toBe(true);
    expect(pixel.length).toBeGreaterThan(0);
  });
});
