"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";
import { Button, Badge, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useHelpArticle, useMarkHelpful, useMarkNotHelpful } from "../hooks/useHelpSystem";

// ── Props ─────────────────────────────────────────────────

interface HelpViewerProps {
  articleCode: string;
}

// ── Styles ────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "24px 28px",
};

const headerStyle: React.CSSProperties = {
  marginBottom: 20,
  paddingBottom: 16,
  borderBottom: "1px solid #e5e7eb",
};

const titleStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  margin: "0 0 10px",
  color: "#111827",
};

const metaRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const contentBoxStyle: React.CSSProperties = {
  lineHeight: 1.8,
  fontSize: 15,
  color: "#374151",
  marginBottom: 32,
};

const feedbackBoxStyle: React.CSSProperties = {
  borderTop: "1px solid #e5e7eb",
  paddingTop: 20,
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const feedbackLabelStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#6b7280",
  fontWeight: 500,
};

const statChipStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  padding: "4px 10px",
  borderRadius: 20,
  background: "#f3f4f6",
  fontSize: 13,
  color: "#374151",
};

const notFoundStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 60,
  gap: 12,
  color: "#9ca3af",
};

// ── Component ─────────────────────────────────────────────

export function HelpViewer({ articleCode }: HelpViewerProps) {
  const { data, isLoading, isError } = useHelpArticle(articleCode);
  const markHelpful = useMarkHelpful();
  const markNotHelpful = useMarkNotHelpful();

  const article = useMemo(() => {
    const raw = data?.data ?? data;
    return raw && typeof raw === "object" && "id" in raw ? raw : null;
  }, [data]);

  const handleHelpful = async () => {
    if (!article?.id) return;
    try {
      await markHelpful.mutateAsync(article.id);
      toast.success("Thanks for your feedback!");
    } catch {
      toast.error("Failed to record feedback");
    }
  };

  const handleNotHelpful = async () => {
    if (!article?.id) return;
    try {
      await markNotHelpful.mutateAsync(article.id);
      toast.success("Thanks for your feedback!");
    } catch {
      toast.error("Failed to record feedback");
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div style={notFoundStyle}>
        <Icon name="file-text" size={40} />
        <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>Article not found</p>
        <p style={{ margin: 0, fontSize: 14 }}>
          No article found for code: <code>{articleCode}</code>
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>{article.title}</h1>
        <div style={metaRowStyle}>
          <Badge variant="secondary">{article.category}</Badge>
          {article.screenCode && (
            <Badge variant="outline">{article.screenCode}</Badge>
          )}
          {article.tags && article.tags.length > 0 && (
            <>
              {article.tags.map((tag: string) => (
                <Badge key={tag} variant="default">{tag}</Badge>
              ))}
            </>
          )}
          {!article.isPublished && (
            <Badge variant="warning">Draft</Badge>
          )}
        </div>
      </div>

      {/* Article Content */}
      <div
        style={contentBoxStyle}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Feedback Section */}
      <div style={feedbackBoxStyle}>
        <span style={feedbackLabelStyle}>Was this article helpful?</span>

        <Button
          variant="outline"
          size="sm"
          onClick={handleHelpful}
          disabled={markHelpful.isPending}
        >
          {markHelpful.isPending ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Icon name="check" size={14} />
          )}
          Yes, helpful
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNotHelpful}
          disabled={markNotHelpful.isPending}
        >
          {markNotHelpful.isPending ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Icon name="x" size={14} />
          )}
          Not helpful
        </Button>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <div style={statChipStyle}>
            <Icon name="check" size={13} />
            <span>{article.helpfulCount} helpful</span>
          </div>
          <div style={statChipStyle}>
            <Icon name="x" size={13} />
            <span>{article.notHelpfulCount} not helpful</span>
          </div>
        </div>
      </div>
    </div>
  );
}
