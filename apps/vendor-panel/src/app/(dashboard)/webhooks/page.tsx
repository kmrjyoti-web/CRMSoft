'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Webhook,
  Plus,
  Search,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/common/empty-state';
import { useDebounce } from '@/hooks/use-debounce';
import { truncate, formatDateTime } from '@/lib/utils';

// ── mock data ───────────────────────────────────────────────────────
interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  lastDelivery: string | null;
  failureCount: number;
}

interface Delivery {
  id: string;
  event: string;
  statusCode: number;
  success: boolean;
  timestamp: string;
  payload: string;
  responseBody: string;
}

const mockWebhooks: WebhookItem[] = [
  {
    id: '1',
    url: 'https://api.acme.com/webhooks/crm',
    events: ['lead.created', 'lead.updated', 'contact.created'],
    active: true,
    lastDelivery: '2026-03-09T10:30:00Z',
    failureCount: 0,
  },
  {
    id: '2',
    url: 'https://hooks.techflow.io/inbound/crm-events',
    events: ['invoice.paid', 'payment.received'],
    active: true,
    lastDelivery: '2026-03-09T08:15:00Z',
    failureCount: 2,
  },
  {
    id: '3',
    url: 'https://webhook.greenleaf.app/sync',
    events: ['lead.created', 'lead.status_changed'],
    active: false,
    lastDelivery: '2026-03-07T14:20:00Z',
    failureCount: 8,
  },
  {
    id: '4',
    url: 'https://integrations.databridge.co/v2/hooks',
    events: ['contact.created', 'contact.updated', 'organization.created'],
    active: true,
    lastDelivery: '2026-03-09T11:00:00Z',
    failureCount: 0,
  },
];

const mockDeliveries: Record<string, Delivery[]> = {
  '1': [
    {
      id: 'd1',
      event: 'lead.created',
      statusCode: 200,
      success: true,
      timestamp: '2026-03-09T10:30:00Z',
      payload: JSON.stringify({ event: 'lead.created', data: { id: 'ld_123', name: 'John Doe', source: 'Website' } }, null, 2),
      responseBody: JSON.stringify({ received: true }, null, 2),
    },
    {
      id: 'd2',
      event: 'contact.created',
      statusCode: 200,
      success: true,
      timestamp: '2026-03-09T09:45:00Z',
      payload: JSON.stringify({ event: 'contact.created', data: { id: 'ct_456', name: 'Jane Smith' } }, null, 2),
      responseBody: JSON.stringify({ received: true }, null, 2),
    },
  ],
  '2': [
    {
      id: 'd3',
      event: 'invoice.paid',
      statusCode: 500,
      success: false,
      timestamp: '2026-03-09T08:15:00Z',
      payload: JSON.stringify({ event: 'invoice.paid', data: { id: 'inv_789', amount: 15000 } }, null, 2),
      responseBody: JSON.stringify({ error: 'Internal Server Error' }, null, 2),
    },
  ],
};

const FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

// ── component ───────────────────────────────────────────────────────
export default function WebhooksPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const filtered = mockWebhooks.filter((wh) => {
    if (debouncedSearch && !wh.url.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
    if (statusFilter === 'active' && !wh.active) return false;
    if (statusFilter === 'inactive' && wh.active) return false;
    return true;
  });

  const handleTest = (wh: WebhookItem) => {
    toast.success(`Test ping sent to ${truncate(wh.url, 40)}`);
  };

  const handleRetry = (delivery: Delivery) => {
    toast.success(`Retrying delivery for ${delivery.event}`);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
          <p className="text-sm text-gray-500">Manage webhook endpoints and monitor deliveries</p>
        </div>
        <Button onClick={() => toast.info('Webhook creation coming soon')}>
          <Plus className="h-4 w-4" />
          Add Webhook
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search by URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          options={FILTER_OPTIONS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-36"
        />
      </div>

      {/* Webhook list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Webhook}
          title="No webhooks found"
          description="Create a webhook endpoint to receive event notifications"
          actionLabel="Add Webhook"
          onAction={() => toast.info('Webhook creation coming soon')}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((wh) => {
            const isExpanded = expandedId === wh.id;
            const deliveries = mockDeliveries[wh.id] ?? [];

            return (
              <Card key={wh.id}>
                <CardContent className="p-4">
                  {/* Main row */}
                  <div className="flex items-center gap-4">
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => toggleExpand(wh.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm truncate">{wh.url}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {wh.events.map((evt) => (
                          <Badge key={evt} variant="outline" className="text-xs">
                            {evt}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Badge variant={wh.active ? 'success' : 'secondary'}>
                      {wh.active ? 'Active' : 'Inactive'}
                    </Badge>

                    {wh.failureCount > 0 && (
                      <Badge variant="destructive">{wh.failureCount} failures</Badge>
                    )}

                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {wh.lastDelivery ? formatDateTime(wh.lastDelivery) : 'Never'}
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTest(wh)}
                    >
                      <Play className="h-3.5 w-3.5" />
                      Test
                    </Button>
                  </div>

                  {/* Expanded: deliveries */}
                  {isExpanded && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Recent Deliveries
                      </h4>
                      {deliveries.length === 0 ? (
                        <p className="text-sm text-gray-400">No deliveries recorded</p>
                      ) : (
                        <div className="space-y-2">
                          {deliveries.map((del) => (
                            <div
                              key={del.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
                              onClick={() => setSelectedDelivery(del)}
                            >
                              <div className="flex items-center gap-3">
                                {del.success ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-sm font-medium">{del.event}</span>
                                <Badge variant={del.success ? 'success' : 'destructive'} className="text-xs">
                                  {del.statusCode}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                  {formatDateTime(del.timestamp)}
                                </span>
                                {!del.success && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRetry(del);
                                    }}
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                    Retry
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delivery detail modal */}
      <Modal isOpen={!!selectedDelivery} onClose={() => setSelectedDelivery(null)} size="lg">
        {selectedDelivery && (
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Delivery Detail</h3>
            <div className="flex items-center gap-2">
              <Badge variant={selectedDelivery.success ? 'success' : 'destructive'}>
                {selectedDelivery.statusCode}
              </Badge>
              <span className="text-sm font-medium">{selectedDelivery.event}</span>
              <span className="text-xs text-gray-400 ml-auto">
                {formatDateTime(selectedDelivery.timestamp)}
              </span>
            </div>

            {/* Payload */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Request Payload</span>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedDelivery.payload);
                    toast.success('Payload copied');
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto max-h-48">
                {selectedDelivery.payload}
              </pre>
            </div>

            {/* Response */}
            <div>
              <span className="text-sm font-medium text-gray-700 mb-1 block">Response Body</span>
              <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto max-h-48">
                {selectedDelivery.responseBody}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
