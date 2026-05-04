import { FuzzyMatcherService } from '../../services/fuzzy-matcher.service';

describe('FuzzyMatcherService', () => {
  let service: FuzzyMatcherService;

  beforeEach(() => {
    service = new FuzzyMatcherService();
  });

  it('should compute Levenshtein similarity for identical strings', () => {
    expect(service.levenshteinSimilarity('hello', 'hello')).toBe(1);
  });

  it('should compute Levenshtein similarity for similar strings', () => {
    const score = service.levenshteinSimilarity('kitten', 'sitting');
    expect(score).toBeGreaterThan(0.4);
    expect(score).toBeLessThan(0.8);
  });

  it('should handle name similarity with Mr/Mrs prefix', () => {
    const score = service.nameSimilarity('Mr Rahul Sharma', 'Rahul Sharma');
    expect(score).toBe(1);
  });

  it('should handle name initials matching', () => {
    const score = service.nameSimilarity('R Kumar', 'Rajesh Kumar');
    expect(score).toBeGreaterThan(0.7);
  });

  it('should handle company similarity removing Ltd/Pvt', () => {
    const score = service.companySimilarity('Reliance Industries Pvt Ltd', 'Reliance Industries');
    expect(score).toBeGreaterThan(0.6);
  });

  it('should detect phone partial match on last 8 digits', () => {
    expect(service.phonePartialMatch('+919876543210', '9876543210')).toBe(true);
    expect(service.phonePartialMatch('1234567890', '0987654321')).toBe(false);
  });

  it('should compute combined weighted score with confidence', () => {
    const result = service.combinedScore([
      { field: 'firstName+lastName', importValue: 'Rahul Sharma', dbValue: 'Rahul K Sharma', similarity: 0.92 },
      { field: 'organization.name', importValue: 'ABC Corp', dbValue: 'ABC Corporation', similarity: 0.85 },
      { field: 'city', importValue: 'Mumbai', dbValue: 'Mumbai', similarity: 1.0 },
    ]);

    expect(result.score).toBeGreaterThan(0.85);
    expect(['HIGH', 'EXACT']).toContain(result.confidence);
    expect(result.fieldScores).toHaveLength(3);
  });

  it('should return LOW confidence for weak matches', () => {
    const result = service.combinedScore([
      { field: 'firstName+lastName', importValue: 'John', dbValue: 'James', similarity: 0.5 },
    ]);

    expect(result.confidence).toBe('LOW');
  });

  describe('edge cases', () => {
    it('should return 0 similarity for completely different strings', () => {
      const score = service.levenshteinSimilarity('aaaa', 'zzzz');
      expect(score).toBeLessThan(0.5);
    });

    it('should return 0 similarity for empty string vs non-empty', () => {
      const score = service.levenshteinSimilarity('', 'hello');
      expect(score).toBe(0);
    });

    it('should return LOW confidence when no field scores provided', () => {
      const result = service.combinedScore([]);
      expect(result.score).toBe(0);
      expect(result.confidence).toBe('LOW');
    });
  });
});
