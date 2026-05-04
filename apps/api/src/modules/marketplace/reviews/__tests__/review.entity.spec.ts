import { ReviewEntity } from '../domain/entities/review.entity';

describe('ReviewEntity', () => {
  const baseProps = {
    id: 'review-1',
    tenantId: 'tenant-1',
    listingId: 'listing-1',
    reviewerId: 'user-1',
    rating: 4,
  };

  it('should set status to PENDING for non-verified purchases', () => {
    const review = ReviewEntity.create(baseProps);
    expect(review.status).toBe('PENDING');
    expect(review.isVerifiedPurchase).toBe(false);
  });

  it('should auto-approve verified purchase reviews', () => {
    const review = ReviewEntity.create({ ...baseProps, isVerifiedPurchase: true, orderId: 'order-1' });
    expect(review.status).toBe('APPROVED');
    expect(review.isVerifiedPurchase).toBe(true);
  });

  it('should throw for invalid rating', () => {
    expect(() => ReviewEntity.create({ ...baseProps, rating: 6 })).toThrow('Rating must be between 1 and 5');
    expect(() => ReviewEntity.create({ ...baseProps, rating: 0 })).toThrow('Rating must be between 1 and 5');
  });

  it('should approve a pending review', () => {
    const review = ReviewEntity.create(baseProps);
    review.approve('mod-1', 'Looks good');
    expect(review.status).toBe('APPROVED');
    expect(review.moderatorId).toBe('mod-1');
  });

  it('should reject a review', () => {
    const review = ReviewEntity.create(baseProps);
    review.reject('mod-1', 'Inappropriate content');
    expect(review.status).toBe('REJECTED');
  });

  it('should flag a review', () => {
    const review = ReviewEntity.create(baseProps);
    review.flag('mod-1', 'Suspicious content');
    expect(review.status).toBe('FLAGGED');
  });
});
