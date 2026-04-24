import { DuplicateDetectorService } from '../../services/duplicate-detector.service';

describe('DuplicateDetectorService', () => {
  let service: DuplicateDetectorService;
  let prisma: any;
  let fuzzyMatcher: any;

  beforeEach(() => {
    prisma = {
      communication: { findMany: jest.fn().mockResolvedValue([]) },
      organization: { findMany: jest.fn().mockResolvedValue([]) },
      contact: { findMany: jest.fn().mockResolvedValue([]) },
    };
(prisma as any).working = prisma;
    fuzzyMatcher = {
      nameSimilarity: jest.fn().mockReturnValue(0.9),
      companySimilarity: jest.fn().mockReturnValue(0.85),
      levenshteinSimilarity: jest.fn().mockReturnValue(0.8),
      combinedScore: jest.fn().mockReturnValue({ score: 0.88, confidence: 'HIGH', fieldScores: [], matchReason: 'Name 90% similar' }),
    };
    service = new DuplicateDetectorService(prisma, fuzzyMatcher);
  });

  it('should detect in-file duplicates by email', () => {
    const rows = [
      { rowNumber: 1, mappedData: { email: 'rahul@test.com', firstName: 'Rahul' } },
      { rowNumber: 2, mappedData: { email: 'priya@test.com', firstName: 'Priya' } },
      { rowNumber: 3, mappedData: { email: 'rahul@test.com', firstName: 'Rahul Duplicate' } },
    ];

    const result = service.detectInFileDuplicates(rows, ['email']);
    expect(result.size).toBe(1);
    expect(result.get(3)?.duplicateType).toBe('IN_FILE');
    expect(result.get(3)?.duplicateOfRowNumber).toBe(1);
  });

  it('should detect exact DB duplicates via batch query', async () => {
    prisma.communication.findMany.mockResolvedValue([
      { value: 'rahul@test.com', contactId: 'c1', rawContactId: null },
    ]);

    const rows = [
      { rowNumber: 1, mappedData: { email: 'rahul@test.com' } },
      { rowNumber: 2, mappedData: { email: 'new@test.com' } },
    ];

    const result = await service.detectExactDbDuplicates(rows, ['email'], 'CONTACT');
    expect(result.size).toBe(1);
    expect(result.get(1)?.duplicateType).toBe('EXACT_DB');
    expect(result.get(1)?.duplicateOfEntityId).toBe('c1');
  });

  it('should detect fuzzy DB duplicates with score', async () => {
    prisma.contact.findMany.mockResolvedValue([
      { id: 'c1', firstName: 'Rahul', lastName: 'Sharma', organization: { name: 'ABC Corp' } },
    ]);

    const rows = [
      { rowNumber: 1, mappedData: { firstName: 'Rahul', lastName: 'K Sharma' } },
    ];

    const result = await service.detectFuzzyDbDuplicates(rows, ['firstName+lastName'], 'CONTACT', 0.85);
    expect(result.size).toBe(1);
    expect(result.get(1)?.duplicateType).toBe('FUZZY_DB');
    expect(result.get(1)?.fuzzyMatchScore).toBe(0.88);
  });

  it('should use batch queries not per-row', async () => {
    const rows = [
      { rowNumber: 1, mappedData: { email: 'a@test.com' } },
      { rowNumber: 2, mappedData: { email: 'b@test.com' } },
      { rowNumber: 3, mappedData: { email: 'c@test.com' } },
    ];

    await service.detectExactDbDuplicates(rows, ['email'], 'CONTACT');
    // Only one batch query, not 3 individual queries
    expect(prisma.communication.findMany).toHaveBeenCalledTimes(1);
  });

  it('should return empty map when no rows are provided', async () => {
    const result = await service.detectExactDbDuplicates([], ['email'], 'CONTACT');
    expect(result.size).toBe(0);
    expect(prisma.communication.findMany).not.toHaveBeenCalled();
  });
});
