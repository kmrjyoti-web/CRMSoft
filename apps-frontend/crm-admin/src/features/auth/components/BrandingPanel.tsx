"use client";

import { getGreeting, type TimePeriod } from "../utils/time-utils";

interface BrandingPanelProps {
  period: TimePeriod;
}

export default function BrandingPanel({ period }: BrandingPanelProps) {
  return (
    <div className="hidden lg:flex tod-auth-right">
      <div className="tod-auth-right-inner">
        <h1 className="text-5xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg">
          Revolutionize CRM with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-white">
            Smarter Automation
          </span>
        </h1>

        <p className="text-lg text-white/70 mb-10 leading-relaxed">
          Manage your business relationships with powerful insights,
          seamless workflows, and real-time analytics.
        </p>

        <div className="tod-quote-card">
          <blockquote className="text-lg text-white/90 italic mb-5">
            &ldquo;This CRM transformed how we manage our client relationships.
            Reliable, fast, and future-ready.&rdquo;
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm">
              MC
            </div>
            <div>
              <p className="text-white font-bold text-sm">Michael Carter</p>
              <p className="text-teal-100 text-sm">CTO at DevCore</p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs text-white/50 font-mono uppercase tracking-wider">
          {getGreeting(period)} mode
        </p>
      </div>
    </div>
  );
}
