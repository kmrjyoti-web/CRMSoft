export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'CRMSoft Vendor Portal';

export const LISTING_TYPES = [
  { value: 'PRODUCT', label: 'Product' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'NEW_LAUNCH', label: 'New Launch' },
  { value: 'LAUNCHING_OFFER', label: 'Launch Offer' },
  { value: 'REQUIREMENT', label: 'Requirement' },
  { value: 'JOB', label: 'Job' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const LISTING_STATUS = [
  { value: 'LST_DRAFT', label: 'Draft', color: 'gray' },
  { value: 'LST_SCHEDULED', label: 'Scheduled', color: 'blue' },
  { value: 'LST_ACTIVE', label: 'Active', color: 'green' },
  { value: 'LST_EXPIRED', label: 'Expired', color: 'orange' },
  { value: 'LST_SOLD_OUT', label: 'Sold Out', color: 'red' },
  { value: 'LST_DEACTIVATED', label: 'Deactivated', color: 'gray' },
  { value: 'LST_ARCHIVED', label: 'Archived', color: 'gray' },
] as const;

export const ORDER_STATUS = [
  { value: 'MKT_PENDING', label: 'Pending', color: 'yellow' },
  { value: 'MKT_CONFIRMED', label: 'Confirmed', color: 'blue' },
  { value: 'MKT_PROCESSING', label: 'Processing', color: 'indigo' },
  { value: 'MKT_SHIPPED', label: 'Shipped', color: 'purple' },
  { value: 'MKT_DELIVERED', label: 'Delivered', color: 'green' },
  { value: 'MKT_CANCELLED', label: 'Cancelled', color: 'red' },
  { value: 'MKT_RETURNED', label: 'Returned', color: 'orange' },
  { value: 'MKT_REFUNDED', label: 'Refunded', color: 'gray' },
] as const;

export const ENQUIRY_STATUS = [
  { value: 'ENQ_NEW', label: 'New', color: 'blue' },
  { value: 'ENQ_RESPONDED', label: 'Responded', color: 'green' },
  { value: 'ENQ_QUOTED', label: 'Quoted', color: 'purple' },
  { value: 'ENQ_NEGOTIATING', label: 'Negotiating', color: 'yellow' },
  { value: 'ENQ_CONVERTED', label: 'Converted', color: 'green' },
  { value: 'ENQ_CLOSED', label: 'Closed', color: 'gray' },
  { value: 'ENQ_SPAM', label: 'Spam', color: 'red' },
] as const;

export const POST_TYPES = [
  { value: 'PT_TEXT', label: 'Text' },
  { value: 'PT_IMAGE', label: 'Image' },
  { value: 'PT_VIDEO', label: 'Video' },
  { value: 'PT_PRODUCT_SHARE', label: 'Product Share' },
  { value: 'PT_JOB_POSTING', label: 'Job Posting' },
  { value: 'PT_NEWS', label: 'News' },
  { value: 'PT_ANNOUNCEMENT', label: 'Announcement' },
  { value: 'PT_POLL', label: 'Poll' },
] as const;

export const GST_RATES = [0, 5, 12, 18, 28] as const;

export const VISIBILITY_TYPES = [
  { value: 'VIS_PUBLIC', label: 'Public' },
  { value: 'VIS_VERIFIED_ONLY', label: 'Verified Users Only' },
  { value: 'VIS_MY_CONTACTS', label: 'My Contacts Only' },
  { value: 'VIS_GEO_TARGETED', label: 'Geo Targeted' },
] as const;

export const PAYMENT_STATUS = [
  { value: 'MPAY_PENDING', label: 'Pending', color: 'yellow' },
  { value: 'MPAY_PAID', label: 'Paid', color: 'green' },
  { value: 'MPAY_FAILED', label: 'Failed', color: 'red' },
  { value: 'MPAY_REFUNDED', label: 'Refunded', color: 'gray' },
] as const;
