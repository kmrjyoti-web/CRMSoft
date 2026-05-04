'use client';

import { FileText, CreditCard, MessageSquare, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, statusBadgeVariant } from '@/components/ui/badge';
import { usePortalDashboard } from '@/hooks/usePortal';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency, formatDate } from '@/lib/utils';

function StatCard({
  title,
  value,
  icon: Icon,
  sub,
  href,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  sub?: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
              {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = usePortalDashboard();
  const { user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-24 bg-gray-100 rounded-xl" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-semibold">
          Welcome back, {user?.displayName?.split(' ')[0] ?? 'there'} 👋
        </h2>
        <p className="text-sm text-muted-foreground">
          Here&apos;s a summary of your account activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Invoices"
          value={data?.totalInvoices ?? 0}
          icon={FileText}
          href="/invoices"
        />
        <StatCard
          title="Pending Amount"
          value={formatCurrency(data?.pendingAmount ?? 0)}
          icon={TrendingUp}
          sub="Outstanding"
          href="/invoices"
        />
        <StatCard
          title="Total Payments"
          value={data?.totalPayments ?? 0}
          icon={CreditCard}
          href="/payments"
        />
        <StatCard
          title="Open Tickets"
          value={data?.openTickets ?? 0}
          icon={MessageSquare}
          href="/support"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Recent Invoices
              <Link href="/invoices" className="text-sm font-normal text-primary hover:underline">
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentInvoices?.length ? (
              <div className="space-y-3">
                {data.recentInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(inv.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(inv.amount)}</p>
                      <Badge variant={statusBadgeVariant(inv.status)} className="mt-1">
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No invoices yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Recent Payments
              <Link href="/payments" className="text-sm font-normal text-primary hover:underline">
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentPayments?.length ? (
              <div className="space-y-3">
                {data.recentPayments.map((pay) => (
                  <div key={pay.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{pay.paymentNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(pay.date)} · {pay.mode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        {formatCurrency(pay.amount)}
                      </p>
                      <Badge variant={statusBadgeVariant(pay.status)} className="mt-1">
                        {pay.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No payments yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
