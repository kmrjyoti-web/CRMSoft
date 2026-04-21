# MarketplaceDB — Deep Documentation

**Schema root:** `Application/backend/prisma/marketplace/v1/`
**Generator output:** `node_modules/@prisma/marketplace-client`
**Env var:** `MARKETPLACE_DATABASE_URL`
**Model count:** 13
**Migration policy:** `prisma migrate deploy` (formal migrations)

---

## Purpose

The social / B2B marketplace side of CRMSoft — listings, posts, offers, reviews, enquiries, follows, and analytics. Tenants use it to publish products and find suppliers/buyers across CRMSoft's network.

**Blast radius:** Medium — marketplace unavailability doesn't stop the core CRM, but does block lead-generation and cross-tenant activity.

**Why separate:** Social / feed-style workloads have a very different read/write profile than transactional CRM data (fan-out reads, engagement counters, follow-graph traversals). Isolation lets us scale independently.

---

## Schema Files (2 files, 513 lines)

| File | Lines | Purpose | Models |
|---|---:|---|---:|
| `_base.prisma` | 144 | Datasource + generator + marketplace enums (ListingStatus, PostType, EngagementType, OfferStatus, EnquiryStatus, ReviewRating, …) | 0 |
| `marketplace.prisma` | 369 | All 13 marketplace models | 13 |

All models are prefixed `Mkt…`.

---

## Full Model List

| Model | Purpose |
|---|---|
| `MktListing` | A product/service listed on the marketplace |
| `MktListingPriceTier` | Volume-tier pricing (e.g., MOQ discounts) |
| `MktPost` | Social post (news, update, showcase) |
| `MktPostEngagement` | Likes, shares, views, saves |
| `MktPostComment` | Threaded comments on posts |
| `MktOffer` | Promotional offer tied to a listing |
| `MktOfferRedemption` | Redemption record when a buyer uses an offer |
| `MktReview` | Rating + review on a listing |
| `MktEnquiry` | Buyer-initiated RFQ on a listing |
| `MktRequirementQuote` | Seller's response to an enquiry |
| `MktFollow` | Tenant-to-tenant follow edge |
| `MktAnalyticsEvent` | Raw event log (impression, click, save, …) |
| `MktAnalyticsSummary` | Pre-aggregated analytics rollups per listing/post |

---

## Key Models (Deeper Detail)

### `MktListing`

- Owned by a tenant (`tenantId` from IdentityDB).
- References a `productId` from WorkingDB (cross-DB resolve).
- May reference a `brandId` (from WhiteLabel or PlatformDB registry) for brand-tagged listings.
- Location fields reference GlobalDB (`countryId`, `stateId`, `cityId`, `pincodeId`).
- Status lifecycle: `DRAFT` → `ACTIVE` → (`EXPIRED` | `INACTIVE`).

### `MktListingPriceTier`

Volume-based pricing (e.g., `1-99 qty: ₹100`, `100-499 qty: ₹95`, `500+: ₹90`). Attached to a listing via FK.

### `MktPost` + `MktPostEngagement` + `MktPostComment`

LinkedIn-style social feed inside the marketplace. Posts can link a listing, a success story, or a general update. Engagements are aggregated into `MktAnalyticsSummary` on a rolling window.

### `MktOffer` + `MktOfferRedemption`

Time-bounded promotions (e.g., "15% off for first 100 buyers"). Enforces redemption caps and tracks attribution back to buyer tenants.

### `MktReview`

Review + rating on a listing. Has moderation flags (`isPublished`, `moderationStatus`). Cross-DB references: `reviewerTenantId`, `reviewerUserId`.

### `MktEnquiry` + `MktRequirementQuote`

- **MktEnquiry:** Buyer sends a "quote me for X" request to a seller.
- **MktRequirementQuote:** Seller's response. Can be converted into a formal `Quotation` in WorkingDB.
- This is the primary lead-generation loop into the CRM.

### `MktFollow`

Directed edge (`followerTenantId` → `followedTenantId`). Powers the feed (show posts from followed tenants) and discovery.

### `MktAnalyticsEvent` + `MktAnalyticsSummary`

- **Event** — raw immutable log of every impression/click/save/share.
- **Summary** — aggregated counts, materialized on a schedule.

Event table grows fast; has partition-friendly indexing on `(listingId, createdAt)`.

---

## Cross-DB Touchpoints

| From MarketplaceDB | To DB | Field(s) |
|---|---|---|
| `MktListing`, `MktPost` | IdentityDB | `tenantId`, `createdById` |
| `MktListing` | WorkingDB | `productId`, `organizationId` |
| `MktReview`, `MktEnquiry` | IdentityDB | `reviewerTenantId` / `buyerTenantId`, `buyerUserId` |
| `MktEnquiry` → WorkingDB | WorkingDB | Eventually creates a `Lead` + optionally a `Quotation` |
| location fields | GlobalDB | `countryId`, `stateId`, `cityId`, `pincodeId` |
| `MktOffer` (if coupon-linked) | PlatformDB | `couponId` |

**Cross-feature:** PlatformDB has its own set of marketplace models (`MarketplaceListing`, `MarketplacePost`, …) that capture the *vendor*-side view (CRMSoft's own records of the marketplace as a product), while MarketplaceDB holds the *live runtime* data. Don't conflate the two — see [`06_PLATFORM_DB.md`](./06_PLATFORM_DB.md).

---

## V5 Integration

- Listings show `brandId` (V5 multi-brand support).
- `verticalData: Json?` on listings carries vertical-specific fields (e.g., tourism: departure date, group size; restaurant: cuisine type, dietary tags).
- Marketplace module enablement per tenant is controlled by PlatformDB `TenantMarketplaceModule`.

---

## Operational Notes

- High read-to-write ratio; feed queries benefit from read replicas.
- Engagement writes can be batched via a queue before hitting the DB.
- Analytics summaries are rebuildable from events (source of truth is the event log).
