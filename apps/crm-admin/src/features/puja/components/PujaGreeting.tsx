"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { pujaService } from "../services/puja.service";
import {
  getFestivalsForDate,
  getUpcomingFestivals,
  type Festival,
} from "../data/festivals-2026";
import type { ReligiousModeConfig } from "../types/puja.types";

interface PujaGreetingProps {
  config: ReligiousModeConfig;
}

export function PujaGreeting({ config }: PujaGreetingProps) {
  const [dismissed, setDismissed] = useState(false);
  const [todayFestivals, setTodayFestivals] = useState<Festival[]>([]);
  const [upcomingFestivals, setUpcomingFestivals] = useState<Festival[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setTodayFestivals(getFestivalsForDate(today));
    setUpcomingFestivals(getUpcomingFestivals(today, 7));
  }, []);

  if (dismissed || !config.enabled) return null;

  const hasTodayFestival = todayFestivals.length > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.96 }}
        transition={{ duration: 0.35, type: "spring", stiffness: 260, damping: 22 }}
        style={{
          background: hasTodayFestival
            ? "linear-gradient(135deg, #fff8e1, #fff3e0, #fce4ec)"
            : "linear-gradient(135deg, #fff8e1, #fffde7)",
          borderRadius: 14,
          padding: "14px 18px",
          marginBottom: 20,
          border: hasTodayFestival ? "1.5px solid #f59e0b" : "1.5px solid #fde68a",
          boxShadow: hasTodayFestival
            ? "0 4px 20px rgba(245,158,11,0.18)"
            : "0 2px 8px rgba(245,158,11,0.08)",
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        {/* Main icon */}
        <span style={{ fontSize: 32, flexShrink: 0 }}>
          {hasTodayFestival ? todayFestivals[0].icon : "🙏"}
        </span>

        <div style={{ flex: 1 }}>
          {/* Festival name */}
          {hasTodayFestival ? (
            <>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#b45309", margin: 0 }}>
                {todayFestivals[0].greeting}
              </p>
              <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>
                {todayFestivals[0].description}
              </p>
              {todayFestivals.length > 1 && (
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                  Also today: {todayFestivals.slice(1).map((f) => f.name).join(", ")}
                </p>
              )}
            </>
          ) : (
            <>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#92400e", margin: 0 }}>
                {config.greeting.secondary}
              </p>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                {config.greeting.primary}
              </p>
            </>
          )}

          {/* Upcoming festivals chip row */}
          {upcomingFestivals.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginTop: 8,
              }}
            >
              {upcomingFestivals.slice(0, 3).map((f) => (
                <UpcomingChip key={f.date + f.name} festival={f} />
              ))}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss greeting"
          style={{
            position: "absolute",
            top: 8,
            right: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            color: "#9ca3af",
            padding: 2,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

function UpcomingChip({ festival }: { festival: Festival }) {
  const daysUntil = Math.round(
    (new Date(festival.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        background: "rgba(245,158,11,0.1)",
        border: "1px solid rgba(245,158,11,0.25)",
        borderRadius: 20,
        padding: "2px 8px",
        color: "#92400e",
      }}
    >
      {festival.icon} {festival.name}
      <span style={{ color: "#f59e0b", fontWeight: 600 }}>
        &nbsp;{daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `in ${daysUntil}d`}
      </span>
    </span>
  );
}
