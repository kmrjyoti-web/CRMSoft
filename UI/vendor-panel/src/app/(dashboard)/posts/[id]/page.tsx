'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Heart, MessageCircle, Share2, Eye, Trash2, Send } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { postsApi } from '@/lib/api/posts';
import { POST_TYPES } from '@/lib/constants';
import { formatNumber, formatDateTime } from '@/lib/utils';

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [comment, setComment] = useState('');

  const { data: res, isLoading } = useQuery({
    queryKey: ['post', params.id],
    queryFn: () => postsApi.getById(params.id),
  });

  const deleteMut = useMutation({
    mutationFn: () => postsApi.delete(params.id),
    onSuccess: () => { toast.success('Post deleted'); router.push('/posts'); },
  });

  const commentMut = useMutation({
    mutationFn: (content: string) => postsApi.comment(params.id, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['post', params.id] });
      setComment('');
      toast.success('Comment posted');
    },
  });

  const post = res?.data;
  if (isLoading) return <LoadingSpinner />;
  if (!post) return <div className="text-center py-16 text-gray-500">Post not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Post Detail</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{POST_TYPES.find((t) => t.value === post.postType)?.label}</Badge>
              <span className="text-xs text-gray-400">{formatDateTime(post.createdAt)}</span>
            </div>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={() => { if (confirm('Delete this post?')) deleteMut.mutate(); }} loading={deleteMut.isPending}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {post.content && <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>}
          {post.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {post.hashtags.map((tag) => <span key={tag} className="text-sm text-primary font-medium">#{tag}</span>)}
            </div>
          )}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" />{formatNumber(post.likeCount)} likes</span>
            <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" />{formatNumber(post.commentCount)} comments</span>
            <span className="flex items-center gap-1.5"><Share2 className="h-4 w-4" />{formatNumber(post.shareCount)} shares</span>
            <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{formatNumber(post.viewCount)} views</span>
          </div>
        </CardContent>
      </Card>

      {/* Add Comment */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Add Comment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." rows={3} />
          <Button onClick={() => commentMut.mutate(comment)} loading={commentMut.isPending} disabled={!comment.trim()}>
            <Send className="h-4 w-4" />
            Post Comment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
