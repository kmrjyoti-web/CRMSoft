"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PUJA_ITEMS_META } from "../types/puja.types";
import { pujaService } from "../services/puja.service";
import type { ReligiousModeConfig } from "../types/puja.types";

interface PujaOverlayProps {
  config: ReligiousModeConfig;
  onClose: () => void;
}

// Play a simple audio tone if browser allows (placeholder — replace with real mp3 files)
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(528, ctx.currentTime); // Healing frequency
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } catch {
    // Silent fail — AudioContext may be blocked
  }
}

export function PujaOverlay({ config, onClose }: PujaOverlayProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [offeredItems, setOfferedItems] = useState<Set<string>>(new Set());
  const [particles, setParticles] = useState<{ id: number; x: number; emoji: string }[]>([]);
  const startTime = useRef(Date.now());
  const particleId = useRef(0);

  // Auto-close timer with progress bar
  useEffect(() => {
    if (!config.autoCloseAfterSeconds) return;
    const timer = setTimeout(handleClose, config.autoCloseAfterSeconds * 1000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.autoCloseAfterSeconds]);

  const handleItemClick = (itemCode: string) => {
    setActiveItem(itemCode);
    setOfferedItems((prev) => new Set(prev).add(itemCode));

    if (config.soundEnabled) playChime();

    // Spawn emoji particles
    const item = PUJA_ITEMS_META[itemCode];
    if (item) {
      const newParticles = Array.from({ length: 5 }, () => ({
        id: particleId.current++,
        x: Math.random() * 200 - 100,
        emoji: item.icon,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
      setTimeout(() => {
        setParticles((prev) =>
          prev.filter((p) => !newParticles.find((n) => n.id === p.id)),
        );
      }, 1500);
    }

    setTimeout(() => setActiveItem(null), 1800);
  };

  const handleClose = () => {
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    pujaService.logInteraction({
      itemsOffered: Array.from(offeredItems),
      duration,
      date: new Date().toISOString().split("T")[0],
    });
    onClose();
  };

  const deityEmoji = getDeitEmoji(config.religion, config.deity);

  return (
    <AnimatePresence>
      <motion.div
        key="puja-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, #fff8e6 0%, #ffffff 45%, #f0fff4 100%)",
          padding: "24px 16px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Particles */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, y: 0, x: `calc(50% + ${p.x}px)`, scale: 1 }}
              animate={{ opacity: 0, y: -120, scale: 1.4 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              style={{ position: "absolute", bottom: "35%", fontSize: 22 }}
            >
              {p.emoji}
            </motion.div>
          ))}
        </div>

        {/* Primary mantra */}
        <motion.p
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: 18,
            color: "#b45309",
            fontFamily: "serif",
            letterSpacing: "0.03em",
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          {config.greeting.primary}
        </motion.p>

        {/* Deity circle with glow */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 200, damping: 18 }}
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "radial-gradient(circle at 40% 35%, #fff8e1, #ffecb3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 76,
            margin: "20px 0",
            boxShadow:
              "0 0 0 4px #ffe082, 0 0 40px rgba(255,180,0,0.35), 0 8px 32px rgba(0,0,0,0.08)",
            animation: "pujaGlow 2.4s ease-in-out infinite alternate",
            cursor: "default",
            userSelect: "none",
          }}
        >
          {deityEmoji}
        </motion.div>

        {/* Secondary greeting */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: "#5d4037",
            marginBottom: 2,
          }}
        >
          {config.greeting.secondary}
        </motion.p>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          style={{ fontSize: 12, color: "#9e9e9e", marginBottom: 18 }}
        >
          Tap to offer your prayers
        </motion.p>

        {/* Puja items */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 340,
          }}
        >
          {config.pujaItems.map((itemCode, i) => {
            const item = PUJA_ITEMS_META[itemCode];
            if (!item) return null;
            const isActive = activeItem === itemCode;
            const isOffered = offeredItems.has(itemCode);

            return (
              <motion.button
                key={itemCode}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleItemClick(itemCode)}
                style={{
                  width: 66,
                  height: 74,
                  borderRadius: 14,
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
                    ? "0 0 16px rgba(245,158,11,0.4)"
                    : isOffered
                    ? "0 2px 8px rgba(245,158,11,0.15)"
                    : "0 1px 4px rgba(0,0,0,0.06)",
                  transition: "all 0.25s ease",
                }}
              >
                <span style={{ fontSize: 28, lineHeight: 1 }}>{item.icon}</span>
                <span style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
                  {item.nameHi}
                </span>

                {/* Offered badge */}
                {isOffered && !isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -5,
                      width: 17,
                      height: 17,
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

        {/* Enter / Skip button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          onClick={handleClose}
          style={{
            marginTop: 28,
            padding: "9px 28px",
            borderRadius: 24,
            background:
              offeredItems.size > 0
                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                : "rgba(245,158,11,0.12)",
            border: "none",
            color: offeredItems.size > 0 ? "#fff" : "#92400e",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow:
              offeredItems.size > 0
                ? "0 4px 14px rgba(245,158,11,0.4)"
                : "none",
            transition: "all 0.3s ease",
          }}
        >
          {offeredItems.size > 0 ? "🙏 Enter App" : "Skip →"}
        </motion.button>

        {/* Auto-close progress bar */}
        {config.autoCloseAfterSeconds > 0 && (
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{
              duration: config.autoCloseAfterSeconds,
              ease: "linear",
            }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg, #f59e0b, #fcd34d)",
              transformOrigin: "left center",
            }}
          />
        )}

        {/* Glow keyframe */}
        <style>{`
          @keyframes pujaGlow {
            from { box-shadow: 0 0 0 4px #ffe082, 0 0 30px rgba(255,180,0,0.25), 0 8px 32px rgba(0,0,0,0.06); }
            to   { box-shadow: 0 0 0 4px #ffd54f, 0 0 60px rgba(255,180,0,0.45), 0 8px 32px rgba(0,0,0,0.10); }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper: pick emoji for deity/religion
function getDeitEmoji(religion: string, deity: string): string {
  const map: Record<string, string> = {
    GANPATI: "🐘", SHIVA: "🔱", LAKSHMI: "🪷", SARASWATI: "🦢",
    KRISHNA: "🪈", RAM: "🏹", HANUMAN: "🙏",
    IK_ONKAR: "☬", GURU_NANAK: "🕯️",
    MAHAVIR: "🕉️", BUDDHA: "☸️", BISMILLAH: "🌙",
    CROSS: "✝️", CANDLE: "🕯️", OM: "🕉️", EARTH: "🌍",
  };
  return map[deity] ?? (religion === "MUSLIM" ? "🌙" : religion === "CHRISTIAN" ? "✝️" : "🙏");
}
