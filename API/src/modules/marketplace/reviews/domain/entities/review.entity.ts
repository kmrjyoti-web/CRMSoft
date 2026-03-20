export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';

export interface ReviewProps {
  id: string;
  tenantId: string;
  listingId: string;
  reviewerId: string;
  rating: number;
  title?: string;
  body?: string;
  mediaUrls?: any[];
  isVerifiedPurchase?: boolean;
  orderId?: string;
  status?: ReviewStatus;
}

export class ReviewEntity {
  readonly id: string;
  readonly tenantId: string;
  readonly listingId: string;
  readonly reviewerId: string;
  rating: number;
  title?: string;
  body?: string;
  mediaUrls: any[];
  isVerifiedPurchase: boolean;
  orderId?: string;
  status: ReviewStatus;
  moderatorId?: string;
  moderationNote?: string;
  helpfulCount: number;
  reportCount: number;
  sellerResponse?: string;
  sellerRespondedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  private constructor(props: ReviewProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.listingId = props.listingId;
    this.reviewerId = props.reviewerId;
    this.rating = props.rating;
    this.title = props.title;
    this.body = props.body;
    this.mediaUrls = props.mediaUrls || [];
    this.isVerifiedPurchase = props.isVerifiedPurchase || false;
    this.orderId = props.orderId;
    // Auto-approve verified purchases, otherwise pending
    this.status = props.status ?? (props.isVerifiedPurchase ? 'APPROVED' : 'PENDING');
    this.helpfulCount = 0;
    this.reportCount = 0;
    this.isDeleted = false;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(props: ReviewProps): ReviewEntity {
    if (props.rating < 1 || props.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    return new ReviewEntity(props);
  }

  approve(moderatorId: string, note?: string): void {
    this.status = 'APPROVED';
    this.moderatorId = moderatorId;
    this.moderationNote = note;
  }

  reject(moderatorId: string, note: string): void {
    this.status = 'REJECTED';
    this.moderatorId = moderatorId;
    this.moderationNote = note;
  }

  flag(moderatorId: string, note: string): void {
    this.status = 'FLAGGED';
    this.moderatorId = moderatorId;
    this.moderationNote = note;
  }

  isApproved(): boolean {
    return this.status === 'APPROVED';
  }
}
