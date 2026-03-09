'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Heart, MessageCircle, Share2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { postsApi } from '@/lib/api/posts';
import { POST_TYPES } from '@/lib/constants';
import { timeAgo, formatNumber, extractList } from '@/lib/utils';
import type { Post, CreatePostDto, PostType } from '@/types/post';

export default function PostsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState<CreatePostDto>({ postType: 'PT_TEXT', content: '' });

  const { data: res, isLoading } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => postsApi.feed({ page, limit: 20 }),
  });

  const createMut = useMutation({
    mutationFn: (data: CreatePostDto) => postsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      setShowCreate(false);
      setNewPost({ postType: 'PT_TEXT', content: '' });
      toast.success('Post created!');
    },
  });

  const posts: Post[] = extractList(res);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
          <p className="text-sm text-gray-500">Manage your social feed</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Create Post */}
      {showCreate && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Create Post</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Select
              label="Post Type"
              options={POST_TYPES.map((t) => ({ value: t.value, label: t.label }))}
              value={newPost.postType}
              onChange={(e) => setNewPost((p) => ({ ...p, postType: e.target.value as PostType }))}
            />
            <Textarea
              label="Content"
              value={newPost.content ?? ''}
              onChange={(e) => setNewPost((p) => ({ ...p, content: e.target.value }))}
              rows={4}
              placeholder="What's on your mind?"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={() => createMut.mutate(newPost)} loading={createMut.isPending} disabled={!newPost.content?.trim()}>
                Publish
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
      ) : posts.length === 0 ? (
        <EmptyState icon={FileText} title="No posts yet" description="Create your first post to engage with buyers" actionLabel="Create Post" onAction={() => setShowCreate(true)} />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/posts/${post.id}`)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{POST_TYPES.find((t) => t.value === post.postType)?.label ?? post.postType}</Badge>
                    <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
                  </div>
                </div>
                {post.content && <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>}
                {post.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.hashtags.map((tag) => <span key={tag} className="text-xs text-primary">#{tag}</span>)}
                  </div>
                )}
                <div className="flex items-center gap-6 mt-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{formatNumber(post.likeCount)}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{formatNumber(post.commentCount)}</span>
                  <span className="flex items-center gap-1"><Share2 className="h-3.5 w-3.5" />{formatNumber(post.shareCount)}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{formatNumber(post.viewCount)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
        <span className="text-sm text-gray-500">Page {page}</span>
        <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={posts.length < 20}>Next</Button>
      </div>
    </div>
  );
}
