"use client";
import { useState, useMemo } from "react";
import { Icon, Button } from "@/components/ui";
import { useFeed, useToggleLike, useToggleSave, useAddComment } from "../hooks/useMarketplace";
import type { MarketplacePost, PostType } from "../types/marketplace.types";
import { FeedPostCard } from "./feed/FeedPostCard";
import { FeedOfferCard } from "./feed/FeedOfferCard";
import type { FeedOffer } from "./feed/FeedOfferCard";
import { FeedRequirementCard } from "./feed/FeedRequirementCard";
import type { FeedRequirement } from "./feed/FeedRequirementCard";
import { CreatePostModal } from "./feed/CreatePostModal";

// ── Mock data for offers/requirements not yet in feed API ─────────────────────

const MOCK_OFFERS: FeedOffer[] = [
  {
    id: "o1",
    vendorName: "MedPharma Pvt Ltd",
    vendorInitial: "M",
    vendorColor: "#059669",
    title: "Flash Sale — Bulk Order Discount",
    productName: "Paracetamol 500mg (1000 Strips)",
    originalPrice: 12000,
    offerPrice: 9000,
    discountPercent: 25,
    validUntil: new Date(Date.now() + 5 * 86400000).toISOString(),
    remainingCount: 48,
    likeCount: 34,
    shareCount: 12,
    gradientFrom: "#059669",
    gradientTo: "#0891b2",
  },
  {
    id: "o2",
    vendorName: "TechSupply Co.",
    vendorInitial: "T",
    vendorColor: "#7c3aed",
    title: "End-of-Season Electronics Clearance",
    productName: "Industrial Thermal Printer — Model X200",
    originalPrice: 45000,
    offerPrice: 32000,
    discountPercent: 29,
    validUntil: new Date(Date.now() + 2 * 86400000).toISOString(),
    remainingCount: 8,
    likeCount: 67,
    shareCount: 28,
    gradientFrom: "#7c3aed",
    gradientTo: "#c026d3",
  },
];

const MOCK_REQUIREMENTS: FeedRequirement[] = [
  {
    id: "r1",
    buyerName: "Sunrise Hospitals",
    buyerInitial: "S",
    buyerColor: "#f97316",
    title: "Urgent: IV Fluids & Disposables",
    description:
      "We require bulk supply of 500ml Normal Saline, Ringer's Lactate, and standard disposables for our chain of 3 hospitals across Maharashtra. Looking for reliable, GST-registered vendor with CDSCO approval.",
    category: "Medical Supplies",
    quantity: "5000 units/month",
    budgetMin: 80000,
    budgetMax: 150000,
    deadline: new Date(Date.now() + 4 * 86400000).toISOString(),
    quoteCount: 12,
    likeCount: 23,
    shareCount: 8,
    tags: ["Medical Supplies", "5000 units/month", "IV Fluids", "Maharashtra"],
  },
  {
    id: "r2",
    buyerName: "BuildFast Infra",
    buyerInitial: "B",
    buyerColor: "#0891b2",
    title: "Construction Materials — Q2 Procurement",
    description:
      "Requirement for TMT bars, cement, and binding wire for an upcoming residential project in Pune. Vendor should have valid trade license and experience in bulk supply to construction sites.",
    category: "Construction",
    quantity: "200 MT",
    budgetMin: 500000,
    budgetMax: 900000,
    deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
    quoteCount: 7,
    likeCount: 15,
    shareCount: 5,
    tags: ["Construction", "200 MT", "Pune", "TMT Bars"],
  },
];

// ── Filter tabs ───────────────────────────────────────────────────────────────

type FeedFilter = "ALL" | "POSTS" | "OFFERS" | "REQUIREMENTS" | "VIDEOS" | "IMAGES";

const FILTER_TABS: { value: FeedFilter; label: string; icon: string }[] = [
  { value: "ALL", label: "All", icon: "layout-grid" },
  { value: "POSTS", label: "Posts", icon: "type" },
  { value: "OFFERS", label: "Offers", icon: "tag" },
  { value: "REQUIREMENTS", label: "Requirements", icon: "search" },
  { value: "VIDEOS", label: "Videos", icon: "video" },
  { value: "IMAGES", label: "Images", icon: "image" },
];

// ── Trending topics & suggested vendors ──────────────────────────────────────

const TRENDING_TOPICS = [
  { label: "#pharma2026", count: "2.4K posts" },
  { label: "#bulkprocurement", count: "1.8K posts" },
  { label: "#GSTinvoice", count: "1.2K posts" },
  { label: "#medicaldevices", count: "980 posts" },
  { label: "#MSMEsupplier", count: "760 posts" },
];

const SUGGESTED_VENDORS = [
  { name: "Cipla Pharma", initial: "C", color: "#4f46e5", category: "Pharmaceuticals", followers: "1.2K" },
  { name: "Tata Projects", initial: "T", color: "#0891b2", category: "Construction & Infra", followers: "3.4K" },
  { name: "Reliance Retail", initial: "R", color: "#dc2626", category: "FMCG & Retail", followers: "8.7K" },
];

const MARKET_PULSE = [
  { label: "Active Listings", value: "12,480", icon: "list", color: "#4f46e5", bg: "#eff6ff" },
  { label: "Open Requirements", value: "3,210", icon: "search", color: "#f97316", bg: "#fff7ed" },
  { label: "Live Offers", value: "847", icon: "tag", color: "#059669", bg: "#f0fdf4" },
];

// ── Feed item type ────────────────────────────────────────────────────────────

type FeedItem =
  | { type: "post"; data: MarketplacePost }
  | { type: "offer"; data: FeedOffer }
  | { type: "requirement"; data: FeedRequirement };

// ── Main component ────────────────────────────────────────────────────────────

export function MarketFeed() {
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("ALL");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: feedData, isLoading } = useFeed({ page: 1, limit: 20 });
  const { mutate: toggleLike } = useToggleLike();
  const { mutate: toggleSave } = useToggleSave();
  const { mutate: addComment } = useAddComment();

  const posts = useMemo<MarketplacePost[]>(() => {
    const nested = (feedData as { data?: { data?: MarketplacePost[] } | MarketplacePost[] })?.data;
    if (!nested) return [];
    if (Array.isArray(nested)) return nested;
    const withData = nested as { data?: MarketplacePost[] };
    return withData.data ?? [];
  }, [feedData]);

  // Build interleaved feed: posts + offers + requirements
  const feedItems = useMemo<FeedItem[]>(() => {
    const postItems: FeedItem[] = posts.map((p) => ({ type: "post", data: p }));

    if (activeFilter === "POSTS") return postItems;
    if (activeFilter === "OFFERS") return MOCK_OFFERS.map((o) => ({ type: "offer", data: o }));
    if (activeFilter === "REQUIREMENTS") return MOCK_REQUIREMENTS.map((r) => ({ type: "requirement", data: r }));
    if (activeFilter === "VIDEOS")
      return postItems.filter((i) => i.type === "post" && i.data.postType === "VIDEO");
    if (activeFilter === "IMAGES")
      return postItems.filter((i) => i.type === "post" && i.data.postType === "IMAGE");

    // ALL: interleave offers and requirements into the post stream
    const items: FeedItem[] = [];
    const allPosts = [...postItems];

    // If no real feed posts yet, add some placeholder mock posts
    if (allPosts.length === 0) {
      const mockPosts: MarketplacePost[] = [
        {
          id: "mp1", tenantId: "t1", authorId: "auth1", postType: "TEXT",
          content: "Excited to announce our new bulk supply partnership with leading hospitals across Maharashtra! We now offer next-day delivery for all critical medicines. Reach out for exclusive pricing.",
          mediaUrls: [], linkedListingId: undefined, linkedOfferId: undefined, rating: undefined,
          visibility: "PUBLIC", status: "ACTIVE", publishAt: undefined, expiresAt: undefined,
          publishedAt: new Date(Date.now() - 3600000).toISOString(), viewCount: 1240,
          likeCount: 48, commentCount: 12, shareCount: 7, saveCount: 5,
          hashtags: ["pharma", "bulksupply", "Maharashtra"], isActive: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date().toISOString(),
        },
        {
          id: "mp2", tenantId: "t1", authorId: "auth2", postType: "PRODUCT_SHARE",
          content: "Introducing our new range of eco-friendly packaging materials — 100% biodegradable, GMP-certified. Perfect for pharmaceutical and food industry applications.",
          mediaUrls: [], linkedListingId: "list1", linkedOfferId: undefined, rating: undefined,
          visibility: "PUBLIC", status: "ACTIVE", publishAt: undefined, expiresAt: undefined,
          publishedAt: new Date(Date.now() - 7200000).toISOString(), viewCount: 890,
          likeCount: 31, commentCount: 8, shareCount: 15, saveCount: 11,
          hashtags: ["packaging", "ecoFriendly", "GMP"], isActive: true,
          createdAt: new Date(Date.now() - 7200000).toISOString(), updatedAt: new Date().toISOString(),
        },
        {
          id: "mp3", tenantId: "t1", authorId: "auth3", postType: "ANNOUNCEMENT",
          content: "We are now ISO 9001:2015 certified! This milestone reflects our commitment to quality management and continuous improvement. Thank you to all our partners and customers for your trust.",
          mediaUrls: [], visibility: "PUBLIC", status: "ACTIVE", publishAt: undefined, expiresAt: undefined,
          publishedAt: new Date(Date.now() - 86400000).toISOString(), viewCount: 2100,
          likeCount: 120, commentCount: 34, shareCount: 56, saveCount: 28,
          hashtags: ["ISO9001", "QualityCertified", "Milestone"], isActive: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString(),
        },
        {
          id: "mp4", tenantId: "t1", authorId: "auth4", postType: "VIDEO",
          content: "Watch our 2-minute factory tour to see how we maintain stringent quality standards at every step of our manufacturing process.",
          mediaUrls: [{ type: "VIDEO", url: "/placeholder.mp4" }],
          visibility: "PUBLIC", status: "ACTIVE", publishAt: undefined, expiresAt: undefined,
          publishedAt: new Date(Date.now() - 172800000).toISOString(), viewCount: 3400,
          likeCount: 87, commentCount: 22, shareCount: 41, saveCount: 16,
          hashtags: ["factorytour", "manufacturing", "quality"], isActive: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date().toISOString(),
        },
      ];
      mockPosts.forEach((p) => allPosts.push({ type: "post", data: p }));
    }

    // Interleave: offer after post[1], requirement after post[3]
    allPosts.forEach((item, idx) => {
      items.push(item);
      if (idx === 1 && MOCK_OFFERS[0]) items.push({ type: "offer", data: MOCK_OFFERS[0] });
      if (idx === 3 && MOCK_REQUIREMENTS[0]) items.push({ type: "requirement", data: MOCK_REQUIREMENTS[0] });
      if (idx === 5 && MOCK_OFFERS[1]) items.push({ type: "offer", data: MOCK_OFFERS[1] });
      if (idx === 7 && MOCK_REQUIREMENTS[1]) items.push({ type: "requirement", data: MOCK_REQUIREMENTS[1] });
    });

    if (allPosts.length === 0) {
      MOCK_OFFERS.forEach((o) => items.push({ type: "offer", data: o }));
      MOCK_REQUIREMENTS.forEach((r) => items.push({ type: "requirement", data: r }));
    }

    return items;
  }, [posts, activeFilter]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f1f5f9",
      }}
    >
      {/* Top filter bar */}
      <div
        style={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #e2e8f0",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Filter tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, overflowX: "auto" }}>
            {FILTER_TABS.map((tab) => {
              const active = activeFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "14px 16px",
                    background: "none",
                    border: "none",
                    borderBottom: `2px solid ${active ? "#4f46e5" : "transparent"}`,
                    color: active ? "#4f46e5" : "#64748b",
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}
                >
                  <Icon
                    name={tab.icon as Parameters<typeof Icon>[0]["name"]}
                    size={14}
                    color={active ? "#4f46e5" : "#94a3b8"}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Create post button */}
          <button
            onClick={() => setCreateModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 18px",
              backgroundColor: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4338ca")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4f46e5")}
          >
            <Icon name="plus" size={15} color="#fff" />
            Create Post
          </button>
        </div>
      </div>

      {/* 3-column layout */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "24px",
          display: "flex",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        {/* ── Left panel ──────────────────────────────────────────────────── */}
        <aside
          style={{
            width: 240,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "sticky",
            top: 60,
          }}
        >
          {/* Profile card */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            {/* Cover banner */}
            <div
              style={{
                height: 60,
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              }}
            />
            <div style={{ padding: "0 16px 16px", textAlign: "center" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  backgroundColor: "#4f46e5",
                  border: "3px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: 700,
                  margin: "-26px auto 10px",
                  boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
                }}
              >
                Y
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>Your Network</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>CRM Marketplace</div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 20,
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>248</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase" }}>Followers</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>183</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase" }}>Following</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: "12px 8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            {[
              { label: "My Posts", icon: "file-text", color: "#4f46e5" },
              { label: "My Offers", icon: "tag", color: "#059669" },
              { label: "Saved", icon: "bookmark", color: "#d97706" },
              { label: "Requirements", icon: "search", color: "#f97316" },
            ].map(({ label, icon, color }) => (
              <button
                key={label}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  background: "none",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#374151",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    backgroundColor: `${color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={14} color={color} />
                </div>
                {label}
              </button>
            ))}

            <div style={{ padding: "10px 12px 4px" }}>
              <button
                style={{
                  width: "100%",
                  padding: "9px 14px",
                  backgroundColor: "#fff",
                  color: "#4f46e5",
                  border: "1.5px solid #c7d2fe",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
              >
                <Icon name="user-plus" size={14} color="#4f46e5" />
                Follow More
              </button>
            </div>
          </div>
        </aside>

        {/* ── Center feed ────────────────────────────────────────────────── */}
        <main style={{ flex: 1, minWidth: 0, maxWidth: 680 }}>
          {/* Create post bar */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "#4f46e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              Y
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              style={{
                flex: 1,
                padding: "10px 16px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 24,
                backgroundColor: "#f8fafc",
                color: "#94a3b8",
                fontSize: 13,
                textAlign: "left",
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#4f46e5";
                e.currentTarget.style.backgroundColor = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.backgroundColor = "#f8fafc";
              }}
            >
              Share an update, product, or announcement...
            </button>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { icon: "image", color: "#059669", title: "Photo" },
                { icon: "video", color: "#d97706", title: "Video" },
                { icon: "tag", color: "#7c3aed", title: "Offer" },
              ].map(({ icon, color, title }) => (
                <button
                  key={title}
                  onClick={() => setCreateModalOpen(true)}
                  title={title}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
                >
                  <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={15} color={color} />
                </button>
              ))}
            </div>
          </div>

          {/* Feed loading */}
          {isLoading && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  <div className="animate-pulse" style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#e2e8f0" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 14, backgroundColor: "#e2e8f0", borderRadius: 4, width: "60%", marginBottom: 8 }} />
                      <div style={{ height: 12, backgroundColor: "#f1f5f9", borderRadius: 4, width: "40%" }} />
                    </div>
                  </div>
                  <div style={{ height: 14, backgroundColor: "#e2e8f0", borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ height: 14, backgroundColor: "#f1f5f9", borderRadius: 4, width: "80%" }} />
                </div>
              ))}
            </div>
          )}

          {/* Feed items */}
          {!isLoading && feedItems.length === 0 && (
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 40,
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <Icon name="rss" size={40} color="#cbd5e1" />
              <div style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginTop: 12 }}>
                No posts yet
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>
                Be the first to share something with the market!
              </div>
              <button
                onClick={() => setCreateModalOpen(true)}
                style={{
                  marginTop: 16,
                  padding: "9px 20px",
                  backgroundColor: "#4f46e5",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Create First Post
              </button>
            </div>
          )}

          {!isLoading &&
            feedItems.map((item) => {
              if (item.type === "post") {
                return (
                  <FeedPostCard
                    key={`post-${item.data.id}`}
                    post={item.data}
                    onLike={(id) => toggleLike(id)}
                    onSave={(id) => toggleSave(id)}
                    onComment={(id, content) => addComment({ id, content })}
                    onShare={(id) => console.log("share", id)}
                  />
                );
              }
              if (item.type === "offer") {
                return (
                  <FeedOfferCard
                    key={`offer-${item.data.id}`}
                    offer={item.data}
                    onOrder={(id) => console.log("order", id)}
                    onEnquiry={(id) => console.log("enquiry", id)}
                    onLike={(id) => console.log("like offer", id)}
                    onShare={(id) => console.log("share offer", id)}
                  />
                );
              }
              if (item.type === "requirement") {
                return (
                  <FeedRequirementCard
                    key={`req-${item.data.id}`}
                    requirement={item.data}
                    onQuote={(id) => console.log("quote", id)}
                    onEnquire={(id) => console.log("enquire", id)}
                    onLike={(id) => console.log("like req", id)}
                    onShare={(id) => console.log("share req", id)}
                  />
                );
              }
              return null;
            })}
        </main>

        {/* ── Right panel ─────────────────────────────────────────────────── */}
        <aside
          style={{
            width: 280,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "sticky",
            top: 60,
          }}
        >
          {/* Trending */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <Icon name="trending-up" size={16} color="#4f46e5" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                Trending in your area
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TRENDING_TOPICS.map((topic, idx) => (
                <div
                  key={topic.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: 8,
                    backgroundColor: "#f8fafc",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#4f46e5" }}>
                      {topic.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{topic.count}</div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      backgroundColor: "#eff6ff",
                      color: "#4f46e5",
                      padding: "2px 7px",
                      borderRadius: 20,
                      fontWeight: 600,
                    }}
                  >
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested vendors */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <Icon name="users" size={16} color="#059669" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                Suggested Vendors
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SUGGESTED_VENDORS.map((vendor) => (
                <div
                  key={vendor.name}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      backgroundColor: vendor.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {vendor.initial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {vendor.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      {vendor.category} · {vendor.followers} followers
                    </div>
                  </div>
                  <button
                    style={{
                      padding: "5px 12px",
                      border: "1.5px solid #4f46e5",
                      borderRadius: 20,
                      backgroundColor: "#fff",
                      color: "#4f46e5",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      flexShrink: 0,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Market Pulse */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <Icon name="activity" size={16} color="#f97316" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                Market Pulse
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {MARKET_PULSE.map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    backgroundColor: stat.bg,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: `${stat.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name={stat.icon as Parameters<typeof Icon>[0]["name"]} size={14} color={stat.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
