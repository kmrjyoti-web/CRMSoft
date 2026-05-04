import { GetEntityFiltersHandler } from '../../application/queries/get-entity-filters/get-entity-filters.handler';
import { GetEntityFiltersQuery } from '../../application/queries/get-entity-filters/get-entity-filters.query';

describe('GetEntityFiltersHandler', () => {
  let handler: GetEntityFiltersHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      leadFilter: {
        findMany: jest.fn().mockResolvedValue([
          {
            lookupValue: {
              id: 'v1', value: 'HOT', label: 'Hot Lead', icon: '🔥', color: '#EF4444',
              lookup: { category: 'LEAD_TYPE', displayName: 'Lead Type' },
            },
          },
          {
            lookupValue: {
              id: 'v2', value: 'WEBSITE', label: 'Website', icon: '🌐', color: null,
              lookup: { category: 'LEAD_SOURCE', displayName: 'Lead Source' },
            },
          },
        ]),
      },
    };
    (prisma as any).identity = prisma;
    (prisma as any).platform = prisma;
    handler = new GetEntityFiltersHandler(prisma);
  });

  it('should return filters grouped by category', async () => {
    const result = await handler.execute(new GetEntityFiltersQuery('lead', 'lead-1'));
    expect(result.grouped['LEAD_TYPE'].values).toHaveLength(1);
    expect(result.grouped['LEAD_SOURCE'].values).toHaveLength(1);
    expect(result.flat).toHaveLength(2);
    expect(result.count).toBe(2);
  });

  it('should include category displayName', async () => {
    const result = await handler.execute(new GetEntityFiltersQuery('lead', 'lead-1'));
    expect(result.grouped['LEAD_TYPE'].displayName).toBe('Lead Type');
  });
});
