import { WebhookSignerService } from '../services/webhook-signer.service';

describe('WebhookSignerService', () => {
  let service: WebhookSignerService;

  beforeEach(() => {
    service = new WebhookSignerService();
  });

  it('should generate consistent signature for same payload', () => {
    const payload = { type: 'lead.created', data: { id: '123' } };
    const secret = 'test-secret';

    const sig1 = service.sign(payload, secret);
    const sig2 = service.sign(payload, secret);
    expect(sig1).toBe(sig2);
  });

  it('should generate different signature for different payloads', () => {
    const secret = 'test-secret';
    const sig1 = service.sign({ a: 1 }, secret);
    const sig2 = service.sign({ a: 2 }, secret);
    expect(sig1).not.toBe(sig2);
  });

  it('should generate different signature for different secrets', () => {
    const payload = { a: 1 };
    const sig1 = service.sign(payload, 'secret1');
    const sig2 = service.sign(payload, 'secret2');
    expect(sig1).not.toBe(sig2);
  });

  it('should verify valid signature', () => {
    const payload = { type: 'test' };
    const secret = 'my-secret';
    const sig = service.sign(payload, secret);

    expect(service.verify(JSON.stringify(payload), `sha256=${sig}`, secret)).toBe(true);
  });

  it('should reject invalid signature', () => {
    expect(service.verify('payload', 'sha256=invalid', 'secret')).toBe(false);
  });

  it('should handle signature without sha256= prefix', () => {
    const payload = { type: 'test' };
    const secret = 'my-secret';
    const sig = service.sign(payload, secret);

    expect(service.verify(JSON.stringify(payload), sig, secret)).toBe(true);
  });
});
