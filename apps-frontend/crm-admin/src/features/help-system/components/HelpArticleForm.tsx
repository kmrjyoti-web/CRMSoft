"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Button, Badge, Icon, Input, SelectInput, Switch, TextareaInput } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useCreateArticle, useUpdateArticle } from "../hooks/useHelpSystem";
import type { HelpArticle } from "../types/help-system.types";

// ── Props ─────────────────────────────────────────────────

interface HelpArticleFormProps {
  article?: HelpArticle;
  onSave?: () => void;
  onCancel?: () => void;
}

// ── Styles ────────────────────────────────────────────────

const formStyle: React.CSSProperties = {
  padding: 24,
  maxWidth: 720,
};

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  textTransform: "uppercase",
  color: "#6b7280",
  letterSpacing: "0.05em",
  marginBottom: 12,
  marginTop: 24,
};

const fieldGroupStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const fullWidthFieldStyle: React.CSSProperties = {
  marginBottom: 16,
};

const switchRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 0",
  borderTop: "1px solid #f3f4f6",
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  paddingTop: 24,
  marginTop: 8,
  borderTop: "1px solid #e5e7eb",
};

// ── Category Options ──────────────────────────────────────

const CATEGORY_OPTIONS = [
  { label: "General", value: "general" },
  { label: "Getting Started", value: "getting-started" },
  { label: "Contacts", value: "contacts" },
  { label: "Leads", value: "leads" },
  { label: "Quotations", value: "quotations" },
  { label: "Finance", value: "finance" },
  { label: "Settings", value: "settings" },
  { label: "Reports", value: "reports" },
];

// ── Component ─────────────────────────────────────────────

export function HelpArticleForm({ article, onSave, onCancel }: HelpArticleFormProps) {
  const isEditing = !!article;
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();

  const [code, setCode] = useState(article?.code ?? "");
  const [title, setTitle] = useState(article?.title ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [category, setCategory] = useState(article?.category ?? "general");
  const [screenCode, setScreenCode] = useState(article?.screenCode ?? "");
  const [fieldCode, setFieldCode] = useState(article?.fieldCode ?? "");
  const [tagsInput, setTagsInput] = useState((article?.tags ?? []).join(", "));
  const [isPublished, setIsPublished] = useState(article?.isPublished ?? false);
  const [sortOrder, setSortOrder] = useState(String(article?.sortOrder ?? "0"));

  useEffect(() => {
    if (article) {
      setCode(article.code);
      setTitle(article.title);
      setContent(article.content);
      setCategory(article.category);
      setScreenCode(article.screenCode ?? "");
      setFieldCode(article.fieldCode ?? "");
      setTagsInput((article.tags ?? []).join(", "));
      setIsPublished(article.isPublished);
      setSortOrder(String(article.sortOrder ?? 0));
    }
  }, [article]);

  const isPending = createArticle.isPending || updateArticle.isPending;

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!code.trim()) {
      toast.error("Code is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      code,
      title,
      content,
      category,
      screenCode: screenCode || undefined,
      fieldCode: fieldCode || undefined,
      tags,
      isPublished,
      sortOrder: parseInt(sortOrder, 10) || 0,
    };

    try {
      if (isEditing && article?.id) {
        await updateArticle.mutateAsync({ id: article.id, dto: payload });
        toast.success("Article updated successfully");
      } else {
        await createArticle.mutateAsync(payload);
        toast.success("Article created successfully");
      }
      onSave?.();
    } catch {
      toast.error(isEditing ? "Failed to update article" : "Failed to create article");
    }
  };

  return (
    <div style={formStyle}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Icon name={isEditing ? "edit" : "plus"} size={20} />
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
          {isEditing ? "Edit Article" : "Create Help Article"}
        </h2>
        {isPublished && <Badge variant="success">Published</Badge>}
      </div>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 0 }}>
        {isEditing
          ? "Update the help article details below."
          : "Fill in the details to create a new help article."}
      </p>

      {/* Identity Fields */}
      <p style={sectionHeaderStyle}>Article Identity</p>
      <div style={fieldGroupStyle}>
        <Input
          label="Article Code *"
          value={code}
          onChange={setCode}
          leftIcon={<Icon name="hash" size={16} />}
        />
        <Input
          label="Title *"
          value={title}
          onChange={setTitle}
          leftIcon={<Icon name="file-text" size={16} />}
        />
      </div>

      {/* Category + Sort */}
      <div style={{ ...fieldGroupStyle, marginTop: 16 }}>
        <SelectInput
          label="Category"
          value={category}
          onChange={(v) => setCategory(String(v ?? "general"))}
          options={CATEGORY_OPTIONS}
          leftIcon={<Icon name="tag" size={16} />}
        />
        <Input
          label="Sort Order"
          value={sortOrder}
          onChange={setSortOrder}
          leftIcon={<Icon name="list" size={16} />}
        />
      </div>

      {/* Content */}
      <p style={sectionHeaderStyle}>Content</p>
      <div style={fullWidthFieldStyle}>
        <TextareaInput
          label="Article Content *"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
        />
      </div>

      {/* Contextual Fields */}
      <p style={sectionHeaderStyle}>Contextual Help Mapping</p>
      <div style={fieldGroupStyle}>
        <Input
          label="Screen Code"
          value={screenCode}
          onChange={setScreenCode}
          leftIcon={<Icon name="monitor" size={16} />}
        />
        <Input
          label="Field Code"
          value={fieldCode}
          onChange={setFieldCode}
          leftIcon={<Icon name="columns" size={16} />}
        />
      </div>

      {/* Tags */}
      <p style={sectionHeaderStyle}>Tags</p>
      <div style={fullWidthFieldStyle}>
        <Input
          label="Tags (comma-separated)"
          value={tagsInput}
          onChange={setTagsInput}
          leftIcon={<Icon name="tag" size={16} />}
        />
        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
          Example: crm, contacts, how-to
        </p>
      </div>

      {/* Published toggle */}
      <div style={switchRowStyle}>
        <Switch
          checked={isPublished}
          onChange={setIsPublished}
        />
        <label style={{ fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          Published
        </label>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>
          {isPublished ? "Visible to users" : "Hidden from users"}
        </span>
      </div>

      {/* Footer Actions */}
      <div style={footerStyle}>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Icon name={isEditing ? "save" : "plus"} size={14} />
          )}
          {isEditing ? "Update Article" : "Create Article"}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
