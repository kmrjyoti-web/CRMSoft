import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../domain-event';

class TestEvent extends DomainEvent {
  constructor(id: string) {
    super(id, 'TestEvent');
  }
}

class TestAggregate extends AggregateRoot {
  constructor(id: string) {
    super();
    this._id = id;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  doSomething(): void {
    this.addDomainEvent(new TestEvent(this._id));
  }
}

describe('AggregateRoot', () => {
  it('should store domain events', () => {
    const agg = new TestAggregate('test-1');
    agg.doSomething();
    expect(agg.getDomainEvents()).toHaveLength(1);
    expect(agg.getDomainEvents()[0].eventName).toBe('TestEvent');
  });

  it('should clear domain events', () => {
    const agg = new TestAggregate('test-1');
    agg.doSomething();
    agg.doSomething();
    expect(agg.getDomainEvents()).toHaveLength(2);
    agg.clearDomainEvents();
    expect(agg.getDomainEvents()).toHaveLength(0);
  });

  it('should track aggregate ID', () => {
    const agg = new TestAggregate('test-1');
    expect(agg.id).toBe('test-1');
  });

  describe('equals()', () => {
    it('should be equal by ID', () => {
      const a = new TestAggregate('id-1');
      const b = new TestAggregate('id-1');
      expect(a.equals(b)).toBe(true);
    });

    it('should not be equal with different ID', () => {
      const a = new TestAggregate('id-1');
      const b = new TestAggregate('id-2');
      expect(a.equals(b)).toBe(false);
    });

    it('should return false for null', () => {
      const a = new TestAggregate('id-1');
      expect(a.equals(null as any)).toBe(false);
    });
  });

  it('should expose createdAt and updatedAt', () => {
    const a = new TestAggregate('id-1');
    expect(a.createdAt).toBeInstanceOf(Date);
    expect(a.updatedAt).toBeInstanceOf(Date);
  });
});

