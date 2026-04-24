'use client';

import { useState } from 'react';
import { MessageSquare, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, statusBadgeVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { usePortalSupport, useCreateTicket } from '@/hooks/usePortal';
import { formatDate } from '@/lib/utils';

const ticketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  priority: z.string().min(1),
});

type TicketForm = z.infer<typeof ticketSchema>;

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export default function SupportPage() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = usePortalSupport(page);
  const createTicket = useCreateTicket();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema) as any,
    defaultValues: { priority: 'MEDIUM' },
  });

  const tickets = data?.data ?? [];
  const meta = data?.meta;

  const onSubmit = async (values: TicketForm) => {
    await createTicket.mutateAsync(values);
    reset();
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* New Ticket Form */}
      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Create Support Ticket</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
              <Input
                label="Subject"
                placeholder="Brief description of your issue"
                error={errors.subject?.message}
                {...register('subject')}
              />
              <Textarea
                label="Description"
                placeholder="Please describe the issue in detail..."
                rows={4}
                error={errors.description?.message}
                {...register('description')}
              />
              <Select
                label="Priority"
                options={PRIORITY_OPTIONS}
                {...register('priority')}
              />
              <div className="flex gap-3">
                <Button
                  type="submit"
                  loading={createTicket.isPending}
                  disabled={createTicket.isPending}
                >
                  Submit Ticket
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Support Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No support tickets yet</p>
              <Button
                className="mt-3"
                variant="outline"
                size="sm"
                onClick={() => setShowForm(true)}
              >
                Create your first ticket
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">{ticket.ticketNumber}</span>
                        <Badge variant={statusBadgeVariant(ticket.priority)} className="text-[10px]">
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm mt-0.5">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {ticket.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Opened {formatDate(ticket.createdAt)}
                      </p>
                    </div>
                    <Badge variant={statusBadgeVariant(ticket.status)} className="ml-4 shrink-0">
                      {ticket.status}
                    </Badge>
                  </div>
                ))}
              </div>

              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {meta.page} of {meta.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === meta.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
