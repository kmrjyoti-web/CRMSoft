import { JobRegistryService, ICronJobHandler, CronJobResult } from '../services/job-registry.service';

class MockHandler implements ICronJobHandler {
  readonly jobCode: string;
  constructor(code: string) {
    this.jobCode = code;
  }
  async execute(): Promise<CronJobResult> {
    return { recordsProcessed: 1 };
  }
}

describe('JobRegistryService', () => {
  let service: JobRegistryService;

  beforeEach(() => {
    service = new JobRegistryService();
  });

  it('should register and retrieve a handler', () => {
    const handler = new MockHandler('TEST_JOB');
    service.register(handler);

    const found = service.getHandler('TEST_JOB');
    expect(found).toBe(handler);
    expect(found?.jobCode).toBe('TEST_JOB');
  });

  it('should return null for unregistered job code', () => {
    expect(service.getHandler('NON_EXISTENT')).toBeNull();
  });

  it('should list all registered job codes', () => {
    service.register(new MockHandler('JOB_A'));
    service.register(new MockHandler('JOB_B'));
    service.register(new MockHandler('JOB_C'));

    const codes = service.listRegistered();
    expect(codes).toEqual(['JOB_A', 'JOB_B', 'JOB_C']);
  });

  it('should overwrite handler when same jobCode is registered twice', () => {
    const handler1 = new MockHandler('DUPLICATE');
    const handler2 = new MockHandler('DUPLICATE');

    service.register(handler1);
    service.register(handler2);

    expect(service.getHandler('DUPLICATE')).toBe(handler2);
    expect(service.listRegistered()).toHaveLength(1);
  });
});
