import { ProfileMatcherService } from '../../services/profile-matcher.service';

describe('ProfileMatcherService', () => {
  let service: ProfileMatcherService;
  const mockProfile = {
    id: 'p1',
    name: 'Just Dial Contacts',
    fieldMapping: [
      { sourceHeader: 'Company Name', targetField: 'organization.name', aliases: ['company', 'comp name'] },
      { sourceHeader: 'Contact Person', targetField: 'firstName', aliases: ['name', 'contact name'] },
      { sourceHeader: 'Mobile No', targetField: 'mobile', aliases: ['mobile', 'mob', 'cell'] },
      { sourceHeader: 'Email Id', targetField: 'email', aliases: ['email', 'e-mail'] },
      { sourceHeader: 'City', targetField: 'city', aliases: ['town'] },
    ],
  };

  beforeEach(() => {
    service = new ProfileMatcherService(null as any);
  });

  it('should return FULL_MATCH when ≥90% headers match', () => {
    const headers = ['Company Name', 'Contact Person', 'Mobile No', 'Email Id', 'City'];
    const result = service.matchHeaders(headers, mockProfile);

    expect(result.status).toBe('FULL_MATCH');
    expect(result.matchScore).toBe(100);
    expect(result.matchedCount).toBe(5);
  });

  it('should return PARTIAL when 50-89% headers match', () => {
    const headers = ['Company Name', 'Contact Person', 'Mobile No', 'Some Other'];
    const result = service.matchHeaders(headers, mockProfile);

    expect(result.status).toBe('PARTIAL');
    expect(result.matchScore).toBe(60); // 3 out of 5 = 60%
  });

  it('should match aliases (mob → Mobile No)', () => {
    const headers = ['company', 'name', 'mob', 'email', 'city'];
    const result = service.matchHeaders(headers, mockProfile);

    expect(result.status).toBe('FULL_MATCH');
    expect(result.matchScore).toBe(100);
  });

  it('should return NO_MATCH for unrelated headers', () => {
    const headers = ['Foo', 'Bar', 'Baz'];
    const result = service.matchHeaders(headers, mockProfile);

    expect(result.status).toBe('NO_MATCH');
    expect(result.matchScore).toBeLessThan(50);
  });

  it('should build resolvedMapping with matched headers', () => {
    const headers = ['Company Name', 'Contact Person', 'Mobile No', 'Email Id', 'City'];
    const result = service.matchHeaders(headers, mockProfile);

    const mapped = result.resolvedMapping.filter((m: any) => m.matched);
    expect(mapped).toHaveLength(5);
    expect(mapped[0].matchedHeader).toBe('Company Name');
  });
});
