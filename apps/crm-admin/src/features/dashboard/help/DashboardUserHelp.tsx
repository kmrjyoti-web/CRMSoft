'use client';

import { Icon } from '@/components/ui';

export function DashboardUserHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="bar-chart-2" size={14} className="text-blue-600" />
          </span>
          What is this screen?
        </h3>
        <p>
          The Executive Dashboard provides a real-time overview of your CRM
          performance. At a glance you can see key metrics like total leads,
          won deals, revenue, and conversion rate through KPI cards at the top.
          Below the KPIs, interactive charts show revenue trends, sales pipeline
          stages, lead source distribution, and quick stats including average
          deal size, pending activities, active leads, and lost deals.
        </p>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="activity" size={14} className="text-green-600" />
          </span>
          Typical Workflow
        </h3>
        <ol className="list-inside list-decimal space-y-1.5">
          <li>The dashboard loads with the <strong>Last 30 Days</strong> preset selected by default</li>
          <li>Review the <strong>KPI cards</strong> &mdash; Total Leads, Won Deals, Revenue, and Conversion Rate</li>
          <li>Use the <strong>date preset buttons</strong> (7D, 30D, 90D, This Month, Last Month) to change the time range</li>
          <li>For custom ranges, use the <strong>From</strong> and <strong>To</strong> date pickers</li>
          <li>Check the <strong>Revenue Trend</strong> line chart for month-over-month revenue patterns</li>
          <li>Review the <strong>Sales Pipeline</strong> bar chart to see deal counts and values by stage</li>
          <li>Analyze the <strong>Lead Sources</strong> pie chart to understand where leads are coming from</li>
          <li>Review <strong>Quick Stats</strong> for average deal size, pending activities, active leads, and lost deals</li>
        </ol>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
            <Icon name="info" size={14} className="text-amber-600" />
          </span>
          Tips
        </h3>
        <div className="space-y-2">
          <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Use <strong>date presets</strong> for quick comparisons &mdash; switch between
            &ldquo;This Month&rdquo; and &ldquo;Last Month&rdquo; to see period-over-period changes.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            <strong>KPI cards</strong> update in real time as new leads, deals, and
            payments are recorded in the system.
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            Hover over <strong>chart elements</strong> (bars, lines, pie slices) to see
            detailed tooltips with exact values and percentages.
          </div>
          <div className="rounded-md border border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-800">
            The <strong>conversion rate</strong> is calculated as Won Deals divided by Total Leads
            &mdash; focus on improving this metric for better sales efficiency.
          </div>
          <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-700">
            For detailed analysis, visit <strong>Reports</strong> to generate custom
            MIS reports with drill-down capability and export to Excel/PDF.
          </div>
        </div>
      </section>
    </div>
  );
}
