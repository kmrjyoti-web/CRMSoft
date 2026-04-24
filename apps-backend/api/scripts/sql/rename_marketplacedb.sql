-- marketplacedb renames (13 tables)
BEGIN;
ALTER TABLE "mkt_listings" RENAME TO "gv_mkt_listings";
ALTER TABLE "mkt_listing_price_tiers" RENAME TO "gv_mkt_listing_price_tiers";
ALTER TABLE "mkt_posts" RENAME TO "gv_mkt_posts";
ALTER TABLE "mkt_post_engagements" RENAME TO "gv_mkt_post_engagements";
ALTER TABLE "mkt_post_comments" RENAME TO "gv_mkt_post_comments";
ALTER TABLE "mkt_offers" RENAME TO "gv_mkt_offers";
ALTER TABLE "mkt_offer_redemptions" RENAME TO "gv_mkt_offer_redemptions";
ALTER TABLE "mkt_reviews" RENAME TO "gv_mkt_reviews";
ALTER TABLE "mkt_enquiries" RENAME TO "gv_mkt_enquiries";
ALTER TABLE "mkt_analytics_events" RENAME TO "gv_mkt_analytics_events";
ALTER TABLE "mkt_analytics_summaries" RENAME TO "gv_mkt_analytics_summaries";
ALTER TABLE "mkt_follows" RENAME TO "gv_mkt_follows";
ALTER TABLE "mkt_requirement_quotes" RENAME TO "gv_mkt_requirement_quotes";
COMMIT;