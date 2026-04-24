import { paginate } from '../../types/paginated.type';

describe('paginate()', () => {
  it('should build correct meta for first page', () => {
    const result = paginate(['a', 'b', 'c'], 10, 1, 3);
    expect(result.data).toEqual(['a', 'b', 'c']);
    expect(result.total).toBe(10);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(3);
    expect(result.totalPages).toBe(4);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrevious).toBe(false);
  });

  it('should mark last page correctly', () => {
    const result = paginate(['x'], 7, 4, 2);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrevious).toBe(true);
  });

  it('should handle empty data', () => {
    const result = paginate([], 0, 1, 20);
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrevious).toBe(false);
  });
});
