import { CronParserService } from '../services/cron-parser.service';

describe('CronParserService', () => {
  let service: CronParserService;

  beforeEach(() => {
    service = new CronParserService();
  });

  it('should validate a correct cron expression', () => {
    expect(service.isValid('*/5 * * * *')).toBe(true);
    expect(service.isValid('0 0 * * *')).toBe(true);
    expect(service.isValid('0 9 * * 1')).toBe(true);
  });

  it('should reject an invalid cron expression', () => {
    expect(service.isValid('bad-cron')).toBe(false);
    expect(service.isValid('x y z a b')).toBe(false);
  });

  it('should calculate the next run time', () => {
    const nextRun = service.getNextRun('*/5 * * * *');
    expect(nextRun).toBeInstanceOf(Date);
    expect(nextRun.getTime()).toBeGreaterThan(Date.now());
  });

  it('should calculate multiple upcoming runs', () => {
    const runs = service.getNextRuns('0 * * * *', 5);
    expect(runs).toHaveLength(5);
    for (let i = 1; i < runs.length; i++) {
      expect(runs[i].getTime()).toBeGreaterThan(runs[i - 1].getTime());
    }
  });

  it('should describe "every N minutes" expression', () => {
    expect(service.describe('*/5 * * * *')).toBe('Every 5 minutes');
    expect(service.describe('*/10 * * * *')).toBe('Every 10 minutes');
  });

  it('should describe "every N hours" expression', () => {
    expect(service.describe('0 */2 * * *')).toBe('Every 2 hours');
    expect(service.describe('0 */6 * * *')).toBe('Every 6 hours');
  });

  it('should describe "daily at HH:00" expression', () => {
    expect(service.describe('0 9 * * *')).toBe('Daily at 09:00');
    expect(service.describe('0 0 * * *')).toBe('Daily at 00:00');
  });
});
