'use client';

import { Icon, Badge } from '@/components/ui';

function Code({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export function DashboardDevHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      {/* ── Dashboard API ──────────────────────────────────── */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="globe" size={14} className="text-green-600" />
          </span>
          Dashboard API Endpoints
        </h3>
        <p className="mb-2 text-xs font-medium text-gray-700">Dashboard</p>
        <div className="space-y-1.5">
          {[
            { method: 'GET', path: '/dashboard/executive', desc: 'KPI summary (totalLeads, wonDeals, totalRevenue, conversionRate, avgDealSize, etc.)' },
            { method: 'GET', path: '/dashboard/pipeline', desc: 'Pipeline stages (stage, count, value) for bar chart' },
            { method: 'GET', path: '/dashboard/funnel', desc: 'Sales funnel steps' },
            { method: 'GET', path: '/dashboard/my', desc: 'Personal dashboard KPIs for logged-in user' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : ep.method === 'PUT' ? 'warning' : 'danger'}>
                {ep.method}
              </Badge>
              <Code>{ep.path}</Code>
              <span className="text-gray-400">{ep.desc}</span>
            </div>
          ))}
        </div>
        <p className="mb-2 mt-4 text-xs font-medium text-gray-700">Analytics</p>
        <div className="space-y-1.5">
          {[
            { method: 'GET', path: '/analytics/revenue', desc: 'Revenue data points (period, revenue) for line chart' },
            { method: 'GET', path: '/analytics/lead-sources', desc: 'Lead source distribution (source, count, percentage) for pie chart' },
            { method: 'GET', path: '/analytics/lost-reasons', desc: 'Lost deal reasons breakdown' },
            { method: 'GET', path: '/analytics/activity-heatmap', desc: 'Activity heatmap data' },
            { method: 'GET', path: '/analytics/aging', desc: 'Lead/deal aging analysis' },
            { method: 'GET', path: '/analytics/velocity', desc: 'Sales velocity metrics' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : ep.method === 'PUT' ? 'warning' : 'danger'}>
                {ep.method}
              </Badge>
              <Code>{ep.path}</Code>
              <span className="text-gray-400">{ep.desc}</span>
            </div>
          ))}
        </div>
        <p className="mb-2 mt-4 text-xs font-medium text-gray-700">MIS Reports</p>
        <div className="space-y-1.5">
          {[
            { method: 'GET', path: '/mis-reports/definitions', desc: 'List report definitions (filter by category)' },
            { method: 'GET', path: '/mis-reports/definitions/:code', desc: 'Single report definition' },
            { method: 'POST', path: '/mis-reports/generate/:code', desc: 'Generate report with params (dateFrom, dateTo, filters)' },
            { method: 'POST', path: '/mis-reports/export/:code', desc: 'Export report (returns exportId)' },
            { method: 'POST', path: '/mis-reports/drill-down/:code', desc: 'Drill-down into a report cell' },
            { method: 'GET', path: '/mis-reports/exports', desc: 'Export history list' },
            { method: 'GET', path: '/mis-reports/exports/:id/download', desc: 'Download exported file (Blob)' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : ep.method === 'PUT' ? 'warning' : 'danger'}>
                {ep.method}
              </Badge>
              <Code>{ep.path}</Code>
              <span className="text-gray-400">{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recharts Integration ───────────────────────────── */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="bar-chart-2" size={14} className="text-blue-600" />
          </span>
          Recharts Integration
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">Charts used in DashboardOverview:</p>
          <p className="ml-4 text-gray-500">LineChart &mdash; Revenue Trend (dataKey=&quot;revenue&quot;, xAxis=&quot;period&quot;)</p>
          <p className="ml-4 text-gray-500">BarChart &mdash; Sales Pipeline (dataKey=&quot;count&quot; + &quot;value&quot;, xAxis=&quot;stage&quot;)</p>
          <p className="ml-4 text-gray-500">PieChart &mdash; Lead Sources (dataKey=&quot;count&quot;, nameKey=&quot;source&quot;)</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">All charts wrapped in <Code>ResponsiveContainer</Code> (width=&quot;100%&quot;, height=300)</p>
          <p className="text-gray-500">Colors: <Code>CHART_COLORS</Code> array from <Code>dashboard/utils/chart-colors.ts</Code></p>
          <p className="text-gray-500">Currency formatting: <Code>formatINR</Code> from <Code>@/lib/format-currency</Code></p>
          <p className="text-gray-500">Pie chart labels include source name and percentage</p>
        </div>
      </section>

      {/* ── KPI Card System ────────────────────────────────── */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
            <Icon name="layers" size={14} className="text-purple-600" />
          </span>
          KPI Card System
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">KpiCard props:</p>
          <p className="ml-4 text-gray-500">title: string &mdash; card heading (e.g., &quot;Total Leads&quot;)</p>
          <p className="ml-4 text-gray-500">value: string | number &mdash; displayed metric</p>
          <p className="ml-4 text-gray-500">icon: string &mdash; lucide icon name</p>
          <p className="ml-4 text-gray-500">color: string &mdash; hex color for icon accent</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">Layout: 2-col mobile, 4-col desktop grid (<Code>grid-cols-2 md:grid-cols-4</Code>)</p>
          <p className="text-gray-500">KPIs from API: <Code>totalLeads</Code>, <Code>wonDeals</Code>, <Code>totalRevenue</Code>, <Code>conversionRate</Code>, <Code>avgDealSize</Code>, <Code>pendingActivities</Code>, <Code>activeLeads</Code>, <Code>lostDeals</Code></p>
        </div>
      </section>

      {/* ── Frontend Architecture ──────────────────────────── */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100">
            <Icon name="folder" size={14} className="text-cyan-600" />
          </span>
          Frontend Architecture
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="text-gray-500">app/(main)/dashboard/page.tsx</p>
          <p className="ml-4 text-blue-700">&rarr; DashboardOverview.tsx</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; PageHeader + date preset buttons + DatePicker (From/To)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; 4x KpiCard (grid)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; LineChart (Revenue Trend)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; BarChart (Sales Pipeline)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; PieChart (Lead Sources)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; Quick Stats (dl grid)</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">Services: <Code>dashboardService</Code>, <Code>analyticsService</Code>, <Code>reportsService</Code></p>
          <p className="text-gray-500">Hooks: <Code>useExecutiveDashboard</Code>, <Code>usePipeline</Code>, <Code>useRevenueAnalytics</Code>, <Code>useLeadSources</Code></p>
          <p className="text-gray-500">Date range: <Code>getDateRange(preset)</Code> from <Code>dashboard/utils/date-range.ts</Code></p>
          <p className="text-gray-500">Presets: <Code>7d | 30d | 90d | thisMonth | lastMonth | custom</Code></p>
          <p className="text-gray-500">All params pass <Code>dateFrom</Code> and <Code>dateTo</Code> to API queries</p>
        </div>
      </section>

      {/* ── Key Patterns ───────────────────────────────────── */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100">
            <Icon name="alert-triangle" size={14} className="text-red-600" />
          </span>
          Key Patterns
        </h3>
        <ul className="space-y-2 text-xs">
          <li className="flex items-start gap-2">
            <Icon name="alert-triangle" size={12} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <span>Dashboard service returns Axios response directly &mdash; hooks use <Code>.then(r =&gt; r.data)</Code> pattern at hook level, not service level</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Revenue and monetary values use <Code>formatINR</Code> for Indian Rupee formatting with commas</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Date range state: <Code>preset</Code> drives the buttons, <Code>dateFrom/dateTo</Code> drive the actual API params &mdash; custom pickers override preset</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>MIS Reports support drill-down: click a cell value to load sub-report with <Code>POST /mis-reports/drill-down/:code</Code></span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Export produces async Blob download via <Code>GET /mis-reports/exports/:id/download</Code> with <Code>responseType: &quot;blob&quot;</Code></span>
          </li>
        </ul>
      </section>
    </div>
  );
}
