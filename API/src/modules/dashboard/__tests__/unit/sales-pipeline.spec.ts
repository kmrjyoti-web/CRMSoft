import { PipelineService } from '../../services/pipeline.service';

describe('Sales Pipeline & Funnel', () => {
  let prisma: any;
  let service: PipelineService;

  beforeEach(() => {
    prisma = {
      lead: {
        groupBy: jest.fn().mockResolvedValue([
          { status: 'NEW', _count: 20, _sum: { expectedValue: 100000 } },
          { status: 'VERIFIED', _count: 15, _sum: { expectedValue: 80000 } },
          { status: 'IN_PROGRESS', _count: 10, _sum: { expectedValue: 60000 } },
          { status: 'WON', _count: 5, _sum: { expectedValue: 200000 } },
          { status: 'LOST', _count: 3, _sum: { expectedValue: 30000 } },
        ]),
        count: jest.fn().mockResolvedValue(10),
      },
    };
    service = new PipelineService(prisma);
  });

  it('should return all 10 stages with probability weights', async () => {
    const result = await service.getSalesPipeline({});
    expect(result.stages).toHaveLength(10);
    const newStage = result.stages.find(s => s.status === 'NEW');
    expect(newStage!.probability).toBe(10);
    const wonStage = result.stages.find(s => s.status === 'WON');
    expect(wonStage!.probability).toBe(100);
  });

  it('should calculate weighted pipeline values', async () => {
    const result = await service.getSalesPipeline({});
    const newStage = result.stages.find(s => s.status === 'NEW');
    expect(newStage!.weightedValue).toBe(Math.round(100000 * 10 / 100));
    expect(result.summary).toHaveProperty('weightedPipelineValue');
    expect(result.summary).toHaveProperty('totalPipelineValue');
  });

  it('should include stage transitions with conversion rates', async () => {
    const result = await service.getSalesPipeline({});
    expect(result.stageTransitions).toBeDefined();
    expect(Array.isArray(result.stageTransitions)).toBe(true);
    if (result.stageTransitions.length > 0) {
      expect(result.stageTransitions[0]).toHaveProperty('from');
      expect(result.stageTransitions[0]).toHaveProperty('to');
      expect(result.stageTransitions[0]).toHaveProperty('conversionRate');
    }
  });

  it('should calculate sales funnel with drop-off', async () => {
    prisma.lead.count
      .mockResolvedValueOnce(100)  // totalLeads
      .mockResolvedValueOnce(80)   // contacted
      .mockResolvedValueOnce(60)   // qualified
      .mockResolvedValueOnce(40)   // demoGiven
      .mockResolvedValueOnce(30)   // quotationSent
      .mockResolvedValueOnce(20)   // negotiation
      .mockResolvedValueOnce(10);  // won
    const result = await service.getSalesFunnel({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
    });
    expect(result.funnel).toHaveLength(7);
    expect(result.funnel[0].stage).toBe('Total Leads Created');
    expect(result.funnel[0].count).toBe(100);
    expect(result.overallConversion).toBe(10);
    expect(result.funnel[1].dropOff).toBeDefined();
  });

  it('should identify biggest leak point in funnel', async () => {
    prisma.lead.count
      .mockResolvedValueOnce(100)  // totalLeads
      .mockResolvedValueOnce(80)   // contacted — drop 20%
      .mockResolvedValueOnce(30)   // qualified — drop 62.5% (biggest)
      .mockResolvedValueOnce(25)   // demoGiven
      .mockResolvedValueOnce(20)   // quotationSent
      .mockResolvedValueOnce(15)   // negotiation
      .mockResolvedValueOnce(10);  // won
    const result = await service.getSalesFunnel({
      dateFrom: new Date('2025-01-01'), dateTo: new Date('2025-01-31'),
    });
    expect(result.biggestLeakPoint).toBeDefined();
    expect(result.biggestLeakPoint.dropOff).toBeGreaterThan(0);
  });
});
