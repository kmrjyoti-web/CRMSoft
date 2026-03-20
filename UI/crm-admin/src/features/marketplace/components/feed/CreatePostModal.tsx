"use client";
import { useState } from "react";
import { Icon, Button } from "@/components/ui";
import { useCreatePost } from "../../hooks/useMarketplace";
import type { PostType, VisibilityType, CreatePostDto } from "../../types/marketplace.types";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const POST_TYPES: { value: PostType; label: string; icon: string; color: string; bg: string }[] = [
  { value: "TEXT", label: "Text", icon: "type", color: "#2563eb", bg: "#eff6ff" },
  { value: "IMAGE", label: "Photo", icon: "image", color: "#16a34a", bg: "#f0fdf4" },
  { value: "VIDEO", label: "Video", icon: "video", color: "#d97706", bg: "#fef3c7" },
  { value: "PRODUCT_SHARE", label: "Product", icon: "package", color: "#7c3aed", bg: "#f5f3ff" },
  { value: "ANNOUNCEMENT", label: "Announce", icon: "megaphone", color: "#dc2626", bg: "#fef2f2" },
];

const VISIBILITY_OPTIONS: { value: VisibilityType; label: string; icon: string }[] = [
  { value: "PUBLIC", label: "Public", icon: "globe" },
  { value: "GEO_TARGETED", label: "My Area", icon: "map-pin" },
  { value: "MY_CONTACTS", label: "My Contacts", icon: "users" },
  { value: "VERIFIED_ONLY", label: "Verified Only", icon: "shield-check" },
];

export function CreatePostModal({ open, onClose, onSuccess }: CreatePostModalProps) {
  const [postType, setPostType] = useState<PostType>("TEXT");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<VisibilityType>("PUBLIC");
  const [hashtags, setHashtags] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const { mutate: createPost, isPending } = useCreatePost();

  function handleSubmit() {
    if (!content.trim()) {
      setError("Content is required.");
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
    };

    createPost(dto, {
      onSuccess: () => {
        setContent("");
        setTitle("");
        setHashtags("");
        setPostType("TEXT");
        setVisibility("PUBLIC");
        onSuccess?.();
        onClose();
      },
      onError: () => {
        setError("Failed to create post. Please try again.");
      },
    });
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  if (!open) return null;

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15,23,42,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 560,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: "#4f46e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="plus" size={18} color="#fff" />
            </div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
              Create Post
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              borderRadius: 6,
              color: "#64748b",
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Post type selector */}
          <div>
            <label
              style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8, display: "block" }}
            >
              Post Type
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {POST_TYPES.map((pt) => {
                const active = postType === pt.value;
                return (
                  <button
                    key={pt.value}
                    onClick={() => setPostType(pt.value)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 20,
                      border: `1.5px solid ${active ? pt.color : "#e2e8f0"}`,
                      backgroundColor: active ? pt.bg : "#fff",
                      color: active ? pt.color : "#64748b",
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "all 0.15s",
                    }}
                  >
                    <Icon name={pt.icon as Parameters<typeof Icon>[0]["name"]} size={13} color={active ? pt.color : "#94a3b8"} />
                    {pt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title (optional) */}
          <div>
            <label
              style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, display: "block" }}
            >
              Title <span style={{ color: "#94a3b8", textTransform: "none", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a title..."
              style={{
                width: "100%",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "9px 14px",
                fontSize: 14,
                color: "#1e293b",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#4f46e5")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
            />
          </div>

          {/* Content */}
          <div>
            <label
              style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, display: "block" }}
            >
              Content <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError("");
              }}
              placeholder="What's on your mind? Share an update, product, or announcement..."
              rows={5}
              style={{
                width: "100%",
                border: `1px solid ${error ? "#dc2626" : "#e2e8f0"}`,
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 14,
                color: "#1e293b",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
                lineHeight: 1.5,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = error ? "#dc2626" : "#4f46e5")}
              onBlur={(e) => (e.currentTarget.style.borderColor = error ? "#dc2626" : "#e2e8f0")}
            />
            {error && (
              <span style={{ fontSize: 12, color: "#dc2626", marginTop: 4, display: "block" }}>
                {error}
              </span>
            )}
          </div>

          {/* Media upload placeholder (for IMAGE/VIDEO) */}
          {(postType === "IMAGE" || postType === "VIDEO") && (
            <div>
              <label
                style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, display: "block" }}
              >
                {postType === "IMAGE" ? "Upload Photo" : "Upload Video"}
              </label>
              <div
                style={{
                  border: "2px dashed #e2e8f0",
                  borderRadius: 10,
                  padding: "24px 16px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: "#fafafa",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#4f46e5")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
              >
                <Icon
                  name={postType === "IMAGE" ? "image" : "video"}
                  size={28}
                  color="#94a3b8"
                />
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 8, fontWeight: 500 }}>
                  Click to upload or drag & drop
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                  {postType === "IMAGE" ? "PNG, JPG, WebP up to 10MB" : "MP4, WebM up to 100MB"}
                </div>
              </div>
            </div>
          )}

          {/* Hashtags */}
          <div>
            <label
              style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, display: "block" }}
            >
              Hashtags <span style={{ color: "#94a3b8", textTransform: "none", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#pharma #tablets #offer"
              style={{
                width: "100%",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "9px 14px",
                fontSize: 14,
                color: "#1e293b",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#4f46e5")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
            />
          </div>

          {/* Visibility */}
          <div>
            <label
              style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8, display: "block" }}
            >
              Visibility
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {VISIBILITY_OPTIONS.map((opt) => {
                const active = visibility === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setVisibility(opt.value)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 20,
                      border: `1.5px solid ${active ? "#4f46e5" : "#e2e8f0"}`,
                      backgroundColor: active ? "#eff6ff" : "#fff",
                      color: active ? "#4f46e5" : "#64748b",
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "all 0.15s",
                    }}
                  >
                    <Icon name={opt.icon as Parameters<typeof Icon>[0]["name"]} size={13} color={active ? "#4f46e5" : "#94a3b8"} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            backgroundColor: "#fafafa",
          }}
        >
          <button
            onClick={onClose}
            disabled={isPending}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              backgroundColor: "#fff",
              color: "#64748b",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !content.trim()}
            style={{
              padding: "9px 24px",
              borderRadius: 8,
              border: "none",
              backgroundColor: isPending || !content.trim() ? "#c7d2fe" : "#4f46e5",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: isPending || !content.trim() ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "background 0.2s",
            }}
          >
            {isPending ? (
              <>
                <Icon name="loader" size={15} color="#fff" />
                Publishing...
              </>
            ) : (
              <>
                <Icon name="send" size={15} color="#fff" />
                Publish Post
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
