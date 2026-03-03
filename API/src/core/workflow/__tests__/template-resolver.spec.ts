import { TemplateResolverService } from '../template-resolver.service';
import { WorkflowActionContext } from '../interfaces/action-handler.interface';

describe('TemplateResolverService', () => {
  let service: TemplateResolverService;
  const context: WorkflowActionContext = {
    instanceId: 'inst-1',
    entityType: 'LEAD',
    entityId: 'lead-1',
    entity: { name: 'TechCorp', city: 'Mumbai', owner: { name: 'Raj Patel' } },
    performer: { id: 'user-1', firstName: 'Raj', lastName: 'Patel', email: 'raj@crm.com' },
    currentState: { name: 'In Progress', code: 'IN_PROGRESS' },
    previousState: { name: 'New', code: 'NEW' },
    timestamp: new Date('2025-01-15T10:00:00Z'),
  };

  beforeEach(() => {
    service = new TemplateResolverService();
  });

  it('should resolve simple template variables', () => {
    expect(service.resolve('Lead: {{entity.name}} in {{entity.city}}', context)).toBe('Lead: TechCorp in Mumbai');
    expect(service.resolve('Done by {{performer.firstName}} {{performer.lastName}}', context)).toBe('Done by Raj Patel');
    expect(service.resolve('State: {{currentState.name}}', context)).toBe('State: In Progress');
    expect(service.resolve('From: {{previousState.code}}', context)).toBe('From: NEW');
  });

  it('should resolve timestamp and nested object paths', () => {
    expect(service.resolve('Time: {{timestamp}}', context)).toBe('Time: 2025-01-15T10:00:00.000Z');
    expect(service.resolve('Owner: {{entity.owner.name}}', context)).toBe('Owner: Raj Patel');
  });

  it('should return empty string for missing variables and unknown roots', () => {
    expect(service.resolve('Value: {{entity.nonexistent}}', context)).toBe('Value: ');
    expect(service.resolve('Bad: {{unknown.field}}', context)).toBe('Bad: ');
  });

  it('should recursively resolve objects and arrays', () => {
    const obj = {
      subject: 'Lead {{entity.name}} moved to {{currentState.code}}',
      recipients: ['{{performer.email}}'],
      metadata: { actor: '{{performer.id}}', count: 42 },
    };
    const resolved = service.resolveObject(obj, context);
    expect(resolved.subject).toBe('Lead TechCorp moved to IN_PROGRESS');
    expect(resolved.recipients[0]).toBe('raj@crm.com');
    expect(resolved.metadata.actor).toBe('user-1');
    expect(resolved.metadata.count).toBe(42);
  });
});
