"use client";
import { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/ui";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProfileType = "BUSINESS" | "INDIVIDUAL";

interface SocialLink {
  platform: "linkedin" | "facebook" | "twitter" | "instagram" | "whatsapp" | "website";
  url: string;
}

interface BusinessEndorsement {
  key: string;
  label: string;
  icon: string;
  count: number;
  endorsed: boolean;
}

interface UserProfile {
  id: string;
  type: ProfileType;
  displayName: string;
  tagline?: string;
  about?: string;
  initial: string;
  avatarColor: string;
  bannerFrom: string;
  bannerTo: string;
  // Business only
  companyName?: string;
  category?: string;
  gstin?: string;
  establishedYear?: number;
  // Individual only
  designation?: string;
  company?: string;
  // Common
  city: string;
  state: string;
  phone?: string;
  email?: string;
  website?: string;
  socialLinks: SocialLink[];
  stats: {
    posts: number;
    followers: number;
    following: number;
    products?: number;
    reviews: number;
    rating: number;
  };
  endorsements: BusinessEndorsement[];
  verified: boolean;
  isFollowing: boolean;
}

export interface UserProfileModalProps {
  authorId: string | null;
  onClose: () => void;
}

// ── Mock profile generator ────────────────────────────────────────────────────

const BUSINESS_PROFILES: Partial<UserProfile>[] = [
  {
    type: "BUSINESS",
    displayName: "MedPharma Pvt Ltd",
    companyName: "MedPharma Pvt Ltd",
    tagline: "Trusted bulk pharma supplier — ISO 9001:2015 certified",
    about: "MedPharma has been a leading pharmaceutical distributor since 2008, serving 1,200+ hospitals, clinics, and pharmacies across Maharashtra and Gujarat. We specialise in branded generics, OTC medicines, surgical disposables, and cold-chain logistics.",
    category: "Pharmaceuticals & Healthcare",
    gstin: "27AAACM1234F1Z5",
    establishedYear: 2008,
    city: "Mumbai", state: "Maharashtra",
    phone: "+91 98205 44321",
    email: "orders@medpharma.in",
    website: "https://medpharma.in",
    bannerFrom: "#059669", bannerTo: "#0891b2",
    avatarColor: "#059669",
    socialLinks: [
      { platform: "linkedin", url: "#" },
      { platform: "facebook", url: "#" },
      { platform: "whatsapp", url: "#" },
    ],
    stats: { posts: 84, followers: 1240, following: 56, products: 320, reviews: 128, rating: 4.5 },
    verified: true,
  },
  {
    type: "BUSINESS",
    displayName: "GreenFields Agro",
    companyName: "GreenFields Agro Exports LLP",
    tagline: "Premium organic agricultural exports since 2012",
    about: "GreenFields Agro is a certified organic agri-export firm dealing in basmati rice, spices, pulses, and fresh produce. APEDA registered with EU organic certification.",
    category: "Agriculture & Agro Exports",
    gstin: "06AAAFG5678H2Z9",
    establishedYear: 2012,
    city: "Karnal", state: "Haryana",
    phone: "+91 94685 22110",
    website: "https://greenfieldsagro.com",
    bannerFrom: "#16a34a", bannerTo: "#0891b2",
    avatarColor: "#16a34a",
    socialLinks: [
      { platform: "linkedin", url: "#" },
      { platform: "facebook", url: "#" },
      { platform: "instagram", url: "#" },
    ],
    stats: { posts: 42, followers: 640, following: 28, products: 86, reviews: 64, rating: 4.3 },
    verified: true,
  },
  {
    type: "BUSINESS",
    displayName: "TechSupply Co.",
    companyName: "TechSupply Co. Pvt Ltd",
    tagline: "Industrial electronics & thermal printing solutions",
    about: "TechSupply specialises in industrial printers, barcode scanners, IoT devices and enterprise electronics. Authorised reseller for Zebra, Honeywell, and Datalogic.",
    category: "Electronics & Technology",
    gstin: "29AABCT9012I1Z3",
    establishedYear: 2015,
    city: "Bengaluru", state: "Karnataka",
    phone: "+91 80345 67890",
    website: "https://techsupply.co.in",
    bannerFrom: "#7c3aed", bannerTo: "#c026d3",
    avatarColor: "#7c3aed",
    socialLinks: [
      { platform: "linkedin", url: "#" },
      { platform: "twitter", url: "#" },
    ],
    stats: { posts: 31, followers: 890, following: 112, products: 210, reviews: 97, rating: 4.1 },
    verified: false,
  },
];

const INDIVIDUAL_PROFILES: Partial<UserProfile>[] = [
  {
    type: "INDIVIDUAL",
    displayName: "Rajesh Kumar",
    designation: "Pharma Sales Manager",
    company: "Cipla Ltd",
    tagline: "15 years in pharmaceutical distribution & key account management",
    about: "Experienced pharma sales professional with a strong network across hospital procurement and pharmacy chains in Western India. Specialised in branded generics and oncology.",
    city: "Pune", state: "Maharashtra",
    phone: "+91 98760 12345",
    email: "rajesh.kumar@example.com",
    bannerFrom: "var(--color-primary, #1e5f74)", bannerTo: "#0891b2",
    avatarColor: "var(--color-primary, #1e5f74)",
    socialLinks: [
      { platform: "linkedin", url: "#" },
      { platform: "whatsapp", url: "#" },
    ],
    stats: { posts: 23, followers: 430, following: 180, reviews: 21, rating: 4.7 },
    verified: true,
  },
  {
    type: "INDIVIDUAL",
    displayName: "Priya Sharma",
    designation: "Procurement Head",
    company: "Sunrise Hospitals",
    tagline: "Healthcare procurement specialist — bulk medical supply negotiations",
    about: "Procurement expert managing ₹12 Cr+ annual hospital supply budget. Specialised in medical devices, disposables, and pharma procurement for a 3-hospital chain.",
    city: "Nagpur", state: "Maharashtra",
    phone: "+91 97654 33210",
    bannerFrom: "#ec4899", bannerTo: "#a21caf",
    avatarColor: "#9d174d",
    socialLinks: [
      { platform: "linkedin", url: "#" },
      { platform: "facebook", url: "#" },
    ],
    stats: { posts: 18, followers: 290, following: 97, reviews: 15, rating: 4.8 },
    verified: true,
  },
];

const BUSINESS_ENDORSEMENTS: Omit<BusinessEndorsement, "count" | "endorsed">[] = [
  { key: "delivery", label: "Delivers On Time", icon: "truck" },
  { key: "pricing", label: "Price Is Good", icon: "indian-rupee" },
  { key: "quality", label: "Product / Service Quality", icon: "shield-check" },
  { key: "aftersales", label: "After-Sales Support", icon: "headphones" },
  { key: "credit", label: "Provides Good Credit", icon: "credit-card" },
  { key: "communication", label: "Quick Response", icon: "message-circle" },
  { key: "genuine", label: "Genuine Products", icon: "badge-check" },
  { key: "bulk", label: "Bulk Supply Capability", icon: "package" },
];

const INDIVIDUAL_ENDORSEMENTS: Omit<BusinessEndorsement, "count" | "endorsed">[] = [
  { key: "quality", label: "Service Quality", icon: "star" },
  { key: "delivery", label: "On-Time Delivery", icon: "clock" },
  { key: "pricing", label: "Fair Pricing", icon: "indian-rupee" },
  { key: "professional", label: "Professional Conduct", icon: "user-check" },
  { key: "response", label: "Quick Response", icon: "message-circle" },
  { key: "expertise", label: "Domain Expertise", icon: "brain" },
];

function seedEndorsements(
  base: Omit<BusinessEndorsement, "count" | "endorsed">[],
  authorId: string,
): BusinessEndorsement[] {
  let hash = 0;
  for (let i = 0; i < authorId.length; i++) hash = authorId.charCodeAt(i) + ((hash << 5) - hash);
  return base.map((e, i) => ({
    ...e,
    count: Math.abs(((hash >> i) * 7) % 89) + 5,
    endorsed: false,
  }));
}

function getMockProfile(authorId: string): UserProfile {
  let hash = 0;
  for (let i = 0; i < authorId.length; i++) hash = authorId.charCodeAt(i) + ((hash << 5) - hash);
  const absHash = Math.abs(hash);

  const isBusiness = absHash % 3 !== 0; // 2/3 chance business
  const pool = isBusiness ? BUSINESS_PROFILES : INDIVIDUAL_PROFILES;
  const base = pool[absHash % pool.length];
  const type: ProfileType = isBusiness ? "BUSINESS" : "INDIVIDUAL";
  const initial = (base.displayName ?? "U").charAt(0).toUpperCase();
  const endorsements = seedEndorsements(
    type === "BUSINESS" ? BUSINESS_ENDORSEMENTS : INDIVIDUAL_ENDORSEMENTS,
    authorId,
  );

  return {
    id: authorId,
    initial,
    isFollowing: absHash % 5 === 0,
    verified: base.verified ?? false,
    socialLinks: base.socialLinks ?? [],
    stats: base.stats ?? { posts: 5, followers: 20, following: 10, reviews: 3, rating: 4.0 },
    endorsements,
    ...base,
    type,
  } as UserProfile;
}

// ── Helper components ─────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ fontSize: 13, color: i <= Math.round(rating) ? "#f59e0b" : "#d1d5db" }}>★</span>
      ))}
      <span style={{ fontSize: 12, fontWeight: 600, color: "#78350f", marginLeft: 2 }}>{rating.toFixed(1)}</span>
    </div>
  );
}

const SOCIAL_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  linkedin:  { label: "LinkedIn",  icon: "linkedin",  color: "#0077b5", bg: "#e8f4fd" },
  facebook:  { label: "Facebook",  icon: "facebook",  color: "#1877f2", bg: "#e8f0fe" },
  twitter:   { label: "X/Twitter", icon: "twitter",   color: "#1da1f2", bg: "#e8f7fe" },
  instagram: { label: "Instagram", icon: "instagram", color: "#e1306c", bg: "#fce8f3" },
  whatsapp:  { label: "WhatsApp",  icon: "message-circle", color: "#25d366", bg: "#e8fdf1" },
  website:   { label: "Website",   icon: "globe",     color: "#475569", bg: "#f1f5f9" },
};

// ── Main Modal ────────────────────────────────────────────────────────────────

export function UserProfileModal({ authorId, onClose }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [endorsements, setEndorsements] = useState<BusinessEndorsement[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "endorsements" | "posts">("about");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authorId) return;
    const p = getMockProfile(authorId);
    setProfile(p);
    setEndorsements(p.endorsements);
    setIsFollowing(p.isFollowing);
  }, [authorId]);

  // Close on outside click
  useEffect(() => {
    if (!authorId) return;
    function handleOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [authorId, onClose]);

  if (!authorId || !profile) return null;

  function toggleEndorse(key: string) {
    setEndorsements((prev) =>
      prev.map((e) =>
        e.key === key
          ? { ...e, endorsed: !e.endorsed, count: e.endorsed ? e.count - 1 : e.count + 1 }
          : e,
      ),
    );
  }

  const totalEndorsements = endorsements.reduce((a, e) => a + e.count, 0);

  return (
    <div
      style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1100, padding: 16, backdropFilter: "blur(3px)",
      }}
    >
      <div
        ref={modalRef}
        style={{
          backgroundColor: "#fff", borderRadius: 16, width: "100%", maxWidth: 680,
          boxShadow: "0 24px 80px rgba(0,0,0,0.3)", overflow: "hidden",
          maxHeight: "92vh", display: "flex", flexDirection: "column",
        }}
      >
        {/* ── Banner + Avatar ───────────────────────────────────────────── */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          {/* Banner */}
          <div
            style={{
              height: 140,
              background: `linear-gradient(135deg, ${profile.bannerFrom}, ${profile.bannerTo})`,
              position: "relative",
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.3)",
                border: "none", borderRadius: "50%", width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.5)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.3)")}
            >
              <Icon name="x" size={16} />
            </button>
            {/* Profile type badge */}
            <div
              style={{
                position: "absolute", top: 12, left: 14,
                backgroundColor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(4px)",
                borderRadius: 20, padding: "3px 10px",
                fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.5px",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              {profile.type === "BUSINESS" ? "🏢 BUSINESS" : "👤 INDIVIDUAL"}
            </div>
          </div>

          {/* Logo / Avatar (overlaps banner) */}
          <div
            style={{
              position: "absolute", bottom: -44, left: 24,
              width: 80, height: 80, borderRadius: profile.type === "BUSINESS" ? 16 : "50%",
              backgroundColor: profile.avatarColor,
              border: "4px solid #fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 28, fontWeight: 800,
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              flexShrink: 0,
            }}
          >
            {profile.initial}
            {profile.verified && (
              <div
                style={{
                  position: "absolute", bottom: -4, right: -4,
                  width: 22, height: 22, borderRadius: "50%",
                  backgroundColor: "#2563eb",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid #fff",
                }}
              >
                <Icon name="check" size={11} color="#fff" />
              </div>
            )}
          </div>

          {/* Follow / Message actions (top-right of avatar row) */}
          <div
            style={{
              position: "absolute", bottom: -36, right: 20,
              display: "flex", gap: 8,
            }}
          >
            <button
              style={{
                padding: "7px 14px", borderRadius: 20, border: "1.5px solid #e2e8f0",
                backgroundColor: "#fff", color: "#64748b", fontSize: 13, fontWeight: 500,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
            >
              <Icon name="message-circle" size={13} color="#64748b" />
              Message
            </button>
            <button
              onClick={() => setIsFollowing((v) => !v)}
              style={{
                padding: "7px 18px", borderRadius: 20,
                border: `1.5px solid ${isFollowing ? "#e2e8f0" : profile.avatarColor}`,
                backgroundColor: isFollowing ? "#fff" : profile.avatarColor,
                color: isFollowing ? "#64748b" : "#fff",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
                transition: "all 0.2s",
              }}
            >
              <Icon name={isFollowing ? "user-check" : "user-plus"} size={13} color={isFollowing ? "#64748b" : "#fff"} />
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        </div>

        {/* ── Profile info ─────────────────────────────────────────────── */}
        <div style={{ padding: "52px 24px 0", flexShrink: 0 }}>
          {/* Name + category */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
                {profile.displayName}
                {profile.verified && (
                  <span style={{ fontSize: 14, color: "#2563eb", marginLeft: 6 }}>✓</span>
                )}
              </h2>
              {profile.type === "BUSINESS" && profile.category && (
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 2, fontWeight: 500 }}>
                  {profile.category}
                </div>
              )}
              {profile.type === "INDIVIDUAL" && (
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                  {profile.designation}{profile.company ? ` @ ${profile.company}` : ""}
                </div>
              )}
              {profile.tagline && (
                <div style={{ fontSize: 13, color: "#475569", marginTop: 4, fontStyle: "italic" }}>
                  {profile.tagline}
                </div>
              )}
            </div>
            <StarRating rating={profile.stats.rating} />
          </div>

          {/* Meta row: location, GSTIN, year, website */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b" }}>
              <Icon name="map-pin" size={12} color="#94a3b8" />
              {profile.city}, {profile.state}
            </span>
            {profile.type === "BUSINESS" && profile.establishedYear && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b" }}>
                <Icon name="calendar" size={12} color="#94a3b8" />
                Est. {profile.establishedYear}
              </span>
            )}
            {profile.type === "BUSINESS" && profile.gstin && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b" }}>
                <Icon name="file-text" size={12} color="#94a3b8" />
                GST: {profile.gstin}
              </span>
            )}
            {profile.phone && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b" }}>
                <Icon name="phone" size={12} color="#94a3b8" />
                {profile.phone}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--color-primary, #1e5f74)", textDecoration: "none" }}
              >
                <Icon name="globe" size={12} color="var(--color-primary, #1e5f74)" />
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>

          {/* Social links */}
          {profile.socialLinks.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {profile.socialLinks.map((s) => {
                const meta = SOCIAL_META[s.platform] ?? SOCIAL_META.website;
                return (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={meta.label}
                    style={{
                      width: 34, height: 34, borderRadius: 8,
                      backgroundColor: meta.bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      textDecoration: "none", transition: "transform 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.12)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <Icon name={meta.icon as Parameters<typeof Icon>[0]["name"]} size={16} color={meta.color} />
                  </a>
                );
              })}
            </div>
          )}

          {/* Stats bar */}
          <div
            style={{
              display: "flex", gap: 0, marginTop: 16, marginBottom: 0,
              backgroundColor: "#f8fafc", borderRadius: 12, overflow: "hidden",
              border: "1px solid #f1f5f9",
            }}
          >
            {[
              { label: "Posts", value: profile.stats.posts },
              { label: "Followers", value: profile.stats.followers >= 1000 ? `${(profile.stats.followers / 1000).toFixed(1)}K` : profile.stats.followers },
              { label: "Following", value: profile.stats.following },
              ...(profile.stats.products ? [{ label: "Products", value: profile.stats.products }] : []),
              { label: "Reviews", value: profile.stats.reviews },
            ].map((s, i, arr) => (
              <div
                key={s.label}
                style={{
                  flex: 1, textAlign: "center", padding: "12px 8px",
                  borderRight: i < arr.length - 1 ? "1px solid #e2e8f0" : "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-50, #eef7fa)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", marginTop: 14 }}>
            {(["about", "endorsements", "posts"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "10px 18px", background: "none", border: "none",
                  borderBottom: `2px solid ${activeTab === tab ? "var(--color-primary, #1e5f74)" : "transparent"}`,
                  color: activeTab === tab ? "var(--color-primary, #1e5f74)" : "#64748b",
                  fontSize: 13, fontWeight: activeTab === tab ? 700 : 500,
                  cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s",
                }}
              >
                {tab === "endorsements" ? `Endorsements (${totalEndorsements})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content (scrollable) ──────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 28px" }}>

          {/* ABOUT TAB */}
          {activeTab === "about" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {profile.about && (
                <div>
                  <SectionTitle>About</SectionTitle>
                  <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 }}>
                    {profile.about}
                  </p>
                </div>
              )}

              {/* Business details */}
              {profile.type === "BUSINESS" && (
                <div>
                  <SectionTitle>Business Details</SectionTitle>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { icon: "briefcase", label: "Category", value: profile.category },
                      { icon: "calendar", label: "Established", value: profile.establishedYear ? `Since ${profile.establishedYear}` : undefined },
                      { icon: "file-text", label: "GSTIN", value: profile.gstin },
                      { icon: "map-pin", label: "Location", value: `${profile.city}, ${profile.state}` },
                      { icon: "phone", label: "Phone", value: profile.phone },
                      { icon: "mail", label: "Email", value: profile.email },
                    ].filter((r) => r.value).map((row) => (
                      <div
                        key={row.label}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          backgroundColor: "#f8fafc", borderRadius: 8, padding: "10px 14px",
                          border: "1px solid #f1f5f9",
                        }}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "var(--color-primary-50, #eef7fa)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon name={row.icon as Parameters<typeof Icon>[0]["name"]} size={14} color="var(--color-primary, #1e5f74)" />
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{row.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#1e293b", marginTop: 1 }}>{row.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual skills/expertise */}
              {profile.type === "INDIVIDUAL" && (
                <div>
                  <SectionTitle>Professional Info</SectionTitle>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { icon: "user", label: "Designation", value: profile.designation },
                      { icon: "building-2", label: "Company", value: profile.company },
                      { icon: "map-pin", label: "Location", value: `${profile.city}, ${profile.state}` },
                      { icon: "phone", label: "Phone", value: profile.phone },
                    ].filter((r) => r.value).map((row) => (
                      <div
                        key={row.label}
                        style={{ display: "flex", alignItems: "center", gap: 10, backgroundColor: "#f8fafc", borderRadius: 8, padding: "10px 14px", border: "1px solid #f1f5f9" }}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "var(--color-primary-50, #eef7fa)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon name={row.icon as Parameters<typeof Icon>[0]["name"]} size={14} color="var(--color-primary, #1e5f74)" />
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{row.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#1e293b", marginTop: 1 }}>{row.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ENDORSEMENTS TAB */}
          {activeTab === "endorsements" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                    {profile.type === "BUSINESS" ? "Business Endorsements" : "Professional Endorsements"}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                    Endorsed by {totalEndorsements} people · Click to endorse
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "var(--color-primary-50, #eef7fa)", borderRadius: 20, padding: "4px 12px" }}>
                  <Icon name="thumbs-up" size={13} color="var(--color-primary, #1e5f74)" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary, #1e5f74)" }}>{totalEndorsements} endorsements</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {endorsements.map((e) => (
                  <EndorsementRow
                    key={e.key}
                    endorsement={e}
                    max={Math.max(...endorsements.map((x) => x.count))}
                    onEndorse={() => toggleEndorse(e.key)}
                  />
                ))}
              </div>

              {/* Info note */}
              <div style={{ marginTop: 16, backgroundColor: "#f8fafc", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 8, border: "1px solid #e2e8f0" }}>
                <Icon name="info" size={13} color="#94a3b8" />
                <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                  Endorsements reflect real interactions from verified buyers and vendors on this platform.
                  Only users who have transacted with this {profile.type === "BUSINESS" ? "business" : "person"} can endorse.
                </p>
              </div>
            </div>
          )}

          {/* POSTS TAB */}
          {activeTab === "posts" && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
              <Icon name="file-text" size={36} color="#cbd5e1" />
              <div style={{ fontSize: 14, fontWeight: 600, color: "#475569", marginTop: 12 }}>Posts by {profile.displayName}</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>View their {profile.stats.posts} posts in the feed</div>
              <button
                style={{
                  marginTop: 14, padding: "8px 20px", borderRadius: 8,
                  backgroundColor: "var(--color-primary, #1e5f74)", color: "#fff",
                  border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                Filter Feed by this User
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Section title ─────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
      {children}
    </div>
  );
}

// ── Endorsement row ───────────────────────────────────────────────────────────

function EndorsementRow({
  endorsement,
  max,
  onEndorse,
}: {
  endorsement: BusinessEndorsement;
  max: number;
  onEndorse: () => void;
}) {
  const pct = max > 0 ? (endorsement.count / max) * 100 : 0;
  return (
    <div
      style={{
        border: `1.5px solid ${endorsement.endorsed ? "var(--color-primary, #1e5f74)" : "#e2e8f0"}`,
        borderRadius: 10,
        padding: "12px 14px",
        backgroundColor: endorsement.endorsed ? "var(--color-primary-50, #eef7fa)" : "#fff",
        transition: "all 0.2s",
        cursor: "pointer",
      }}
      onClick={onEndorse}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              backgroundColor: endorsement.endorsed ? "var(--color-primary, #1e5f74)" : "#f1f5f9",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}
          >
            <Icon
              name={endorsement.icon as Parameters<typeof Icon>[0]["name"]}
              size={15}
              color={endorsement.endorsed ? "#fff" : "#94a3b8"}
            />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: endorsement.endorsed ? "var(--color-primary, #1e5f74)" : "#374151" }}>
            {endorsement.label}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: endorsement.endorsed ? "var(--color-primary, #1e5f74)" : "#64748b" }}>
            {endorsement.count}
          </span>
          <div
            style={{
              width: 24, height: 24, borderRadius: "50%",
              backgroundColor: endorsement.endorsed ? "var(--color-primary, #1e5f74)" : "#f1f5f9",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}
          >
            <Icon
              name={endorsement.endorsed ? "check" : "plus"}
              size={12}
              color={endorsement.endorsed ? "#fff" : "#94a3b8"}
            />
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ height: 5, borderRadius: 3, backgroundColor: "#e2e8f0", overflow: "hidden" }}>
        <div
          style={{
            height: "100%", width: `${pct}%`, borderRadius: 3,
            backgroundColor: endorsement.endorsed ? "var(--color-primary, #1e5f74)" : "#cbd5e1",
            transition: "width 0.4s ease, background 0.2s",
          }}
        />
      </div>
    </div>
  );
}
