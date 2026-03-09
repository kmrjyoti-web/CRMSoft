"use client";

import { useState } from "react";

import { Button } from "@/components/ui";

// ── Props ───────────────────────────────────────────────

interface CommentFormProps {
  onSubmit: (content: string) => void;
  isSubmitting?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

// ── Component ───────────────────────────────────────────

export function CommentForm({
  onSubmit,
  isSubmitting,
  placeholder = "Write a comment...",
  autoFocus,
}: CommentFormProps) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        border: "1px solid #e5e7eb",
        marginBottom: 16,
      }}
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={3}
        style={{
          width: "100%",
          padding: 8,
          borderRadius: 8,
          border: "1px solid #d1d5db",
          fontSize: 14,
          resize: "vertical",
          fontFamily: "inherit",
          marginBottom: 8,
        }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
        >
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </div>
    </div>
  );
}
