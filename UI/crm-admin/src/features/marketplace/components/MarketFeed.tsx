"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { Icon } from "@/components/ui";
import { useFeed, useToggleLike, useToggleSave, useAddComment } from "../hooks/useMarketplace";
import type { MarketplacePost, PostType } from "../types/marketplace.types";
import { FeedPostCard } from "./feed/FeedPostCard";
import { FeedOfferCard } from "./feed/FeedOfferCard";
import type { FeedOffer } from "./feed/FeedOfferCard";
import { FeedRequirementCard } from "./feed/FeedRequirementCard";
import type { FeedRequirement } from "./feed/FeedRequirementCard";
import { CreatePostModal } from "./feed/CreatePostModal";
import { OrderFormModal } from "./feed/OrderFormModal";
import { EnquiryFormModal } from "./feed/EnquiryFormModal";
import type { EnquiryTarget } from "./feed/EnquiryFormModal";
import { FeedItemSkeleton } from "./feed/FeedSkeletons";
import type { SkeletonType } from "./feed/FeedSkeletons";

// ── Extended post type for poll/feedback/launch metadata ─────────────────────

interface ExtendedMarketplacePost extends MarketplacePost {
  pollOptions?: { text: string; votes: number }[];
  badgeText?: string;
}

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
  {
    id: "o3",
    vendorName: "SpiceRoute Exports",
    vendorInitial: "S",
    vendorColor: "#dc2626",
    title: "Harvest Season — Bulk Spices Offer",
    productName: "Premium Turmeric Powder (500 kg lot)",
    originalPrice: 85000,
    offerPrice: 64000,
    discountPercent: 25,
    validUntil: new Date(Date.now() + 1 * 86400000 + 3600000).toISOString(),
    remainingCount: 12,
    likeCount: 41,
    shareCount: 19,
    gradientFrom: "#dc2626",
    gradientTo: "#f97316",
  },
  {
    id: "o4",
    vendorName: "GreenFields Agro",
    vendorInitial: "G",
    vendorColor: "#16a34a",
    title: "Pre-Monsoon Agricultural Produce",
    productName: "Organic Basmati Rice — Export Grade (1 MT)",
    originalPrice: 55000,
    offerPrice: 44000,
    discountPercent: 20,
    validUntil: new Date(Date.now() + 8 * 86400000).toISOString(),
    remainingCount: 30,
    likeCount: 55,
    shareCount: 22,
    gradientFrom: "#16a34a",
    gradientTo: "#0891b2",
  },
  {
    id: "o5",
    vendorName: "SolarMax Systems",
    vendorInitial: "S",
    vendorColor: "#d97706",
    title: "Solar Season Sale — Installer Special",
    productName: "400W Mono PERC Solar Panels (50-panel lot)",
    originalPrice: 175000,
    offerPrice: 129000,
    discountPercent: 26,
    validUntil: new Date(Date.now() + 3 * 86400000 + 7200000).toISOString(),
    remainingCount: 6,
    likeCount: 89,
    shareCount: 41,
    gradientFrom: "#d97706",
    gradientTo: "#f59e0b",
  },
  {
    id: "o6",
    vendorName: "ChemBase Industries",
    vendorInitial: "C",
    vendorColor: "#0891b2",
    title: "Year-End Chemical Stock Clearance",
    productName: "Isopropyl Alcohol 99.9% — 200L Drum",
    originalPrice: 28000,
    offerPrice: 20500,
    discountPercent: 27,
    validUntil: new Date(Date.now() + 6 * 3600000).toISOString(),
    remainingCount: 15,
    likeCount: 33,
    shareCount: 14,
    gradientFrom: "#0891b2",
    gradientTo: "#1e5f74",
  },
  {
    id: "o7",
    vendorName: "PrintPro Supplies",
    vendorInitial: "P",
    vendorColor: "#7c3aed",
    title: "Printer Cartridge Combo Deal",
    productName: "HP Compatible Ink Cartridge Set (Box of 50)",
    originalPrice: 18000,
    offerPrice: 11500,
    discountPercent: 36,
    validUntil: new Date(Date.now() + 12 * 86400000).toISOString(),
    remainingCount: 80,
    likeCount: 28,
    shareCount: 9,
    gradientFrom: "#7c3aed",
    gradientTo: "#4f46e5",
  },
  {
    id: "o8",
    vendorName: "SafeGuard PPE",
    vendorInitial: "S",
    vendorColor: "#dc2626",
    title: "Safety Gear Bulk Discount — Limited Stock",
    productName: "N95 Masks + Safety Goggles Combo (500 units)",
    originalPrice: 22000,
    offerPrice: 15400,
    discountPercent: 30,
    validUntil: new Date(Date.now() + 1 * 86400000 + 14400000).toISOString(),
    remainingCount: 22,
    likeCount: 61,
    shareCount: 26,
    gradientFrom: "#dc2626",
    gradientTo: "#b91c1c",
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
  {
    id: "r3",
    buyerName: "NovaTech Solutions",
    buyerInitial: "N",
    buyerColor: "#6366f1",
    title: "IT Hardware — Laptops & Peripherals",
    description:
      "Looking for bulk supply of 150 business laptops (i5/16GB/512GB SSD), monitors, and keyboards for our new Bengaluru office. OEM or authorized resellers preferred with on-site warranty.",
    category: "IT Hardware",
    quantity: "150 units",
    budgetMin: 1200000,
    budgetMax: 2000000,
    deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
    quoteCount: 5,
    likeCount: 18,
    shareCount: 9,
    tags: ["IT Hardware", "150 units", "Bengaluru", "Laptops"],
  },
  {
    id: "r4",
    buyerName: "FastMove Logistics",
    buyerInitial: "F",
    buyerColor: "#d97706",
    title: "Transport Partner — Mumbai to Delhi Route",
    description:
      "Seeking a reliable logistics partner for weekly full-truck-load (FTL) shipments from Mumbai to Delhi and Noida. GPS-tracked, temperature-controlled vehicles preferred for pharmaceutical cargo.",
    category: "Logistics",
    quantity: "4 trucks/week",
    budgetMin: 60000,
    budgetMax: 120000,
    deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    quoteCount: 9,
    likeCount: 27,
    shareCount: 11,
    tags: ["Logistics", "Mumbai-Delhi", "FTL", "Pharma Cargo"],
  },
  {
    id: "r5",
    buyerName: "StyleCraft Garments",
    buyerInitial: "S",
    buyerColor: "#ec4899",
    title: "Cotton Fabric Supplier — Knitwear Export Unit",
    description:
      "We are an export-oriented garment manufacturer seeking a reliable supplier of 100% combed cotton single jersey fabric (180 GSM) in natural and white shades. Quantity: 20,000 metres/month. GOTS or OCS certified preferred.",
    category: "Textiles",
    quantity: "20,000 metres/month",
    budgetMin: 400000,
    budgetMax: 700000,
    deadline: new Date(Date.now() + 6 * 86400000).toISOString(),
    quoteCount: 4,
    likeCount: 19,
    shareCount: 7,
    tags: ["Cotton Fabric", "Knitwear", "Export", "GOTS", "Tirupur"],
  },
  {
    id: "r6",
    buyerName: "CityBakes Food Pvt Ltd",
    buyerInitial: "C",
    buyerColor: "#f97316",
    title: "Refined Wheat Flour (Maida) — Bulk Monthly Supply",
    description:
      "Looking for a consistent supplier of refined wheat flour (Maida Grade 1) for our chain of 12 bakeries across Hyderabad and Bengaluru. FSSAI-compliant packaging, 50 kg bags. Delivery to multiple locations required.",
    category: "Food Ingredients",
    quantity: "30 MT/month",
    budgetMin: 750000,
    budgetMax: 1100000,
    deadline: new Date(Date.now() + 9 * 86400000).toISOString(),
    quoteCount: 11,
    likeCount: 33,
    shareCount: 14,
    tags: ["Maida", "FSSAI", "Bakery", "Hyderabad", "Bengaluru"],
  },
  {
    id: "r7",
    buyerName: "PowerGrid EPC Solutions",
    buyerInitial: "P",
    buyerColor: "#059669",
    title: "HT Cable Supplier for Solar Park Project",
    description:
      "EPC contractor inviting quotations for 11 KV XLPE armoured cables (630 sqmm, 3-core) for a 50 MW solar park in Rajasthan. Supply with testing certificates. Delivery schedule: phased over 8 months. ISI mark mandatory.",
    category: "Electrical",
    quantity: "12 km",
    budgetMin: 4000000,
    budgetMax: 6500000,
    deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    quoteCount: 3,
    likeCount: 44,
    shareCount: 18,
    tags: ["HT Cable", "Solar", "EPC", "Rajasthan", "ISI"],
  },
  {
    id: "r8",
    buyerName: "AutoParts Hub",
    buyerInitial: "A",
    buyerColor: "#1e5f74",
    title: "OEM Brake Pad Sets — Multi-Brand Fitment",
    description:
      "Auto parts distributor looking for an OEM-grade brake pad manufacturer capable of supplying multi-brand fitments (Maruti, Hyundai, Tata, Mahindra). Annual volume: 1 lakh sets. R&D compliance certificate required.",
    category: "Automotive",
    quantity: "1,00,000 sets/year",
    budgetMin: 5000000,
    budgetMax: 9000000,
    deadline: new Date(Date.now() + 21 * 86400000).toISOString(),
    quoteCount: 6,
    likeCount: 51,
    shareCount: 23,
    tags: ["Brake Pads", "OEM", "Automotive", "Multi-brand", "Annual"],
  },
];

// ── ALL feed items pool (used for infinite scroll) ────────────────────────────

type FeedItem =
  | { type: "post"; data: ExtendedMarketplacePost }
  | { type: "offer"; data: FeedOffer }
  | { type: "requirement"; data: FeedRequirement };

// Extended mock posts covering all post types
function buildMockPosts(): ExtendedMarketplacePost[] {
  return [
    {
      id: "mp1",
      tenantId: "t1",
      authorId: "auth1",
      postType: "TEXT",
      content:
        "Excited to announce our new bulk supply partnership with leading hospitals across Maharashtra! We now offer next-day delivery for all critical medicines. Reach out for exclusive pricing.",
      mediaUrls: [],
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      viewCount: 1240,
      likeCount: 48,
      commentCount: 12,
      shareCount: 7,
      saveCount: 5,
      hashtags: ["pharma", "bulksupply", "Maharashtra"],
      isActive: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp2",
      tenantId: "t1",
      authorId: "auth2",
      postType: "PRODUCT_SHARE",
      content:
        "Introducing our new range of eco-friendly packaging materials — 100% biodegradable, GMP-certified. Perfect for pharmaceutical and food industry applications.",
      mediaUrls: [],
      linkedListingId: "list1",
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      viewCount: 890,
      likeCount: 31,
      commentCount: 8,
      shareCount: 15,
      saveCount: 11,
      hashtags: ["packaging", "ecoFriendly", "GMP"],
      isActive: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp3",
      tenantId: "t1",
      authorId: "auth3",
      postType: "ANNOUNCEMENT",
      content:
        "We are now ISO 9001:2015 certified! This milestone reflects our commitment to quality management and continuous improvement. Thank you to all our partners and customers for your trust.",
      mediaUrls: [],
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      viewCount: 2100,
      likeCount: 120,
      commentCount: 34,
      shareCount: 56,
      saveCount: 28,
      hashtags: ["ISO9001", "QualityCertified", "Milestone"],
      isActive: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp4",
      tenantId: "t1",
      authorId: "auth4",
      postType: "VIDEO",
      content:
        "Watch our 2-minute factory tour to see how we maintain stringent quality standards at every step of our manufacturing process.",
      mediaUrls: [{ type: "VIDEO", url: "/placeholder.mp4" }],
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      viewCount: 3400,
      likeCount: 87,
      commentCount: 22,
      shareCount: 41,
      saveCount: 16,
      hashtags: ["factorytour", "manufacturing", "quality"],
      isActive: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp5",
      tenantId: "t1",
      authorId: "auth5",
      postType: "IMAGE",
      content:
        "Proud to showcase our product display at PharmaTech Expo 2026 in Mumbai! Hundreds of distributors and buyers visited our stall. Grateful for the incredible response.",
      mediaUrls: [{ type: "IMAGE", url: "/placeholder-expo.jpg" }],
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 43200000).toISOString(),
      viewCount: 1870,
      likeCount: 94,
      commentCount: 18,
      shareCount: 32,
      saveCount: 14,
      hashtags: ["PharmaTechExpo", "tradeshow", "networking"],
      isActive: true,
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp6",
      tenantId: "t1",
      authorId: "auth6",
      postType: "CUSTOMER_FEEDBACK",
      content:
        "The delivery was on time and packaging was excellent. Products matched the specifications exactly. Highly recommend this vendor for bulk pharmaceutical supplies. Will order again!",
      mediaUrls: [],
      rating: 5,
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 21600000).toISOString(),
      viewCount: 640,
      likeCount: 38,
      commentCount: 5,
      shareCount: 9,
      saveCount: 4,
      hashtags: ["customerreview", "verified", "5stars"],
      isActive: true,
      createdAt: new Date(Date.now() - 21600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp7",
      tenantId: "t1",
      authorId: "auth7",
      postType: "PRODUCT_LAUNCH",
      content:
        "We are thrilled to launch our new BioCold Storage System — purpose-built for pharmaceutical and vaccine storage with IoT-enabled temperature monitoring and GSM alerts.",
      mediaUrls: [],
      badgeText: "🚀 PRODUCT LAUNCH — Now Available",
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      viewCount: 2800,
      likeCount: 156,
      commentCount: 42,
      shareCount: 78,
      saveCount: 35,
      hashtags: ["NewProduct", "ColdChain", "IoT", "Pharmaceutical"],
      isActive: true,
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp8",
      tenantId: "t1",
      authorId: "auth8",
      postType: "POLL",
      content: "Which payment method do you prefer for bulk B2B orders? Cast your vote!",
      mediaUrls: [],
      pollOptions: [
        { text: "Bank Transfer (NEFT/RTGS)", votes: 45 },
        { text: "UPI / QR Code", votes: 82 },
        { text: "Credit (30 days)", votes: 38 },
        { text: "Cash on Delivery", votes: 15 },
      ],
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      viewCount: 1200,
      likeCount: 22,
      commentCount: 14,
      shareCount: 6,
      saveCount: 3,
      hashtags: ["poll", "payment", "B2B"],
      isActive: true,
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp9",
      tenantId: "t1",
      authorId: "auth9",
      postType: "TEXT",
      content:
        "Market update: Active pharmaceutical ingredient (API) prices have stabilized after the Q1 fluctuation. This is a good window for bulk buyers to lock in long-term supply contracts. DM us for rate sheets.",
      mediaUrls: [],
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 50400000).toISOString(),
      viewCount: 980,
      likeCount: 61,
      commentCount: 9,
      shareCount: 24,
      saveCount: 18,
      hashtags: ["MarketUpdate", "API", "pharma", "procurement"],
      isActive: true,
      createdAt: new Date(Date.now() - 50400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp10",
      tenantId: "t1",
      authorId: "auth10",
      postType: "ANNOUNCEMENT",
      content:
        "IMPORTANT: GST e-invoicing is now mandatory for businesses with annual turnover above ₹5 crore. Ensure your ERP and billing software is IRP-integrated to avoid penalties. We can assist with compliance.",
      mediaUrls: [],
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      viewCount: 4200,
      likeCount: 210,
      commentCount: 58,
      shareCount: 130,
      saveCount: 67,
      hashtags: ["GSTCompliance", "eInvoicing", "TaxAlert"],
      isActive: true,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp11",
      tenantId: "t1",
      authorId: "auth11",
      postType: "IMAGE",
      content:
        "Big news! Our Aurangabad factory expansion is complete — doubling our production capacity to 10 million tablets/day. We can now accept larger order volumes with shorter lead times.",
      mediaUrls: [{ type: "IMAGE", url: "/placeholder-factory.jpg" }],
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
      viewCount: 3100,
      likeCount: 178,
      commentCount: 45,
      shareCount: 89,
      saveCount: 40,
      hashtags: ["expansion", "manufacturing", "capacity", "Aurangabad"],
      isActive: true,
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp12",
      tenantId: "t1",
      authorId: "auth12",
      postType: "PRODUCT_SHARE",
      content:
        "Featuring the HeavyLift 3000 — our flagship industrial pallet jack with 3-tonne capacity and CE certification. Trusted by over 200 warehouses across India.",
      mediaUrls: [],
      linkedListingId: "list2",
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 432000000).toISOString(),
      viewCount: 760,
      likeCount: 43,
      commentCount: 11,
      shareCount: 17,
      saveCount: 8,
      hashtags: ["industrial", "equipment", "warehousing", "logistics"],
      isActive: true,
      createdAt: new Date(Date.now() - 432000000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // ── Additional seed posts ─────────────────────────────────────────────────
    {
      id: "mp13",
      tenantId: "t1",
      authorId: "auth13",
      postType: "POLL",
      content: "What is your biggest challenge in B2B procurement today? Help us understand your pain points!",
      mediaUrls: [],
      pollOptions: [
        { text: "Finding reliable vendors", votes: 134 },
        { text: "Delayed deliveries", votes: 98 },
        { text: "Price fluctuations", votes: 76 },
        { text: "GST / compliance issues", votes: 52 },
      ],
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 5400000).toISOString(),
      viewCount: 2400,
      likeCount: 67,
      commentCount: 31,
      shareCount: 45,
      saveCount: 12,
      hashtags: ["poll", "procurement", "B2B", "supplychain"],
      isActive: true,
      createdAt: new Date(Date.now() - 5400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp14",
      tenantId: "t1",
      authorId: "auth14",
      postType: "TEXT",
      content:
        "Steel prices have dropped 8% this week amid global inventory corrections. If you are a construction or manufacturing buyer, now is an ideal time to lock in forward contracts. We have Q2 allocations available — contact us today.",
      mediaUrls: [],
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 9000000).toISOString(),
      viewCount: 1560,
      likeCount: 72,
      commentCount: 19,
      shareCount: 38,
      saveCount: 22,
      hashtags: ["steel", "metalmarket", "construction", "forwardcontract"],
      isActive: true,
      createdAt: new Date(Date.now() - 9000000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp15",
      tenantId: "t1",
      authorId: "auth15",
      postType: "PRODUCT_LAUNCH",
      content:
        "Introducing FreshTrack — India's first AI-powered cold chain monitoring solution for perishables. Real-time temperature alerts, route optimization, and compliance reports for FSSAI audits. Now available for dairy, horticulture, and pharma cold chains.",
      mediaUrls: [],
      badgeText: "🚀 NEW LAUNCH — AI Cold Chain",
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 16200000).toISOString(),
      viewCount: 3800,
      likeCount: 204,
      commentCount: 63,
      shareCount: 110,
      saveCount: 58,
      hashtags: ["FreshTrack", "coldchain", "AI", "FSSAI", "agritech"],
      isActive: true,
      createdAt: new Date(Date.now() - 16200000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp16",
      tenantId: "t1",
      authorId: "auth16",
      postType: "IMAGE",
      content:
        "Our new textile unit in Surat is operational! 500 looms running 24/7 producing premium polyester blends, cotton-lycra, and technical fabrics for apparel exporters. MOQ: 2000 metres. Samples available.",
      mediaUrls: [{ type: "IMAGE", url: "/placeholder-textile.jpg" }],
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 28800000).toISOString(),
      viewCount: 1230,
      likeCount: 59,
      commentCount: 16,
      shareCount: 27,
      saveCount: 11,
      hashtags: ["textile", "Surat", "fabric", "apparel", "manufacturing"],
      isActive: true,
      createdAt: new Date(Date.now() - 28800000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp17",
      tenantId: "t1",
      authorId: "auth17",
      postType: "CUSTOMER_FEEDBACK",
      content:
        "We sourced 10 tonnes of organic jaggery from this vendor for our retail brand. The quality was consistently excellent across all batches, documentation was perfect, and they even arranged last-mile delivery to our 4 warehouses. 10/10 would recommend!",
      mediaUrls: [],
      rating: 5,
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 36000000).toISOString(),
      viewCount: 820,
      likeCount: 47,
      commentCount: 8,
      shareCount: 13,
      saveCount: 6,
      hashtags: ["organicfood", "jaggery", "verified", "5stars", "agri"],
      isActive: true,
      createdAt: new Date(Date.now() - 36000000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp18",
      tenantId: "t1",
      authorId: "auth18",
      postType: "ANNOUNCEMENT",
      content:
        "We have been awarded the GeM (Government e-Marketplace) Seller of the Year 2026 in the Industrial Equipment category! This recognition is a testament to our commitment to government procurement quality standards. Open to new tenders — reach out!",
      mediaUrls: [],
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 108000000).toISOString(),
      viewCount: 5100,
      likeCount: 320,
      commentCount: 74,
      shareCount: 185,
      saveCount: 92,
      hashtags: ["GeM", "award", "government", "procurement", "excellence"],
      isActive: true,
      createdAt: new Date(Date.now() - 108000000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp19",
      tenantId: "t1",
      authorId: "auth19",
      postType: "VIDEO",
      content:
        "See how our automated pick-and-pack system processes 10,000 orders per day with 99.8% accuracy. Powered by conveyor-integrated barcode scanning and ERP sync. Zero manual errors since deployment!",
      mediaUrls: [{ type: "VIDEO", url: "/placeholder-warehouse.mp4" }],
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 216000000).toISOString(),
      viewCount: 4700,
      likeCount: 231,
      commentCount: 54,
      shareCount: 98,
      saveCount: 44,
      hashtags: ["warehouse", "automation", "logistics", "ERP", "efficiency"],
      isActive: true,
      createdAt: new Date(Date.now() - 216000000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp20",
      tenantId: "t1",
      authorId: "auth20",
      postType: "PRODUCT_SHARE",
      content:
        "Our AquaPure Industrial RO Systems are now available in 500 LPH, 1000 LPH, and 2000 LPH configurations. BIS certified, with 2-year AMC packages. Ideal for food processing, pharma, and hotel industries.",
      mediaUrls: [],
      linkedListingId: "list3",
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 302400000).toISOString(),
      viewCount: 980,
      likeCount: 55,
      commentCount: 14,
      shareCount: 22,
      saveCount: 10,
      hashtags: ["watertreatment", "RO", "industrial", "BIS", "foodprocessing"],
      isActive: true,
      createdAt: new Date(Date.now() - 302400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp21",
      tenantId: "t1",
      authorId: "auth21",
      postType: "TEXT",
      content:
        "Tip for MSME exporters: Apply for the RoDTEP (Remission of Duties and Taxes on Exported Products) scheme before March 31. Refund rates range from 0.3% to 4.3% of FOB value depending on your HS code. Our team can assist with the application. Drop a comment or DM!",
      mediaUrls: [],
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 388800000).toISOString(),
      viewCount: 2100,
      likeCount: 143,
      commentCount: 37,
      shareCount: 88,
      saveCount: 71,
      hashtags: ["RoDTEP", "MSME", "export", "incentive", "trade"],
      isActive: true,
      createdAt: new Date(Date.now() - 388800000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp22",
      tenantId: "t1",
      authorId: "auth22",
      postType: "POLL",
      content: "Which industry sector do you primarily source from on this marketplace?",
      mediaUrls: [],
      pollOptions: [
        { text: "Pharmaceuticals & Healthcare", votes: 210 },
        { text: "Construction & Infrastructure", votes: 165 },
        { text: "Textiles & Apparel", votes: 98 },
        { text: "Food & Agriculture", votes: 87 },
        { text: "Electronics & IT", votes: 74 },
      ],
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 475200000).toISOString(),
      viewCount: 3200,
      likeCount: 88,
      commentCount: 42,
      shareCount: 56,
      saveCount: 19,
      hashtags: ["poll", "marketplace", "industry", "sourcing"],
      isActive: true,
      createdAt: new Date(Date.now() - 475200000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp23",
      tenantId: "t1",
      authorId: "auth23",
      postType: "IMAGE",
      content:
        "Fresh from the fields — our organically grown Alphonso mangoes are ready for bulk orders! APEDA certified, exported to UAE, UK, and EU. Domestic bulk buyers welcome. Season ends in 6 weeks.",
      mediaUrls: [{ type: "IMAGE", url: "/placeholder-mango.jpg" }],
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 561600000).toISOString(),
      viewCount: 2450,
      likeCount: 187,
      commentCount: 52,
      shareCount: 94,
      saveCount: 38,
      hashtags: ["Alphonso", "mango", "export", "organic", "APEDA", "agri"],
      isActive: true,
      createdAt: new Date(Date.now() - 561600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mp24",
      tenantId: "t1",
      authorId: "auth24",
      postType: "CUSTOMER_FEEDBACK",
      content:
        "Placed a bulk order for 500 units of solar charge controllers. Delivery was 3 days ahead of schedule! The product quality exceeded our expectations — CE & BIS certified. Our installation team in Rajasthan is very happy. Definitely ordering again next quarter.",
      mediaUrls: [],
      rating: 4,
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(Date.now() - 648000000).toISOString(),
      viewCount: 710,
      likeCount: 41,
      commentCount: 7,
      shareCount: 11,
      saveCount: 5,
      hashtags: ["solar", "renewable", "4stars", "verified", "Rajasthan"],
      isActive: true,
      createdAt: new Date(Date.now() - 648000000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

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
  { label: "#solarenergy", count: "640 posts" },
  { label: "#agriexport", count: "520 posts" },
  { label: "#textileindia", count: "480 posts" },
  { label: "#coldchain", count: "390 posts" },
  { label: "#GeMseller", count: "310 posts" },
];

const SUGGESTED_VENDORS = [
  {
    name: "Cipla Pharma",
    initial: "C",
    color: "var(--color-primary, #1e5f74)",
    category: "Pharmaceuticals",
    followers: "1.2K",
    verified: true,
  },
  {
    name: "Tata Projects",
    initial: "T",
    color: "#0891b2",
    category: "Construction & Infra",
    followers: "3.4K",
    verified: true,
  },
  {
    name: "Reliance Retail",
    initial: "R",
    color: "#dc2626",
    category: "FMCG & Retail",
    followers: "8.7K",
    verified: true,
  },
  {
    name: "SolarMax Systems",
    initial: "S",
    color: "#d97706",
    category: "Renewable Energy",
    followers: "890",
    verified: false,
  },
  {
    name: "GreenFields Agro",
    initial: "G",
    color: "#16a34a",
    category: "Agriculture & Exports",
    followers: "640",
    verified: true,
  },
  {
    name: "StyleCraft Garments",
    initial: "S",
    color: "#ec4899",
    category: "Textiles & Apparel",
    followers: "420",
    verified: false,
  },
  {
    name: "ChemBase Industries",
    initial: "C",
    color: "#0891b2",
    category: "Industrial Chemicals",
    followers: "710",
    verified: true,
  },
];

const MARKET_PULSE = [
  {
    label: "Active Listings",
    value: "14,820",
    icon: "list",
    color: "var(--color-primary, #1e5f74)",
    bg: "var(--color-primary-50, #eef7fa)",
  },
  {
    label: "Open Requirements",
    value: "4,630",
    icon: "search",
    color: "#f97316",
    bg: "#fff7ed",
  },
  {
    label: "Live Offers",
    value: "1,248",
    icon: "tag",
    color: "var(--color-success, #22c55e)",
    bg: "var(--color-success-light, #dcfce7)",
  },
  {
    label: "Verified Vendors",
    value: "6,910",
    icon: "shield",
    color: "#0891b2",
    bg: "#cffafe",
  },
];

// Skeleton types cycling pattern for initial load
const INITIAL_SKELETON_TYPES: SkeletonType[] = [
  "TEXT",
  "OFFER",
  "IMAGE",
  "REQUIREMENT",
  "VIDEO",
  "TEXT",
];

// ── Main component ────────────────────────────────────────────────────────────

export function MarketFeed() {
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("ALL");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [orderOffer, setOrderOffer] = useState<FeedOffer | null>(null);
  const [enquiryTarget, setEnquiryTarget] = useState<EnquiryTarget | null>(null);
  const [visibleCount, setVisibleCount] = useState(999);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data: feedData } = useFeed({ page: 1, limit: 20 });
  const { mutate: toggleLike } = useToggleLike();
  const { mutate: toggleSave } = useToggleSave();
  const { mutate: addComment } = useAddComment();

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const posts = useMemo<ExtendedMarketplacePost[]>(() => {
    const nested = (
      feedData as { data?: { data?: MarketplacePost[] } | MarketplacePost[] }
    )?.data;
    if (!nested) return [];
    if (Array.isArray(nested)) return nested as ExtendedMarketplacePost[];
    const withData = nested as { data?: MarketplacePost[] };
    return (withData.data ?? []) as ExtendedMarketplacePost[];
  }, [feedData]);

  // All feed items with mock posts interleaved
  const ALL_FEED_ITEMS = useMemo<FeedItem[]>(() => {
    const mockPosts = buildMockPosts();
    const postItems: FeedItem[] = (posts.length > 0 ? posts : mockPosts).map((p) => ({
      type: "post",
      data: p,
    }));

    if (activeFilter === "POSTS") return postItems;
    if (activeFilter === "OFFERS")
      return MOCK_OFFERS.map((o) => ({ type: "offer", data: o }));
    if (activeFilter === "REQUIREMENTS")
      return MOCK_REQUIREMENTS.map((r) => ({ type: "requirement", data: r }));
    if (activeFilter === "VIDEOS")
      return postItems.filter((i) => i.type === "post" && i.data.postType === "VIDEO");
    if (activeFilter === "IMAGES")
      return postItems.filter((i) => i.type === "post" && i.data.postType === "IMAGE");

    // ALL: interleave offers and requirements every ~3 posts
    const items: FeedItem[] = [];
    const offerInsertions: Record<number, number> = { 1: 0, 4: 1, 8: 2, 12: 3, 16: 4, 20: 5, 24: 6, 28: 7 };
    const reqInsertions: Record<number, number>   = { 3: 0, 6: 1, 10: 2, 14: 3, 18: 4, 22: 5, 26: 6, 30: 7 };
    postItems.forEach((item, idx) => {
      items.push(item);
      if (offerInsertions[idx] !== undefined && MOCK_OFFERS[offerInsertions[idx]])
        items.push({ type: "offer", data: MOCK_OFFERS[offerInsertions[idx]] });
      if (reqInsertions[idx] !== undefined && MOCK_REQUIREMENTS[reqInsertions[idx]])
        items.push({ type: "requirement", data: MOCK_REQUIREMENTS[reqInsertions[idx]] });
    });

    // If post stream is very short, append remaining offers/requirements
    if (postItems.length <= 2) {
      MOCK_OFFERS.slice(2).forEach((o) => items.push({ type: "offer", data: o }));
      MOCK_REQUIREMENTS.slice(2).forEach((r) => items.push({ type: "requirement", data: r }));
    }

    return items;
  }, [posts, activeFilter]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoadingMore &&
          visibleCount < ALL_FEED_ITEMS.length
        ) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((v) => Math.min(v + 12, ALL_FEED_ITEMS.length));
            setIsLoadingMore(false);
          }, 1200);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isLoadingMore, visibleCount, ALL_FEED_ITEMS.length]);

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(999);
  }, [activeFilter]);

  const visibleItems = ALL_FEED_ITEMS.slice(0, visibleCount);
  const allCaughtUp = !initialLoading && visibleCount >= ALL_FEED_ITEMS.length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f5f9", marginTop: -10 }}>
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
                    borderBottom: `2px solid ${active ? "var(--color-primary, #1e5f74)" : "transparent"}`,
                    color: active ? "var(--color-primary, #1e5f74)" : "#64748b",
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
                    color={active ? "var(--color-primary, #1e5f74)" : "#94a3b8"}
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
              backgroundColor: "var(--color-primary, #1e5f74)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
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
                background:
                  "linear-gradient(135deg, var(--color-primary, #1e5f74), var(--color-primary-hover, #174d5f))",
              }}
            />
            <div style={{ padding: "0 16px 16px", textAlign: "center" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  backgroundColor: "var(--color-primary, #1e5f74)",
                  border: "3px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: 700,
                  margin: "-26px auto 10px",
                  boxShadow: "0 2px 8px rgba(30,95,116,0.3)",
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
                  <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase" }}>
                    Followers
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>183</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase" }}>
                    Following
                  </div>
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
              { label: "My Posts", icon: "file-text", color: "var(--color-primary, #1e5f74)" },
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
                    backgroundColor: `${color}18`,
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
                  color: "var(--color-primary, #1e5f74)",
                  border: "1.5px solid var(--color-primary-100, #cce8f0)",
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
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--color-primary-50, #eef7fa)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
              >
                <Icon name="user-plus" size={14} color="var(--color-primary, #1e5f74)" />
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
                backgroundColor: "var(--color-primary, #1e5f74)",
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
                e.currentTarget.style.borderColor = "var(--color-primary, #1e5f74)";
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
                { icon: "image", color: "var(--color-success, #22c55e)", title: "Photo" },
                { icon: "video", color: "var(--color-warning, #f59e0b)", title: "Video" },
                { icon: "tag", color: "var(--color-primary, #1e5f74)", title: "Offer" },
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
                  <Icon
                    name={icon as Parameters<typeof Icon>[0]["name"]}
                    size={15}
                    color={color}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Initial loading skeletons */}
          {initialLoading && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {INITIAL_SKELETON_TYPES.map((type, i) => (
                <FeedItemSkeleton key={i} type={type} />
              ))}
            </div>
          )}

          {/* Feed items */}
          {!initialLoading && ALL_FEED_ITEMS.length === 0 && (
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
                  backgroundColor: "var(--color-primary, #1e5f74)",
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

          {!initialLoading &&
            visibleItems.map((item) => {
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
                    onOrder={(id) => {
                      const o = MOCK_OFFERS.find((x) => x.id === id);
                      if (o) setOrderOffer(o);
                    }}
                    onEnquiry={(id) => {
                      const o = MOCK_OFFERS.find((x) => x.id === id);
                      if (o)
                        setEnquiryTarget({
                          id: o.id,
                          name: o.productName,
                          vendorOrBuyerName: o.vendorName,
                          type: "offer",
                        });
                    }}
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
                    onQuote={(id) => {
                      const r = MOCK_REQUIREMENTS.find((x) => x.id === id);
                      if (r)
                        setEnquiryTarget({
                          id: r.id,
                          name: r.title,
                          vendorOrBuyerName: r.buyerName,
                          type: "requirement",
                        });
                    }}
                    onEnquire={(id) => {
                      const r = MOCK_REQUIREMENTS.find((x) => x.id === id);
                      if (r)
                        setEnquiryTarget({
                          id: r.id,
                          name: r.title,
                          vendorOrBuyerName: r.buyerName,
                          type: "requirement",
                        });
                    }}
                    onLike={(id) => console.log("like req", id)}
                    onShare={(id) => console.log("share req", id)}
                  />
                );
              }
              return null;
            })}

          {/* Sentinel for IntersectionObserver */}
          {!initialLoading && (
            <div ref={sentinelRef} style={{ height: 20 }} />
          )}

          {/* Loading more skeletons */}
          {isLoadingMore && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <FeedItemSkeleton type="TEXT" />
              <FeedItemSkeleton type="OFFER" />
            </div>
          )}

          {/* All caught up */}
          {allCaughtUp && ALL_FEED_ITEMS.length > 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0 40px",
                color: "#94a3b8",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "#fff",
                  borderRadius: 24,
                  padding: "10px 20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <Icon name="check-circle" size={15} color="#059669" />
                You&apos;re all caught up!
              </div>
            </div>
          )}
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
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Icon name="trending-up" size={16} color="var(--color-primary, #1e5f74)" />
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
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--color-primary-50, #eef7fa)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8fafc")
                  }
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--color-primary, #1e5f74)",
                      }}
                    >
                      {topic.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{topic.count}</div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      backgroundColor: "var(--color-primary-50, #eef7fa)",
                      color: "var(--color-primary, #1e5f74)",
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
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Icon name="users" size={16} color="#059669" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                Suggested Vendors
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SUGGESTED_VENDORS.map((vendor) => (
                <div key={vendor.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1e293b",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {vendor.name}
                      </span>
                      {vendor.verified && (
                        <Icon name="badge-check" size={13} color="var(--color-primary, #1e5f74)" />
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      {vendor.category} · {vendor.followers} followers
                    </div>
                  </div>
                  <button
                    style={{
                      padding: "5px 12px",
                      border: "1.5px solid var(--color-primary, #1e5f74)",
                      borderRadius: 20,
                      backgroundColor: "#fff",
                      color: "var(--color-primary, #1e5f74)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      flexShrink: 0,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--color-primary-50, #eef7fa)")
                    }
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
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Icon name="activity" size={16} color="#f97316" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Market Pulse</span>
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
                    <Icon
                      name={stat.icon as Parameters<typeof Icon>[0]["name"]}
                      size={14}
                      color={stat.color}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: stat.color,
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                      {stat.label}
                    </div>
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

      {/* Order Form Modal */}
      <OrderFormModal offer={orderOffer} onClose={() => setOrderOffer(null)} />

      {/* Enquiry Form Modal */}
      <EnquiryFormModal target={enquiryTarget} onClose={() => setEnquiryTarget(null)} />
    </div>
  );
}
