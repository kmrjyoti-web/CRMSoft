"use client";

import Link from "next/link";
import { User, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

export function ProfileSummaryCard() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const displayName =
    user.firstName
      ? `${user.firstName} ${user.lastName ?? ""}`.trim()
      : user.email.split("@")[0];

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-gradient-to-r from-slate-900/60 to-slate-800/40 border border-slate-700/50 rounded-xl p-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-lg font-semibold select-none">
          {initials}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">
            Welcome back, {displayName}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {(user as any).talentId && (
              <span className="mr-2 text-slate-500">
                ID: {(user as any).talentId} ·
              </span>
            )}
            {user.email}
          </p>
        </div>
      </div>

      <Link
        href="/profile"
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-md transition-colors"
      >
        <User className="h-4 w-4" />
        View profile
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
