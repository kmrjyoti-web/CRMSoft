'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Send, Package, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/status-badge';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { enquiriesApi } from '@/lib/api/enquiries';
import { formatCurrency, formatDateTime, timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function EnquiryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [reply, setReply] = useState('');

  const { data: res, isLoading } = useQuery({
    queryKey: ['enquiry', params.id],
    queryFn: () => enquiriesApi.getById(params.id),
  });

  const replyMut = useMutation({
    mutationFn: (message: string) => enquiriesApi.reply(params.id, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enquiry', params.id] });
      setReply('');
      toast.success('Reply sent');
    },
  });

  const enq = res?.data;
  if (isLoading) return <LoadingSpinner />;
  if (!enq) return <div className="text-center py-16 text-gray-500">Enquiry not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Enquiry from {enq.buyer?.firstName} {enq.buyer?.lastName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge value={enq.status} />
            <span className="text-xs text-gray-400">{timeAgo(enq.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Enquiry Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" />Buyer</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-medium">{enq.buyer?.firstName} {enq.buyer?.lastName}</p>
            <p className="text-gray-500">{enq.buyer?.email}</p>
            {enq.buyer?.phone && <p className="text-gray-500">{enq.buyer.phone}</p>}
            {enq.buyer?.companyName && <Badge variant="info">{enq.buyer.companyName}</Badge>}
          </CardContent>
        </Card>
        {enq.listing && (
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4" />Listing</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium">{enq.listing.title}</p>
              {enq.quantity && <p className="text-gray-500">Requested Qty: {enq.quantity}</p>}
              {enq.budget && <p className="text-gray-500">Budget: {formatCurrency(enq.budget)}</p>}
              {enq.deliveryLocation && <p className="text-gray-500">Delivery: {enq.deliveryLocation}</p>}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Thread */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Conversation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Original message */}
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold shrink-0">
              {enq.buyer?.firstName?.charAt(0) ?? 'B'}
            </div>
            <div className="flex-1 bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{enq.buyer?.firstName} {enq.buyer?.lastName}</span>
                <span className="text-xs text-gray-400">{formatDateTime(enq.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700">{enq.message}</p>
            </div>
          </div>

          {/* Replies */}
          {enq.thread?.map((msg) => (
            <div key={msg.id} className={cn('flex gap-3', msg.senderType === 'VENDOR' && 'flex-row-reverse')}>
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                msg.senderType === 'VENDOR' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600',
              )}>
                {msg.senderName?.charAt(0) ?? (msg.senderType === 'VENDOR' ? 'V' : 'B')}
              </div>
              <div className={cn(
                'flex-1 rounded-lg p-3 max-w-[80%]',
                msg.senderType === 'VENDOR' ? 'bg-green-50' : 'bg-gray-50',
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{msg.senderName}</span>
                  <span className="text-xs text-gray-400">{timeAgo(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700">{msg.message}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reply Input */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply..." rows={3} />
          <div className="flex justify-end">
            <Button onClick={() => replyMut.mutate(reply)} loading={replyMut.isPending} disabled={!reply.trim()}>
              <Send className="h-4 w-4" />
              Send Reply
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
