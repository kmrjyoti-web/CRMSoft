'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Clock, Send, User, Building2, Tag, AlertTriangle,
  ChevronDown, ChevronUp, Paperclip, Eye, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { useTicket, useUpdateTicket, useAddTicketMessage, useTicketContext } from '@/hooks/use-support-tickets';
import { formatDateTime } from '@/lib/utils';
import type { TicketMessage } from '@/types/support-ticket';

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING_ON_CUSTOMER', label: 'Waiting on Customer' },
  { value: 'WAITING_ON_VENDOR', label: 'Waiting on Vendor' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const STATUS_VARIANT: Record<string, 'info' | 'warning' | 'destructive' | 'default' | 'success' | 'secondary'> = {
  OPEN: 'destructive',
  IN_PROGRESS: 'info',
  WAITING_ON_CUSTOMER: 'warning',
  WAITING_ON_VENDOR: 'warning',
  RESOLVED: 'success',
  CLOSED: 'secondary',
};

const PRIORITY_VARIANT: Record<string, 'info' | 'warning' | 'destructive' | 'default' | 'success' | 'secondary'> = {
  LOW: 'secondary',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'destructive',
};

const CATEGORY_VARIANT: Record<string, 'info' | 'warning' | 'destructive' | 'default' | 'success' | 'secondary'> = {
  BUG: 'destructive',
  FEATURE_REQUEST: 'info',
  BILLING: 'warning',
  PERFORMANCE: 'warning',
  DATA_ISSUE: 'default',
  SECURITY: 'destructive',
  OTHER: 'secondary',
};

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const ticketId = params.id;

  const { data: ticketRes, isLoading } = useTicket(ticketId);
  const { data: contextRes } = useTicketContext(ticketId);
  const ticket = ticketRes?.data;
  const context = contextRes?.data;

  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showContext, setShowContext] = useState(false);

  const updateTicket = useUpdateTicket();
  const addMessage = useAddTicketMessage();

  if (isLoading) return <LoadingSpinner />;
  if (!ticket) return <div className="text-center py-16 text-gray-500">Ticket not found</div>;

  const messages: TicketMessage[] = ticket.messages ?? [];

  const handleSend = () => {
    if (!message.trim()) return;
    addMessage.mutate({
      id: ticketId,
      data: { message, isInternal },
    });
    setMessage('');
    setIsInternal(false);
  };

  const handleStatusChange = (status: string) => {
    updateTicket.mutate({ id: ticketId, data: { status } });
  };

  const handlePriorityChange = (priority: string) => {
    updateTicket.mutate({ id: ticketId, data: { priority } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-mono text-gray-500">{ticket.ticketNo}</span>
            <Badge variant={STATUS_VARIANT[ticket.status] || 'default'}>{ticket.status.replace(/_/g, ' ')}</Badge>
            <Badge variant={PRIORITY_VARIANT[ticket.priority] || 'default'}>{ticket.priority}</Badge>
            <Badge variant={CATEGORY_VARIANT[ticket.category] || 'default'}>{ticket.category.replace('_', ' ')}</Badge>
            {ticket.slaBreached && <Badge variant="destructive">SLA BREACHED</Badge>}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">{ticket.subject}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Ticket Info + Context */}
        <div className="lg:col-span-1 space-y-4">
          {/* Ticket Info */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Ticket Info</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 flex items-center gap-1"><User className="h-3.5 w-3.5" />Reported By</span>
                <span>{ticket.reportedByName ?? '-'}</span>
              </div>
              {ticket.reportedByEmail && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="text-xs truncate max-w-[140px]">{ticket.reportedByEmail}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />Tenant</span>
                <span>{ticket.tenantName ?? '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 flex items-center gap-1"><Tag className="h-3.5 w-3.5" />Category</span>
                <Badge variant={CATEGORY_VARIANT[ticket.category] || 'default'} className="text-xs">
                  {ticket.category.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Created</span>
                <span className="text-xs">{formatDateTime(ticket.createdAt)}</span>
              </div>
              {ticket.assignedToName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Assigned To</span>
                  <span>{ticket.assignedToName}</span>
                </div>
              )}
              {ticket.firstResponseAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">First Response</span>
                  <span className="text-xs">{formatDateTime(ticket.firstResponseAt)}</span>
                </div>
              )}
              {ticket.resolvedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Resolved</span>
                  <span className="text-xs">{formatDateTime(ticket.resolvedAt)}</span>
                </div>
              )}
              {ticket.satisfactionRating != null && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Rating</span>
                  <span className="font-semibold">{ticket.satisfactionRating}/5</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Change Status</label>
                <Select
                  options={STATUS_OPTIONS}
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Change Priority</label>
                <Select
                  options={PRIORITY_OPTIONS}
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Auto Context */}
          {context && (
            <Card>
              <CardHeader>
                <button
                  className="flex items-center justify-between w-full"
                  onClick={() => setShowContext(!showContext)}
                >
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Auto-Context
                  </CardTitle>
                  {showContext ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </CardHeader>
              {showContext && (
                <CardContent>
                  <pre className="bg-gray-50 rounded-lg p-3 overflow-x-auto text-xs font-mono leading-relaxed text-gray-700 max-h-60 overflow-y-auto">
                    <code>{JSON.stringify(context, null, 2)}</code>
                  </pre>
                </CardContent>
              )}
            </Card>
          )}

          {/* Linked Errors */}
          {ticket.linkedErrorIds && ticket.linkedErrorIds.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" />Linked Errors</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {ticket.linkedErrorIds.map((errorId: string) => (
                  <Button
                    key={errorId}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start font-mono text-xs"
                    onClick={() => router.push(`/error-logs/${errorId}`)}
                  >
                    {errorId}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Screenshots */}
          {ticket.screenshots && ticket.screenshots.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Paperclip className="h-4 w-4" />Screenshots</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {ticket.screenshots.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Screenshot ${i + 1}`} className="rounded border w-full h-20 object-cover" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Message Thread */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
            <CardHeader className="border-b">
              <CardTitle className="text-sm">Messages ({messages.length})</CardTitle>
            </CardHeader>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">No messages yet</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderType === 'VENDOR' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        msg.isInternal
                          ? 'bg-yellow-50 border border-yellow-200'
                          : msg.senderType === 'VENDOR'
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-700">
                          {msg.senderName ?? msg.senderId}
                        </span>
                        {msg.isInternal && (
                          <Badge variant="warning" className="text-xs">
                            <Lock className="h-2.5 w-2.5 mr-0.5" />
                            Internal
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400">{formatDateTime(msg.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.message}</p>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {msg.attachments.map((att, i) => (
                            <a key={i} href={att} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline flex items-center gap-0.5">
                              <Paperclip className="h-3 w-3" />
                              Attachment {i + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply Form */}
            <div className="border-t p-4 space-y-3">
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                placeholder="Type your reply..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend();
                }}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Lock className="h-3.5 w-3.5" />
                  Internal Note
                </label>
                <Button size="sm" onClick={handleSend} disabled={addMessage.isPending || !message.trim()}>
                  <Send className="h-4 w-4 mr-1" />
                  {isInternal ? 'Add Note' : 'Send Reply'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
