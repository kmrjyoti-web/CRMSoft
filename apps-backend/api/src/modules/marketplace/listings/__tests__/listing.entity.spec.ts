import { ListingEntity } from '../domain/entities/listing.entity';

describe('ListingEntity', () => {
  const baseProps = {
    id: 'test-id',
    tenantId: 'tenant-1',
    authorId: 'user-1',
    listingType: 'PRODUCT' as const,
    title: 'Test Product',
    createdById: 'user-1',
  };

  it('should create a listing in DRAFT status by default', () => {
    const listing = ListingEntity.create(baseProps);
    expect(listing.status).toBe('DRAFT');
    expect(listing.isActive).toBe(true);
    expect(listing.isDeleted).toBe(false);
    expect(listing.currency).toBe('INR');
    expect(listing.minOrderQty).toBe(1);
  });

  it('should publish a DRAFT listing', () => {
    const listing = ListingEntity.create(baseProps);
    listing.publish();
    expect(listing.status).toBe('ACTIVE');
    expect(listing.publishedAt).toBeInstanceOf(Date);
  });

  it('should throw when publishing a non-draft listing', () => {
    const listing = ListingEntity.create({ ...baseProps, status: 'ARCHIVED' });
    expect(() => listing.publish()).toThrow('Cannot publish listing in status: ARCHIVED');
  });

  it('should pause an active listing', () => {
    const listing = ListingEntity.create({ ...baseProps, status: 'ACTIVE' });
    listing.pause();
    expect(listing.status).toBe('PAUSED');
  });

  it('should throw when pausing a non-active listing', () => {
    const listing = ListingEntity.create(baseProps);
    expect(() => listing.pause()).toThrow('Can only pause active listings');
  });

  it('should detect expired listings', () => {
    const past = new Date(Date.now() - 1000);
    const listing = ListingEntity.create({ ...baseProps, expiresAt: past });
    expect(listing.isExpired()).toBe(true);
  });

  it('should detect non-expired listings', () => {
    const future = new Date(Date.now() + 100000);
    const listing = ListingEntity.create({ ...baseProps, expiresAt: future });
    expect(listing.isExpired()).toBe(false);
  });
});
