import { CredentialSchemaService } from '../services/credential-schema.service';

describe('CredentialSchemaService', () => {
  const service = new CredentialSchemaService();

  it('returns correct required fields for SMTP provider', () => {
    const schema = service.getSchema('SMTP');

    expect(schema).not.toBeNull();
    expect(schema!.provider).toBe('SMTP');

    const requiredKeys = schema!.fields
      .filter((f) => f.required)
      .map((f) => f.key);

    expect(requiredKeys).toContain('host');
    expect(requiredKeys).toContain('port');
    expect(requiredKeys).toContain('username');
    expect(requiredKeys).toContain('password');
    expect(requiredKeys).toContain('fromEmail');
  });

  it('validate catches missing required fields', () => {
    const result = service.validate('RAZORPAY', { keyId: 'rzp_test_123' });

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Key Secret');
  });
});
