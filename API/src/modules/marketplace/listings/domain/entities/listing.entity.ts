export type ListingStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'SOLD_OUT'
  | 'EXPIRED'
  | 'ARCHIVED'
  | 'REJECTED';

export type ListingType = 'PRODUCT' | 'SERVICE' | 'REQUIREMENT' | 'JOB';
export type VisibilityType =
  | 'PUBLIC'
  | 'GEO_TARGETED'
  | 'VERIFIED_ONLY'
  | 'MY_CONTACTS'
  | 'SELECTED_CONTACTS'
  | 'CATEGORY_BASED'
  | 'GRADE_BASED';

export interface ListingProps {
  id: string;
  tenantId: string;
  authorId: string;
  listingType: ListingType;
  title: string;
  description?: string;
  shortDescription?: string;
  categoryId?: string;
  subcategoryId?: string;
  mediaUrls?: any[];
  currency?: string;
  basePrice?: number;
  mrp?: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  hsnCode?: string;
  gstRate?: number;
  trackInventory?: boolean;
  stockAvailable?: number;
  visibility?: VisibilityType;
  visibilityConfig?: any;
  status?: ListingStatus;
  publishAt?: Date;
  expiresAt?: Date;
  attributes?: Record<string, any>;
  keywords?: string[];
  shippingConfig?: any;
  requirementConfig?: any;
  createdById: string;
}

export class ListingEntity {
  readonly id: string;
  readonly tenantId: string;
  readonly authorId: string;
  readonly listingType: ListingType;
  title: string;
  description?: string;
  shortDescription?: string;
  categoryId?: string;
  subcategoryId?: string;
  mediaUrls: any[];
  currency: string;
  basePrice: number;
  mrp?: number;
  minOrderQty: number;
  maxOrderQty?: number;
  hsnCode?: string;
  gstRate?: number;
  trackInventory: boolean;
  stockAvailable: number;
  visibility: VisibilityType;
  visibilityConfig?: any;
  status: ListingStatus;
  publishAt?: Date;
  expiresAt?: Date;
  publishedAt?: Date;
  attributes: Record<string, any>;
  keywords: string[];
  shippingConfig?: any;
  requirementConfig?: any;
  viewCount: number;
  enquiryCount: number;
  orderCount: number;
  reviewCount: number;
  avgRating?: number;
  isFeatured: boolean;
  featuredUntil?: Date;
  slug?: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  readonly createdById: string;
  updatedById?: string;

  private constructor(props: ListingProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.authorId = props.authorId;
    this.listingType = props.listingType;
    this.title = props.title;
    this.description = props.description;
    this.shortDescription = props.shortDescription;
    this.categoryId = props.categoryId;
    this.subcategoryId = props.subcategoryId;
    this.mediaUrls = props.mediaUrls || [];
    this.currency = props.currency || 'INR';
    this.basePrice = props.basePrice || 0;
    this.mrp = props.mrp;
    this.minOrderQty = props.minOrderQty || 1;
    this.maxOrderQty = props.maxOrderQty;
    this.hsnCode = props.hsnCode;
    this.gstRate = props.gstRate;
    this.trackInventory = props.trackInventory !== false;
    this.stockAvailable = props.stockAvailable || 0;
    this.visibility = props.visibility || 'PUBLIC';
    this.visibilityConfig = props.visibilityConfig;
    this.status = props.status || 'DRAFT';
    this.publishAt = props.publishAt;
    this.expiresAt = props.expiresAt;
    this.attributes = props.attributes || {};
    this.keywords = props.keywords || [];
    this.shippingConfig = props.shippingConfig;
    this.requirementConfig = props.requirementConfig;
    this.viewCount = 0;
    this.enquiryCount = 0;
    this.orderCount = 0;
    this.reviewCount = 0;
    this.isFeatured = false;
    this.isActive = true;
    this.isDeleted = false;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.createdById = props.createdById;
  }

  static create(props: ListingProps): ListingEntity {
    return new ListingEntity(props);
  }

  publish(): void {
    if (this.status !== 'DRAFT' && this.status !== 'SCHEDULED') {
      throw new Error(`Cannot publish listing in status: ${this.status}`);
    }
    this.status = 'ACTIVE';
    this.publishedAt = new Date();
  }

  pause(): void {
    if (this.status !== 'ACTIVE') {
      throw new Error('Can only pause active listings');
    }
    this.status = 'PAUSED';
  }

  archive(): void {
    this.status = 'ARCHIVED';
    this.isActive = false;
  }

  canBePublished(): boolean {
    return this.status === 'DRAFT' || this.status === 'SCHEDULED';
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  toPlainObject() {
    return { ...this };
  }
}
