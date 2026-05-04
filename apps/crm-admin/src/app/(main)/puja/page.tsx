"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { pujaService } from "@/features/puja/services/puja.service";
import { PujaAudio } from "@/features/puja/PujaAudio";
import { PetalShower } from "@/features/puja/components/PetalShower";
import { SmokeEffect } from "@/features/puja/components/SmokeEffect";
import {
  PUJA_ITEMS_META,
  type ReligiousModeConfig,
  type PujaStatusResponse,
} from "@/features/puja/types/puja.types";
import {
  getUpcomingFestivals,
  type Festival,
} from "@/features/puja/data/festivals-2026";
import styles from "@/features/puja/PujaAnimations.module.css";

const ITEM_ANIM: Record<string, string> = {
  DEEP:       "glowFlame",
  AGARBATTI:  "smokeRise",
  CHANDAN:    "gentleBounce",
  PRASAD:     "gentleBounce",
  PHOOL:      "petalFall",
  AARTI:      "aartiRotate",
  RICE:       "gentleBounce",
  MEDITATION: "singingBowl",
  CANDLE:     "glowFlame",
  PRAYER:     "gentleBounce",
  DUA:        "gentleBounce",
  TASBIH:     "tasbihSwing",
  ARDAS:      "gentleBounce",
  WATER:      "ripple",
};

const DEITY_EMOJI: Record<string, string> = {
  GANPATI: "🐘", SHIVA: "🔱", LAKSHMI: "🪷", SARASWATI: "🦢",
  KRISHNA: "🪈", RAM: "🏹", HANUMAN: "🙏",
  IK_ONKAR: "☬", GURU_NANAK: "🕯️",
  MAHAVIR: "🕉️", BUDDHA: "☸️", BISMILLAH: "🌙",
  CROSS: "✝️", CANDLE: "🕯️", OM: "🕉️", EARTH: "🌍",
};

export default function PujaPage() {
  const [status, setStatus] = useState<PujaStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [offeredItems, setOfferedItems] = useState<Set<string>>(new Set());
  const [petalActive, setPetalActive] = useState(false);
  const [smokeActive, setSmokeActive] = useState(false);
  const [upcomingFestivals, setUpcomingFestivals] = useState<Festival[]>([]);
  const [sessionLog, setSessionLog] = useState<string[]>([]);

  useEffect(() => {
    pujaService.getStatus()
      .then(setStatus)
      .catch(() => setStatus({ show: false }))
      .finally(() => setLoading(false));

    const today = new Date().toISOString().split("T")[0];
    setUpcomingFestivals(getUpcomingFestivals(today, 30));
  }, []);

  const config = status?.config;

  const handleItemClick = (itemCode: string) => {
    if (!config) return;
    setActiveItem(itemCode);
    setOfferedItems((prev) => new Set(prev).add(itemCode));

    const item = PUJA_ITEMS_META[itemCode];
    const label = item?.nameHi ?? itemCode;

    setSessionLog((prev) => [
      `🙏 ${label} अर्पित किया — ${new Date().toLocaleTimeString("hi-IN")}`,
      ...prev.slice(0, 9),
    ]);

    if (config.soundEnabled) {
      PujaAudio.playItemSound(item?.sound ?? "bell_chime");
    }

    if (itemCode === "PHOOL") {
      setPetalActive(true);
      setTimeout(() => setPetalActive(false), 2200);
    }
    if (itemCode === "AGARBATTI") {
      setSmokeActive(true);
      setTimeout(() => setSmokeActive(false), 2200);
    }

    setTimeout(() => setActiveItem(null), 1800);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🙏</div>
          <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading puja room…</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div style={{ maxWidth: 480, margin: "60px auto", textAlign: "center", padding: "0 16px" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🕯️</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
          Puja Mode Not Configured
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>
          Enable Religious Mode in Settings to access the Puja room.
        </p>
        <a
          href="/settings/religious-mode"
          style={{
            display: "inline-block",
            padding: "9px 22px",
            borderRadius: 24,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Open Settings →
        </a>
      </div>
    );
  }

  const deityEmoji = DEITY_EMOJI[config.deity] ?? "🙏";

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px", position: "relative" }}>
      <PetalShower active={petalActive} count={16} />
      {smokeActive && <SmokeEffect active originX={0} originY={60} />}

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "radial-gradient(circle at 40% 35%, #fff8e1, #ffecb3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            margin: "0 auto 16px",
            boxShadow: "0 0 0 4px #ffe082, 0 0 40px rgba(255,180,0,0.3)",
            animation: "pujaGlow 2.4s ease-in-out infinite alternate",
            cursor: "default",
          }}
        >
          {deityEmoji}
        </motion.div>

        <h1
          style={{
            fontSize: 22,
            fontFamily: "serif",
            color: "#b45309",
            letterSpacing: "0.04em",
            margin: "0 0 4px",
          }}
        >
          {config.greeting.primary}
        </h1>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#5d4037", margin: 0 }}>
          {config.greeting.secondary}
        </p>
        <p style={{ fontSize: 12, color: "#9e9e9e", marginTop: 4 }}>
          Puja Room — {offeredItems.size} of {config.pujaItems.length} items offered
        </p>
      </div>

      {/* Puja items grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {config.pujaItems.map((itemCode, i) => {
          const item = PUJA_ITEMS_META[itemCode];
          if (!item) return null;
          const isActive = activeItem === itemCode;
          const isOffered = offeredItems.has(itemCode);
          const animClass = isActive
            ? styles[ITEM_ANIM[itemCode] ?? "gentleBounce"]
            : undefined;

          return (
            <motion.button
              key={itemCode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleItemClick(itemCode)}
              title={item.name}
              style={{
                aspectRatio: "1",
                borderRadius: 16,
                background: isOffered
                  ? "linear-gradient(135deg, #fff8e1, #ffecb3)"
                  : "#ffffff",
                border: isActive
                  ? "2px solid #f59e0b"
                  : isOffered
                  ? "1.5px solid #fcd34d"
                  : "1.5px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                boxShadow: isActive
                  ? "0 0 20px rgba(245,158,11,0.45)"
                  : isOffered
                  ? "0 2px 10px rgba(245,158,11,0.18)"
                  : "0 1px 4px rgba(0,0,0,0.06)",
                transition: "border 0.2s, box-shadow 0.2s, background 0.2s",
                padding: 8,
              }}
            >
              <span
                className={animClass}
                style={{ fontSize: 32, lineHeight: 1, display: "inline-block" }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: isOffered ? "#92400e" : "#6b7280",
                  marginTop: 6,
                  fontWeight: isOffered ? 600 : 400,
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {item.nameHi}
              </span>

              {isOffered && !isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "#fff",
                    fontWeight: 700,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Session log */}
      <AnimatePresence>
        {sessionLog.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: "rgba(255,248,230,0.8)",
              border: "1px solid #fde68a",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 28,
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 600, color: "#92400e", margin: "0 0 8px" }}>
              🙏 Session Log
            </p>
            {sessionLog.map((log, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ fontSize: 12, color: "#6b7280", margin: "3px 0" }}
              >
                {log}
              </motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming festivals */}
      {upcomingFestivals.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#374151",
              margin: "0 0 12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🗓 Upcoming Festivals (next 30 days)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcomingFestivals.map((f) => (
              <FestivalRow key={f.date + f.name} festival={f} />
            ))}
          </div>
        </div>
      )}

      {/* Settings link */}
      <div style={{ textAlign: "center", paddingBottom: 24 }}>
        <a
          href="/settings/religious-mode"
          style={{
            fontSize: 13,
            color: "#9ca3af",
            textDecoration: "none",
          }}
        >
          ⚙ Religious Mode Settings
        </a>
      </div>

      {/* Glow keyframe */}
      <style>{`
        @keyframes pujaGlow {
          from { box-shadow: 0 0 0 4px #ffe082, 0 0 30px rgba(255,180,0,0.2); }
          to   { box-shadow: 0 0 0 4px #ffd54f, 0 0 60px rgba(255,180,0,0.4); }
        }
      `}</style>
    </div>
  );
}

function FestivalRow({ festival }: { festival: Festival }) {
  const today = new Date().toISOString().split("T")[0];
  const daysUntil = Math.round(
    (new Date(festival.date).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24),
  );
  const isToday = daysUntil === 0;
  const isTomorrow = daysUntil === 1;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 10,
        background: isToday ? "linear-gradient(135deg, #fff8e1, #fef3c7)" : "#f9fafb",
        border: isToday ? "1.5px solid #f59e0b" : "1px solid #e5e7eb",
      }}
    >
      <span style={{ fontSize: 22 }}>{festival.icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: 0 }}>
          {festival.name}
          {isToday && (
            <span
              style={{
                marginLeft: 6,
                fontSize: 10,
                background: "#f59e0b",
                color: "#fff",
                borderRadius: 10,
                padding: "1px 6px",
                fontWeight: 700,
              }}
            >
              TODAY
            </span>
          )}
        </p>
        <p style={{ fontSize: 11, color: "#9ca3af", margin: "1px 0 0" }}>
          {festival.description}
        </p>
      </div>
      <span
        style={{
          fontSize: 11,
          color: isToday ? "#f59e0b" : "#9ca3af",
          fontWeight: isToday ? 700 : 400,
          whiteSpace: "nowrap",
        }}
      >
        {isToday
          ? "Today!"
          : isTomorrow
          ? "Tomorrow"
          : `${festival.date.slice(5).replace("-", "/")} — ${daysUntil}d`}
      </span>
    </div>
  );
}
