"use client";
import { useState, useEffect } from "react";
import { Icon } from "@/components/ui";
import type { MarketplacePost, VisibilityType, UpdatePostDto } from "../../types/marketplace.types";

interface EditPostModalProps {
  post: MarketplacePost | null;
  onClose: () => void;
  onSaved?: (updatedPost: MarketplacePost) => void;
}

const TRANSACTIONAL_TYPES = new Set(["PRODUCT_SHARE", "PRODUCT_LAUNCH"]);

const VISIBILITY_OPTIONS: { value: VisibilityType; label: string; icon: string }[] = [
  { value: "PUBLIC", label: "Public", icon: "globe" },
  { value: "GEO_TARGETED", label: "My Area", icon: "map-pin" },
  { value: "MY_CONTACTS", label: "My Contacts", icon: "users" },
  { value: "VERIFIED_ONLY", label: "Verified Only", icon: "shield-check" },
];

const POST_TYPE_COLORS: Record<string, string> = {
  TEXT: "var(--color-primary, #1e5f74)",
  IMAGE: "#16a34a",
  VIDEO: "#d97706",
  PRODUCT_SHARE: "#7c3aed",
  PRODUCT_LAUNCH: "#ea580c",
  ANNOUNCEMENT: "#dc2626",
  CUSTOMER_FEEDBACK: "#9d174d",
  POLL: "#0369a1",
};

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
            background: "none", border: "none", cursor: "pointer", padding: 2,
            fontSize: 28, color: i <= (hovered || value) ? "#f59e0b" : "#d1d5db",
            transition: "color 0.1s", lineHeight: 1,
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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, display: "block" }}>
      {children}
    </label>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    width: "100%", border: "1px solid #e2e8f0", borderRadius: 8,
    padding: "9px 14px", fontSize: 14, color: "#1e293b",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };
}

// ── Version history panel ─────────────────────────────────────────────────────

function VersionHistoryPanel({ currentVersion }: { currentVersion: number }) {
  const mockVersions = Array.from({ length: currentVersion }, (_, i) => ({
    version: i + 1,
    editedAt: new Date(Date.now() - (currentVersion - i - 1) * 86400000 * 2).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    views: [45, 120, 210][i] ?? 80,
    likes: [8, 22, 41][i] ?? 15,
    comments: [2, 6, 11][i] ?? 4,
    enquiries: [1, 3, 5][i] ?? 2,
    orders: [0, 1, 2][i] ?? 1,
    isLatest: i + 1 === currentVersion,
  }));

  return (
    <div style={{ backgroundColor: "#f8fafc", borderRadius: 10, padding: 14, border: "1px solid #e2e8f0" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
        Version History
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {mockVersions.map((v) => (
          <div
            key={v.version}
            style={{
              backgroundColor: v.isLatest ? "var(--color-primary-50, #eef7fa)" : "#fff",
              border: `1px solid ${v.isLatest ? "var(--color-primary-100, #cce8f0)" : "#e2e8f0"}`,
              borderRadius: 8, padding: "10px 12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                  backgroundColor: v.isLatest ? "var(--color-primary, #1e5f74)" : "#e2e8f0",
                  color: v.isLatest ? "#fff" : "#64748b",
                }}>
                  v{v.version}
                </span>
                {v.isLatest && (
                  <span style={{ fontSize: 10, color: "var(--color-primary, #1e5f74)", fontWeight: 600 }}>CURRENT</span>
                )}
              </div>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>{v.editedAt}</span>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { icon: "eye", label: `${v.views} views` },
                { icon: "thumbs-up", label: `${v.likes} likes` },
                { icon: "message-circle", label: `${v.comments} comments` },
                { icon: "mail", label: `${v.enquiries} enq` },
                { icon: "shopping-cart", label: `${v.orders} orders` },
              ].map(({ icon, label }) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#64748b" }}>
                  <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={10} color="#94a3b8" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function EditPostModal({ post, onClose, onSaved }: EditPostModalProps) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<VisibilityType>("PUBLIC");
  const [hashtags, setHashtags] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [rating, setRating] = useState(5);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [editReason, setEditReason] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const isTransactional = post ? TRANSACTIONAL_TYPES.has(post.postType) : false;
  const currentVersion = post?.version ?? 1;

  // Pre-fill from post
  useEffect(() => {
    if (!post) return;
    setContent(post.content ?? "");
    setVisibility(post.visibility);
    setHashtags((post.hashtags ?? []).map((h) => `#${h}`).join(" "));
    setProductName(post.productName ?? "");
    setProductPrice(post.productPrice != null ? String(post.productPrice) : "");
    setBadgeText(post.badgeText ?? "");
    setRating(post.rating ?? 5);
    setPollOptions(post.pollOptions?.length ? post.pollOptions.map((o) => o.text) : ["", ""]);
    setEditReason("");
    setError("");
    setShowHistory(false);
  }, [post?.id]);

  if (!post) return null;

  const typeColor = POST_TYPE_COLORS[post.postType] ?? "var(--color-primary, #1e5f74)";

  function handleSave() {
    if (!post) return;
    if (!content.trim()) { setError("Content is required."); return; }
    if (isTransactional && !editReason.trim()) { setError("Please provide an edit reason for transactional posts."); return; }
    setError("");
    setIsPending(true);

    const currentPost = post; // non-null, captured for setTimeout closure

    const newHashtags = hashtags.split(/[\s,]+/).map((t) => t.replace(/^#/, "").trim()).filter(Boolean);
    const dto: UpdatePostDto = {
      content: content.trim(),
      visibility,
      hashtags: newHashtags,
      productName: productName || undefined,
      productPrice: productPrice ? parseFloat(productPrice) : undefined,
      badgeText: badgeText || undefined,
      rating: currentPost.postType === "CUSTOMER_FEEDBACK" ? rating : undefined,
      pollOptions: currentPost.postType === "POLL" ? pollOptions.filter((o) => o.trim()).map((text) => ({ text })) : undefined,
      editReason: editReason || undefined,
    };

    // Simulate API call
    setTimeout(() => {
      setIsPending(false);
      const updatedPost: MarketplacePost = {
        ...currentPost,
        content: dto.content ?? currentPost.content,
        visibility: (dto.visibility ?? currentPost.visibility) as VisibilityType,
        hashtags: newHashtags,
        productName: dto.productName,
        productPrice: dto.productPrice,
        badgeText: dto.badgeText,
        rating: dto.rating ?? currentPost.rating,
        pollOptions: dto.pollOptions
          ? dto.pollOptions.map((o) => ({ text: o.text, votes: 0 }))
          : currentPost.pollOptions,
        version: isTransactional ? currentVersion + 1 : currentVersion,
        isLatestVersion: true,
        editedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSaved?.(updatedPost);
      onClose();
    }, 800);
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function addPollOption() {
    if (pollOptions.length < 6) setPollOptions((v) => [...v, ""]);
  }
  function removePollOption(idx: number) {
    if (pollOptions.length > 2) setPollOptions((v) => v.filter((_, i) => i !== idx));
  }
  function updatePollOption(idx: number, val: string) {
    setPollOptions((v) => v.map((o, i) => (i === idx ? val : o)));
  }

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
          maxHeight: "92vh", display: "flex", flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: typeColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="edit-2" size={16} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Edit Post</h3>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                {isTransactional ? (
                  <span style={{ color: "#ea580c", fontWeight: 600 }}>Transactional post — will create v{currentVersion + 1}</span>
                ) : (
                  `${post.postType} · v${currentVersion}`
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isTransactional && (
              <button
                onClick={() => setShowHistory((v) => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                  border: "1px solid #e2e8f0", borderRadius: 8, background: showHistory ? "var(--color-primary-50, #eef7fa)" : "#fff",
                  color: showHistory ? "var(--color-primary, #1e5f74)" : "#64748b",
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                }}
              >
                <Icon name="clock" size={12} color={showHistory ? "var(--color-primary, #1e5f74)" : "#94a3b8"} />
                Version Log
              </button>
            )}
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, color: "#64748b", display: "flex", alignItems: "center" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Icon name="x" size={20} />
            </button>
          </div>
        </div>

        {/* Transactional versioning banner */}
        {isTransactional && (
          <div style={{
            backgroundColor: "#fff7ed", borderBottom: "1px solid #fed7aa",
            padding: "10px 20px", display: "flex", alignItems: "flex-start", gap: 10, flexShrink: 0,
          }}>
            <Icon name="alert-triangle" size={16} color="#ea580c" />
            <div style={{ fontSize: 12, color: "#7c2d12", lineHeight: 1.5 }}>
              <strong>Versioning enabled:</strong> Editing this {post.postType === "PRODUCT_SHARE" ? "product" : "launch"} post will create a new version (v{currentVersion + 1}).
              The old version (v{currentVersion}) is preserved — customers who placed orders on v{currentVersion} will still see the price they ordered at.
            </div>
          </div>
        )}

        {/* Scrollable body */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 18, overflowY: "auto" }}>

          {/* Version history (when expanded) */}
          {showHistory && isTransactional && (
            <VersionHistoryPanel currentVersion={currentVersion} />
          )}

          {/* Content */}
          <div>
            <FieldLabel>
              {post.postType === "POLL" ? "Poll Question" : "Content"}{" "}
              <span style={{ color: "#dc2626" }}>*</span>
            </FieldLabel>
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); if (error) setError(""); }}
              rows={post.postType === "POLL" ? 2 : 5}
              style={{
                width: "100%", border: `1px solid ${error ? "#dc2626" : "#e2e8f0"}`,
                borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#1e293b",
                resize: "vertical", outline: "none", boxSizing: "border-box",
                fontFamily: "inherit", lineHeight: 1.5,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = error ? "#dc2626" : typeColor)}
              onBlur={(e) => (e.currentTarget.style.borderColor = error ? "#dc2626" : "#e2e8f0")}
            />
          </div>

          {/* POLL options */}
          {post.postType === "POLL" && (
            <div>
              <FieldLabel>Poll Options</FieldLabel>
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
                        type="button" onClick={() => removePollOption(idx)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4, borderRadius: 4, flexShrink: 0 }}
                      >
                        <Icon name="x" size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 6 && (
                  <button
                    type="button" onClick={addPollOption}
                    style={{ padding: "7px 14px", border: "1.5px dashed #bae6fd", borderRadius: 8, background: "none", color: "#0369a1", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Icon name="plus" size={13} color="#0369a1" />Add Option
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PRODUCT_SHARE / PRODUCT_LAUNCH fields */}
          {(post.postType === "PRODUCT_SHARE" || post.postType === "PRODUCT_LAUNCH") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <FieldLabel>Product Name</FieldLabel>
                <input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Product name..." style={inputStyle()} onFocus={(e) => (e.currentTarget.style.borderColor = typeColor)} onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <FieldLabel>Price (₹)</FieldLabel>
                  <input type="number" min="0" step="0.01" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="0.00" style={inputStyle()} onFocus={(e) => (e.currentTarget.style.borderColor = typeColor)} onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")} />
                </div>
                {post.postType === "PRODUCT_LAUNCH" && (
                  <div>
                    <FieldLabel>Launch Badge</FieldLabel>
                    <input value={badgeText} onChange={(e) => setBadgeText(e.target.value)} placeholder="NEW LAUNCH" style={inputStyle()} onFocus={(e) => (e.currentTarget.style.borderColor = typeColor)} onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CUSTOMER_FEEDBACK rating */}
          {post.postType === "CUSTOMER_FEEDBACK" && (
            <div>
              <FieldLabel>Rating</FieldLabel>
              <StarPicker value={rating} onChange={setRating} />
            </div>
          )}

          {/* Hashtags */}
          <div>
            <FieldLabel>Hashtags <span style={{ color: "#94a3b8", textTransform: "none", fontWeight: 400 }}>(optional)</span></FieldLabel>
            <input value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder="#pharma #tablets" style={inputStyle()} onFocus={(e) => (e.currentTarget.style.borderColor = typeColor)} onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")} />
          </div>

          {/* Visibility */}
          <div>
            <FieldLabel>Visibility</FieldLabel>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {VISIBILITY_OPTIONS.map((opt) => {
                const active = visibility === opt.value;
                return (
                  <button key={opt.value} onClick={() => setVisibility(opt.value)} style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${active ? typeColor : "#e2e8f0"}`, backgroundColor: active ? `${typeColor}18` : "#fff", color: active ? typeColor : "#64748b", fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    <Icon name={opt.icon as Parameters<typeof Icon>[0]["name"]} size={13} color={active ? typeColor : "#94a3b8"} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Edit reason (required for transactional) */}
          {isTransactional && (
            <div>
              <FieldLabel>
                Reason for edit <span style={{ color: "#dc2626" }}>*</span>
              </FieldLabel>
              <input
                value={editReason}
                onChange={(e) => { setEditReason(e.target.value); if (error) setError(""); }}
                placeholder="e.g. Price updated from ₹500 to ₹600 — raw material cost increase"
                style={{ ...inputStyle(), border: `1px solid ${error && !editReason.trim() ? "#dc2626" : "#e2e8f0"}` }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#ea580c")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
              />
              <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, display: "block" }}>
                This reason will be visible in the version log for transparency.
              </span>
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="alert-circle" size={14} color="#dc2626" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fafafa", flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            {isTransactional ? `Saves as v${currentVersion + 1} · v${currentVersion} preserved` : "Edit saves in-place"}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose} disabled={isPending}
              style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "#fff", color: "#64748b", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave} disabled={isPending || !content.trim()}
              style={{
                padding: "9px 24px", borderRadius: 8, border: "none",
                backgroundColor: isPending || !content.trim() ? "#cbd5e1" : typeColor,
                color: "#fff", fontSize: 14, fontWeight: 600,
                cursor: isPending || !content.trim() ? "default" : "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {isPending ? (
                <><Icon name="loader" size={15} color="#fff" />Saving...</>
              ) : isTransactional ? (
                <><Icon name="git-branch" size={15} color="#fff" />Save as v{currentVersion + 1}</>
              ) : (
                <><Icon name="check" size={15} color="#fff" />Save Changes</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
