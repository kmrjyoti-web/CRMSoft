"use client";

import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { Button, Badge, Icon, Input, SelectInput } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { useHelpArticles, useSeedArticles } from "../hooks/useHelpSystem";
import type { HelpArticle, HelpArticleFilters } from "../types/help-system.types";

// ── Types ─────────────────────────────────────────────────

interface HelpArticleListProps {
  onEdit?: (article: HelpArticle) => void;
  onCreate?: () => void;
}

// ── Styles ────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  padding: 24,
};

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 20,
  gap: 12,
  flexWrap: "wrap",
};

const titleStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const filtersStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
};

const tableContainerStyle: React.CSSProperties = {
  overflowX: "auto",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const thStyle: React.CSSProperties = {
  background: "#f9fafb",
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  color: "#6b7280",
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderTop: "1px solid #f3f4f6",
  verticalAlign: "middle",
};

// ── Category Options ──────────────────────────────────────

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "" },
  { label: "Getting Started", value: "getting-started" },
  { label: "Contacts", value: "contacts" },
  { label: "Leads", value: "leads" },
  { label: "Quotations", value: "quotations" },
  { label: "Finance", value: "finance" },
  { label: "Settings", value: "settings" },
  { label: "Reports", value: "reports" },
  { label: "General", value: "general" },
];

// ── Component ─────────────────────────────────────────────

export function HelpArticleList({ onEdit, onCreate }: HelpArticleListProps) {
  const [filters, setFilters] = useState<HelpArticleFilters>({ page: 1, limit: 25 });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const { data, isLoading } = useHelpArticles(filters);
  const seedArticles = useSeedArticles();

  const articles = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setFilters((prev) => ({ ...prev, search: value || undefined, page: 1 }));
  }, []);

  const handleCategory = useCallback((value: string | number | boolean | null) => {
    const val = String(value ?? "");
    setCategory(val);
    setFilters((prev) => ({ ...prev, category: val || undefined, page: 1 }));
  }, []);

  const handleSeed = async () => {
    try {
      await seedArticles.mutateAsync();
      toast.success("Default articles seeded successfully");
    } catch {
      toast.error("Failed to seed default articles");
    }
  };

  return (
    <div style={containerStyle}>
      {/* Toolbar */}
      <div style={toolbarStyle}>
        <div style={titleStyle}>
          <Icon name="file-text" size={22} />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Help Articles</h2>
          <Badge variant="secondary">{articles.length}</Badge>
        </div>
        <div style={actionsStyle}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeed}
            disabled={seedArticles.isPending}
          >
            {seedArticles.isPending ? <LoadingSpinner size="sm" /> : <Icon name="database" size={14} />}
            Seed Defaults
          </Button>
          <Button variant="primary" size="sm" onClick={onCreate}>
            <Icon name="plus" size={14} />
            Create Article
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ ...filtersStyle, marginBottom: 16 }}>
        <div style={{ width: 260 }}>
          <Input
            label="Search articles..."
            value={search}
            onChange={handleSearch}
            leftIcon={<Icon name="search" size={16} />}
          />
        </div>
        <div style={{ width: 220 }}>
          <SelectInput
            label="Category"
            value={category}
            onChange={handleCategory}
            options={CATEGORY_OPTIONS}
            leftIcon={<Icon name="tag" size={16} />}
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && articles.length === 0 && (
        <EmptyState
          icon="file-text"
          title="No articles found"
          description="Create your first help article or seed the defaults."
          action={{ label: "Create Article", onClick: onCreate ?? (() => {}) }}
        />
      )}

      {/* Table */}
      {!isLoading && articles.length > 0 && (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Screen Code</th>
                <th style={thStyle}>Published</th>
                <th style={thStyle}>Helpful</th>
                <th style={thStyle}>Not Helpful</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article: HelpArticle) => (
                <tr key={article.id} style={{ cursor: "pointer" }}>
                  <td style={{ ...tdStyle, fontWeight: 600, maxWidth: 220 }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {article.title}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, color: "#6b7280", fontFamily: "monospace", fontSize: 12 }}>
                    {article.code}
                  </td>
                  <td style={tdStyle}>
                    <Badge variant="secondary">{article.category}</Badge>
                  </td>
                  <td style={{ ...tdStyle, color: "#9ca3af", fontSize: 12 }}>
                    {article.screenCode ?? "—"}
                  </td>
                  <td style={tdStyle}>
                    {article.isPublished ? (
                      <Icon name="check-circle" size={16} />
                    ) : (
                      <Icon name="x-circle" size={16} />
                    )}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <Badge variant="success">{article.helpfulCount}</Badge>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <Badge variant="danger">{article.notHelpfulCount}</Badge>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit?.(article)}
                    >
                      <Icon name="edit" size={13} /> Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
