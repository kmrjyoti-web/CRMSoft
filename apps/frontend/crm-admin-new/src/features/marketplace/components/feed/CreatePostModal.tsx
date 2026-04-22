"use client";
import { useState } from "react";
import { Icon } from "@/components/ui";
import { useCreatePost } from "../../hooks/useMarketplace";
import type { PostType, VisibilityType, CreatePostDto } from "../../types/marketplace.types";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const POST_TYPES: { value: PostType; label: string; icon: string; color: string; bg: string }[] = [
  { value: "TEXT", label: "Text", icon: "type", color: "var(--color-primary, #1e5f74)", bg: "var(--color-primary-50, #eef7fa)" },
  { value: "IMAGE", label: "Photo", icon: "image", color: "#16a34a", bg: "#f0fdf4" },
  { value: "VIDEO", label: "Video", icon: "video", color: "#d97706", bg: "#fef3c7" },
  { value: "PRODUCT_SHARE", label: "Product", icon: "package", color: "#7c3aed", bg: "#f5f3ff" },
  { value: "PRODUCT_LAUNCH", label: "Launch", icon: "rocket", color: "#ea580c", bg: "#fff7ed" },
  { value: "REQUIREMENT", label: "Looking For", icon: "search", color: "#f97316", bg: "#fff7ed" },
  { value: "ANNOUNCEMENT", label: "Announce", icon: "megaphone", color: "#dc2626", bg: "#fef2f2" },
  { value: "CUSTOMER_FEEDBACK", label: "Review", icon: "star", color: "#9d174d", bg: "#fdf2f8" },
  { value: "POLL", label: "Poll", icon: "bar-chart-2", color: "#0369a1", bg: "#f0f9ff" },
];

const VISIBILITY_OPTIONS: { value: VisibilityType; label: string; icon: string }[] = [
  { value: "PUBLIC", label: "Public", icon: "globe" },
  { value: "GEO_TARGETED", label: "My Area", icon: "map-pin" },
  { value: "MY_CONTACTS", label: "My Contacts", icon: "users" },
  { value: "VERIFIED_ONLY", label: "Verified Only", icon: "shield-check" },
];

// ── Star picker ───────────────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 2,
            fontSize: 28,
            color: i <= (hovered || value) ? "#f59e0b" : "#d1d5db",
            transition: "color 0.1s",
            lineHeight: 1,
          }}
        >
          ★
        </button>
      ))}
      <span style={{ alignSelf: "center", fontSize: 13, fontWeight: 600, color: "#78350f", marginLeft: 6 }}>
        {value}.0 / 5.0
      </span>
    </div>
  );
}

// ── Label helper ──────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, display: "block" }}>
      {children}
    </label>
  );
}

function inputStyle(hasError = false): React.CSSProperties {
  return {
    width: "100%",
    border: `1px solid ${hasError ? "#dc2626" : "#e2e8f0"}`,
    borderRadius: 8,
    padding: "9px 14px",
    fontSize: 14,
    color: "#1e293b",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };
}

// ── Main component ────────────────────────────────────────────────────────────

export function CreatePostModal({ open, onClose, onSuccess }: CreatePostModalProps) {
  const [postType, setPostType] = useState<PostType>("TEXT");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<VisibilityType>("PUBLIC");
  const [hashtags, setHashtags] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  // PRODUCT_LAUNCH / PRODUCT_SHARE extras
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [badgeText, setBadgeText] = useState("");

  // REQUIREMENT extras
  const [reqCategory, setReqCategory] = useState("");
  const [reqQuantity, setReqQuantity] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [deadline, setDeadline] = useState("");

  // CUSTOMER_FEEDBACK
  const [rating, setRating] = useState(5);

  // POLL
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const { mutate: createPost, isPending } = useCreatePost();

  function addPollOption() {
    if (pollOptions.length < 6) setPollOptions((v) => [...v, ""]);
  }
  function removePollOption(idx: number) {
    if (pollOptions.length > 2) setPollOptions((v) => v.filter((_, i) => i !== idx));
  }
  function updatePollOption(idx: number, val: string) {
    setPollOptions((v) => v.map((o, i) => (i === idx ? val : o)));
  }

  function handleSubmit() {
    if (!content.trim()) {
      setError("Content is required.");
      return;
    }
    if (postType === "POLL") {
      const filled = pollOptions.filter((o) => o.trim());
      if (filled.length < 2) {
        setError("A poll needs at least 2 options.");
        return;
      }
    }
    if (postType === "REQUIREMENT" && !reqCategory.trim()) {
      setError("Category is required for a requirement post.");
      return;
    }
    setError("");

    const dto: CreatePostDto = {
      postType,
      content: content.trim(),
      visibility,
      hashtags: hashtags
        .split(/[\s,]+/)
        .map((t) => t.replace(/^#/, "").trim())
        .filter(Boolean),
      pollOptions: postType === "POLL"
        ? pollOptions.filter((o) => o.trim()).map((text) => ({ text: text.trim() }))
        : undefined,
      productName: (postType === "PRODUCT_SHARE" || postType === "PRODUCT_LAUNCH") ? productName || undefined : undefined,
      productPrice: (postType === "PRODUCT_SHARE" || postType === "PRODUCT_LAUNCH") && productPrice
        ? parseFloat(productPrice)
        : undefined,
      badgeText: postType === "PRODUCT_LAUNCH" ? badgeText || undefined : undefined,
      rating: postType === "CUSTOMER_FEEDBACK" ? rating : undefined,
      reqCategory: postType === "REQUIREMENT" ? reqCategory || undefined : undefined,
      reqQuantity: postType === "REQUIREMENT" ? reqQuantity || undefined : undefined,
      budgetMin: postType === "REQUIREMENT" && budgetMin ? parseFloat(budgetMin) : undefined,
      budgetMax: postType === "REQUIREMENT" && budgetMax ? parseFloat(budgetMax) : undefined,
      deadline: postType === "REQUIREMENT" ? deadline || undefined : undefined,
    };

    createPost(dto, {
      onSuccess: () => {
        resetForm();
        onSuccess?.();
        onClose();
      },
      onError: () => {
        setError("Failed to create post. Please try again.");
      },
    });
  }

  function resetForm() {
    setContent(""); setTitle(""); setHashtags(""); setPostType("TEXT"); setVisibility("PUBLIC");
    setProductName(""); setProductPrice(""); setBadgeText(""); setRating(5);
    setPollOptions(["", ""]);
    setReqCategory(""); setReqQuantity(""); setBudgetMin(""); setBudgetMax(""); setDeadline("");
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) { resetForm(); onClose(); }
  }

  if (!open) return null;

  const activeType = POST_TYPES.find((t) => t.value === postType)!;

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 16, backdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff", borderRadius: 16, width: "100%", maxWidth: 580,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)", overflow: "hidden",
          maxHeight: "90vh", display: "flex", flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: activeType.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={activeType.icon as Parameters<typeof Icon>[0]["name"]} size={16} color="#fff" />
            </div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Create Post</h3>
          </div>
          <button
            onClick={() => { resetForm(); onClose(); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, color: "#64748b", display: "flex", alignItems: "center" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 18, overflowY: "auto" }}>

          {/* Post type selector */}
          <div>
            <FieldLabel>Post Type</FieldLabel>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {POST_TYPES.map((pt) => {
                const active = postType === pt.value;
                return (
                  <button
                    key={pt.value}
                    onClick={() => { setPostType(pt.value); setError(""); }}
                    style={{
                      padding: "6px 12px", borderRadius: 20,
                      border: `1.5px solid ${active ? pt.color : "#e2e8f0"}`,
                      backgroundColor: active ? pt.bg : "#fff",
                      color: active ? pt.color : "#64748b",
                      fontSize: 12, fontWeight: active ? 600 : 400,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                      transition: "all 0.15s",
                    }}
                  >
                    <Icon name={pt.icon as Parameters<typeof Icon>[0]["name"]} size={12} color={active ? pt.color : "#94a3b8"} />
                    {pt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title (optional, not for POLL) */}
          {postType !== "POLL" && (
            <div>
              <FieldLabel>Title <span style={{ color: "#94a3b8", textTransform: "none", fontWeight: 400 }}>(optional)</span></FieldLabel>
              <input
                value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title..."
                style={inputStyle()}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary, #1e5f74)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
              />
            </div>
          )}

          {/* Content */}
          <div>
            <FieldLabel>
              {postType === "POLL" ? "Poll Question" : postType === "REQUIREMENT" ? "Describe Your Requirement" : "Content"}{" "}
              <span style={{ color: "#dc2626" }}>*</span>
            </FieldLabel>
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); if (error) setError(""); }}
              placeholder={
                postType === "POLL" ? "What do you want to ask your network?"
                : postType === "PRODUCT_LAUNCH" ? "Describe your new product launch..."
                : postType === "CUSTOMER_FEEDBACK" ? "Share your experience or customer testimonial..."
                : postType === "ANNOUNCEMENT" ? "Write your announcement here..."
                : postType === "REQUIREMENT" ? "Describe what you need — specs, certifications, delivery terms, preferred vendors..."
                : "What's on your mind? Share an update, product, or announcement..."
              }
              rows={postType === "POLL" ? 2 : 5}
              style={{
                width: "100%", border: `1px solid ${error ? "#dc2626" : "#e2e8f0"}`,
                borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#1e293b",
                resize: "vertical", outline: "none", boxSizing: "border-box",
                fontFamily: "inherit", lineHeight: 1.5,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = error ? "#dc2626" : "var(--color-primary, #1e5f74)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = error ? "#dc2626" : "#e2e8f0")}
            />
            {error && <span style={{ fontSize: 12, color: "#dc2626", marginTop: 4, display: "block" }}>{error}</span>}
          </div>

          {/* ── POLL: dynamic options ──────────────────────────────────── */}
          {postType === "POLL" && (
            <div>
              <FieldLabel>Poll Options <span style={{ color: "#dc2626" }}>*</span></FieldLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pollOptions.map((opt, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: "#f0f9ff", border: "1.5px solid #bae6fd", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#0369a1" }}>
                      {idx + 1}
                    </div>
                    <input
                      value={opt}
                      onChange={(e) => updatePollOption(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}...`}
                      style={{ ...inputStyle(), flex: 1 }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#0369a1")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePollOption(idx)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4, borderRadius: 4, flexShrink: 0 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                      >
                        <Icon name="x" size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={addPollOption}
                    style={{
                      padding: "7px 14px", border: "1.5px dashed #bae6fd", borderRadius: 8,
                      background: "none", color: "#0369a1", fontSize: 13, fontWeight: 500,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f9ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <Icon name="plus" size={13} color="#0369a1" />
                    Add Option
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── PRODUCT_SHARE / PRODUCT_LAUNCH: product info ────────────── */}
          {(postType === "PRODUCT_SHARE" || postType === "PRODUCT_LAUNCH") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <FieldLabel>Product Name</FieldLabel>
                <input
                  value={productName} onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Paracetamol 500mg Tablets..."
                  style={inputStyle()}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary, #1e5f74)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <FieldLabel>Price (₹)</FieldLabel>
                  <input
                    type="number" min="0" step="0.01"
                    value={productPrice} onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="0.00"
                    style={inputStyle()}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary, #1e5f74)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                  />
                </div>
                {postType === "PRODUCT_LAUNCH" && (
                  <div>
                    <FieldLabel>Launch Badge <span style={{ color: "#94a3b8", textTransform: "none", fontWeight: 400 }}>(optional)</span></FieldLabel>
                    <input
                      value={badgeText} onChange={(e) => setBadgeText(e.target.value)}
                      placeholder="e.g. NEW LAUNCH / EARLY BIRD"
                      style={inputStyle()}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#ea580c")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── REQUIREMENT: category, quantity, budget, deadline ─────────── */}
          {postType === "REQUIREMENT" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Category + Quantity */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <FieldLabel>Category <span style={{ color: "#dc2626" }}>*</span></FieldLabel>
                  <input
                    value={reqCategory} onChange={(e) => setReqCategory(e.target.value)}
                    placeholder="e.g. Medical Supplies"
                    style={inputStyle()}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#f97316")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                  />
                </div>
                <div>
                  <FieldLabel>Quantity <span style={{ color: "#94a3b8", textTransform: "none", fontWeight: 400 }}>(optional)</span></FieldLabel>
                  <input
                    value={reqQuantity} onChange={(e) => setReqQuantity(e.target.value)}
                    placeholder="e.g. 5000 units/month"
                    style={inputStyle()}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#f97316")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                  />
                </div>
              </div>
              {/* Budget range */}
              <div>
                <FieldLabel>Budget Range (₹) <span style={{ color: "#94a3b8", textTransform: "none", fontWeight: 400 }}>(optional)</span></FieldLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center" }}>
                  <input
                    type="number" min="0" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="Min (e.g. 80000)"
                    style={inputStyle()}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#f97316")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                  />
                  <span style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>to</span>
                  <input
                    type="number" min="0" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)}
                    placeholder="Max (e.g. 150000)"
                    style={inputStyle()}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#f97316")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                  />
                </div>
              </div>
              {/* Deadline */}
              <div>
                <FieldLabel>Deadline <span style={{ color: "#94a3b8", textTransform: "none", fontWeight: 400 }}>(optional)</span></FieldLabel>
                <input
                  type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                  style={inputStyle()}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#f97316")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                />
              </div>
              {/* Info banner */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, backgroundColor: "#fff7ed", borderRadius: 8, padding: "10px 12px", border: "1px solid #fed7aa" }}>
                <Icon name="info" size={14} color="#f97316" />
                <span style={{ fontSize: 12, color: "#7c2d12", lineHeight: 1.5 }}>
                  Your requirement will appear as a <strong>"Looking For"</strong> card in the feed. Vendors can submit quotes or enquiries directly.
                </span>
              </div>
            </div>
          )}

          {/* ── CUSTOMER_FEEDBACK: star rating ────────────────────────────── */}
          {postType === "CUSTOMER_FEEDBACK" && (
            <div>
              <FieldLabel>Rating <span style={{ color: "#dc2626" }}>*</span></FieldLabel>
              <StarPicker value={rating} onChange={setRating} />
            </div>
          )}

          {/* Media upload placeholder for IMAGE/VIDEO */}
          {(postType === "IMAGE" || postType === "VIDEO") && (
            <div>
              <FieldLabel>{postType === "IMAGE" ? "Upload Photo" : "Upload Video"}</FieldLabel>
              <div
                style={{ border: "2px dashed #e2e8f0", borderRadius: 10, padding: "24px 16px", textAlign: "center", cursor: "pointer", backgroundColor: "#fafafa", transition: "border-color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-primary, #1e5f74)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
              >
                <Icon name={postType === "IMAGE" ? "image" : "video"} size={28} color="#94a3b8" />
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 8, fontWeight: 500 }}>Click to upload or drag &amp; drop</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{postType === "IMAGE" ? "PNG, JPG, WebP up to 10MB" : "MP4, WebM up to 100MB"}</div>
              </div>
            </div>
          )}

          {/* Hashtags */}
          <div>
            <FieldLabel>Hashtags <span style={{ color: "#94a3b8", textTransform: "none", fontWeight: 400 }}>(optional)</span></FieldLabel>
            <input
              value={hashtags} onChange={(e) => setHashtags(e.target.value)}
              placeholder="#pharma #tablets #offer"
              style={inputStyle()}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary, #1e5f74)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
            />
          </div>

          {/* Visibility */}
          <div>
            <FieldLabel>Visibility</FieldLabel>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {VISIBILITY_OPTIONS.map((opt) => {
                const active = visibility === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setVisibility(opt.value)}
                    style={{
                      padding: "7px 14px", borderRadius: 20,
                      border: `1.5px solid ${active ? "var(--color-primary, #1e5f74)" : "#e2e8f0"}`,
                      backgroundColor: active ? "var(--color-primary-50, #eef7fa)" : "#fff",
                      color: active ? "var(--color-primary, #1e5f74)" : "#64748b",
                      fontSize: 13, fontWeight: active ? 600 : 400,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                      transition: "all 0.15s",
                    }}
                  >
                    <Icon name={opt.icon as Parameters<typeof Icon>[0]["name"]} size={13} color={active ? "var(--color-primary, #1e5f74)" : "#94a3b8"} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 10, backgroundColor: "#fafafa", flexShrink: 0 }}>
          <button
            onClick={() => { resetForm(); onClose(); }}
            disabled={isPending}
            style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "#fff", color: "#64748b", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !content.trim()}
            style={{
              padding: "9px 24px", borderRadius: 8, border: "none",
              backgroundColor: isPending || !content.trim() ? "var(--color-primary-100, #cce8f0)" : activeType.color,
              color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: isPending || !content.trim() ? "default" : "pointer",
              display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s",
            }}
          >
            {isPending ? (
              <><Icon name="loader" size={15} color="#fff" />Publishing...</>
            ) : (
              <><Icon name="send" size={15} color="#fff" />Publish Post</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
