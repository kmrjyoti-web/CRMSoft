"use client";
import React from "react";

// A single pulsing block
function Block({ w, h, radius = 4 }: { w: string | number; h: number; radius?: number }) {
  return (
    <div
      className="animate-pulse"
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        backgroundColor: "#e2e8f0",
        flexShrink: 0,
      }}
    />
  );
}

// Shared card wrapper
function SkeletonCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        overflow: "hidden",
        marginBottom: 16,
        padding: 16,
      }}
    >
      {children}
    </div>
  );
}

// Shared post header skeleton (avatar + name + time)
function PostHeaderSkeleton() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <Block w={44} h={44} radius={22} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <Block w="55%" h={13} />
        <Block w="35%" h={11} />
      </div>
    </div>
  );
}

export function TextPostSkeleton() {
  return (
    <SkeletonCard>
      <PostHeaderSkeleton />
      <Block w="100%" h={13} /><div style={{ height: 6 }} />
      <Block w="85%" h={13} /><div style={{ height: 6 }} />
      <Block w="70%" h={13} />
      <div style={{ height: 14 }} />
      <div style={{ display: "flex", gap: 6 }}>
        <Block w={80} h={10} /><Block w={70} h={10} />
      </div>
      <div style={{ height: 14 }} />
      <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
        <Block w="30%" h={30} radius={8} />
        <Block w="30%" h={30} radius={8} />
        <Block w="30%" h={30} radius={8} />
      </div>
    </SkeletonCard>
  );
}

export function ImagePostSkeleton() {
  return (
    <SkeletonCard>
      <PostHeaderSkeleton />
      <Block w="100%" h={13} /><div style={{ height: 6 }} />
      <Block w="70%" h={13} />
      <div style={{ height: 12 }} />
      {/* image placeholder */}
      <Block w="100%" h={220} radius={8} />
      <div style={{ height: 14 }} />
      <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
        <Block w="30%" h={30} radius={8} />
        <Block w="30%" h={30} radius={8} />
        <Block w="30%" h={30} radius={8} />
      </div>
    </SkeletonCard>
  );
}

export function VideoPostSkeleton() {
  return (
    <SkeletonCard>
      <PostHeaderSkeleton />
      <Block w="100%" h={13} /><div style={{ height: 6 }} />
      <Block w="60%" h={13} />
      <div style={{ height: 12 }} />
      {/* video placeholder - wider aspect ratio */}
      <div style={{ position: "relative" }}>
        <Block w="100%" h={200} radius={8} />
        {/* play button circle */}
        <div
          className="animate-pulse"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 44,
            height: 44,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.6)",
          }}
        />
      </div>
      <div style={{ height: 14 }} />
      <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
        <Block w="30%" h={30} radius={8} />
        <Block w="30%" h={30} radius={8} />
        <Block w="30%" h={30} radius={8} />
      </div>
    </SkeletonCard>
  );
}

export function OfferCardSkeleton() {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        overflow: "hidden",
        marginBottom: 16,
      }}
    >
      {/* header */}
      <div style={{ padding: "14px 16px 10px", display: "flex", gap: 10, alignItems: "center" }}>
        <Block w={40} h={40} radius={20} />
        <div style={{ flex: 1 }}>
          <Block w="50%" h={13} /><div style={{ height: 6 }} /><Block w="30%" h={11} />
        </div>
        <Block w={100} h={22} radius={11} />
      </div>
      {/* gradient banner placeholder */}
      <Block w="100%" h={80} radius={0} />
      {/* product row */}
      <div style={{ padding: "14px 16px", display: "flex", gap: 14 }}>
        <Block w={72} h={72} radius={10} />
        <div style={{ flex: 1 }}>
          <Block w="70%" h={14} /><div style={{ height: 8 }} />
          <Block w="50%" h={12} /><div style={{ height: 8 }} />
          <Block w="40%" h={11} />
        </div>
      </div>
      {/* buttons */}
      <div style={{ padding: "0 16px 14px", display: "flex", gap: 10 }}>
        <Block w="50%" h={40} radius={8} />
        <Block w="50%" h={40} radius={8} />
      </div>
    </div>
  );
}

export function RequirementCardSkeleton() {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        overflow: "hidden",
        marginBottom: 16,
      }}
    >
      {/* header */}
      <div style={{ padding: "14px 16px 12px", display: "flex", gap: 10, alignItems: "center" }}>
        <Block w={40} h={40} radius={20} />
        <div style={{ flex: 1 }}>
          <Block w="55%" h={13} /><div style={{ height: 6 }} /><Block w="35%" h={11} />
        </div>
        <Block w={80} h={22} radius={11} />
      </div>
      {/* title + urgency bar */}
      <div style={{ padding: "0 16px 12px" }}>
        <Block w="75%" h={16} /><div style={{ height: 10 }} />
        <Block w="100%" h={8} radius={4} /><div style={{ height: 8 }} />
        <Block w="100%" h={11} /><div style={{ height: 5 }} />
        <Block w="80%" h={11} />
      </div>
      {/* tags */}
      <div style={{ padding: "0 16px 14px", display: "flex", gap: 6 }}>
        <Block w={80} h={24} radius={12} />
        <Block w={70} h={24} radius={12} />
        <Block w={90} h={24} radius={12} />
      </div>
      {/* buttons */}
      <div style={{ padding: "0 16px 14px", display: "flex", gap: 10 }}>
        <Block w="50%" h={40} radius={8} />
        <Block w="50%" h={40} radius={8} />
      </div>
    </div>
  );
}

export function AnnouncementPostSkeleton() {
  return (
    <SkeletonCard>
      <PostHeaderSkeleton />
      {/* announcement banner */}
      <Block w="100%" h={60} radius={8} />
      <div style={{ height: 12 }} />
      <Block w="100%" h={13} /><div style={{ height: 6 }} /><Block w="80%" h={13} />
      <div style={{ height: 14 }} />
      <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
        <Block w="30%" h={30} radius={8} />
        <Block w="30%" h={30} radius={8} />
        <Block w="30%" h={30} radius={8} />
      </div>
    </SkeletonCard>
  );
}

// Map of post type to skeleton component
export type SkeletonType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "OFFER"
  | "REQUIREMENT"
  | "ANNOUNCEMENT"
  | "PRODUCT_SHARE"
  | "POLL"
  | "CUSTOMER_FEEDBACK"
  | "PRODUCT_LAUNCH";

export function FeedItemSkeleton({ type }: { type: SkeletonType }) {
  switch (type) {
    case "IMAGE": return <ImagePostSkeleton />;
    case "VIDEO": return <VideoPostSkeleton />;
    case "OFFER": return <OfferCardSkeleton />;
    case "REQUIREMENT": return <RequirementCardSkeleton />;
    case "ANNOUNCEMENT": return <AnnouncementPostSkeleton />;
    default: return <TextPostSkeleton />;
  }
}
