"use client";
import { useState, useMemo } from "react";
import { TableFull, Badge } from "@/components/ui";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { usePosts } from "../hooks/useMarketplace";
import type { PostListParams, MarketplacePost } from "../types/marketplace.types";

const COLUMNS = [
  { id: "postType", label: "Type", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "content", label: "Content", visible: true },
  { id: "viewCount", label: "Views", visible: true },
  { id: "likeCount", label: "Likes", visible: true },
  { id: "commentCount", label: "Comments", visible: true },
  { id: "shareCount", label: "Shares", visible: true },
  { id: "createdAt", label: "Created", visible: true },
];

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "danger" | "default"> = {
  ACTIVE: 'success',
  DRAFT: 'secondary',
  SCHEDULED: 'warning',
  HIDDEN: 'warning',
  ARCHIVED: 'default',
  DELETED: 'danger',
};

export function MarketplacePostsPage() {
  const [params] = useState<PostListParams>({ page: 1, limit: 50 });

  const { data, isLoading } = usePosts(params);

  const posts = useMemo<MarketplacePost[]>(() => {
    const nested = (data as { data?: { data?: MarketplacePost[] } | MarketplacePost[] })?.data;
    if (!nested) return [];
    if (Array.isArray(nested)) return nested;
    const withData = nested as { data?: MarketplacePost[] };
    return withData.data ?? [];
  }, [data]);

  const tableData = useMemo(
    () =>
      posts.map((p) => ({
        ...p,
        postType: (
          <span className="text-xs font-medium text-blue-600 bg-blue-50 rounded px-2 py-0.5">{p.postType}</span>
        ),
        status: <Badge variant={STATUS_VARIANT[p.status] ?? 'default'}>{p.status}</Badge>,
        content: p.content ? (
          <span className="text-xs text-gray-600 truncate max-w-xs block" title={p.content}>
            {p.content.length > 80 ? p.content.substring(0, 80) + '...' : p.content}
          </span>
        ) : (
          <span className="text-xs text-gray-400 italic">Media only</span>
        ),
        createdAt: new Date(p.createdAt).toLocaleDateString('en-IN'),
      })),
    [posts],
  );

  if (isLoading) return <TableSkeleton title="Posts" />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <TableFull
          data={tableData as Record<string, unknown>[]}
          title="Marketplace Posts"
          tableKey="marketplace-posts"
          columns={COLUMNS}
          defaultViewMode="table"
          defaultDensity="compact"
          onRowEdit={(row: Record<string, unknown>) => console.log('view post', row.id)}
        />
      </div>
    </div>
  );
}
