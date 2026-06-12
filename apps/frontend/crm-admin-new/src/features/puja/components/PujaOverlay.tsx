"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PUJA_ITEMS_META } from "../types/puja.types";
import { pujaService } from "../services/puja.service";
import { PujaAudio } from "../PujaAudio";
import { PetalShower } from "./PetalShower";
import { SmokeEffect } from "./SmokeEffect";
import styles from "../PujaAnimations.module.css";
import type { ReligiousModeConfig } from "../types/puja.types";

interface PujaOverlayProps {
  config: ReligiousModeConfig;
  onClose: () => void;
}

/** Map item code → CSS animation class */
const ITEM_ANIM: Record<string, keyof typeof styles> = {
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

export function PujaOverlay({ config, onClose }: PujaOverlayProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [offeredItems, setOfferedItems] = useState<Set<string>>(new Set());
  const [petalActive, setPetalActive] = useState(false);
  const [smokeItem, setSmokeItem] = useState<string | null>(null);
  const startTime = useRef(Date.now());
  const hasPlayedWelcome = useRef(false);

  // Play religion welcome sound once on mount
  useEffect(() => {
    if (!hasPlayedWelcome.current && config.soundEnabled) {
      hasPlayedWelcome.current = true;
      setTimeout(() => {
        PujaAudio.playReligionWelcome(config.religion);
      }, 600);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-close timer
  useEffect(() => {
    if (!config.autoCloseAfterSeconds) return;
    const timer = setTimeout(handleClose, config.autoCloseAfterSeconds * 1000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.autoCloseAfterSeconds]);

  const handleItemClick = (itemCode: string) => {
    setActiveItem(itemCode);
    setOfferedItems((prev) => new Set(prev).add(itemCode));

    // Rich per-item sound
    if (config.soundEnabled) {
      const item = PUJA_ITEMS_META[itemCode];
      PujaAudio.playItemSound(item?.sound ?? 'bell_chime');
    }

    // Per-item special effects
    if (itemCode === 'PHOOL') {
      setPetalActive(true);
      setTimeout(() => setPetalActive(false), 2200);
    }
    if (itemCode === 'AGARBATTI') {
      setSmokeItem(itemCode);
      setTimeout(() => setSmokeItem(null), 2200);
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

  const deityEmoji = getDeityEmoji(config.religion, config.deity);

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
        {/* Petal shower overlay */}
        <PetalShower active={petalActive} count={14} />

        {/* Smoke effect overlay */}
        {smokeItem && <SmokeEffect active={true} originX={0} originY={80} />}

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
            const animClass = isActive ? styles[ITEM_ANIM[itemCode] ?? "gentleBounce"] : undefined;

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
                  transition: "border 0.25s ease, box-shadow 0.25s ease, background 0.25s ease",
                }}
              >
                <span
                  className={animClass}
                  style={{
                    fontSize: 28,
                    lineHeight: 1,
                    display: "inline-block",
                  }}
                >
                  {item.icon}
                </span>
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
function getDeityEmoji(religion: string, deity: string): string {
  const map: Record<string, string> = {
    GANPATI: "🐘", SHIVA: "🔱", LAKSHMI: "🪷", SARASWATI: "🦢",
    KRISHNA: "🪈", RAM: "🏹", HANUMAN: "🙏",
    IK_ONKAR: "☬", GURU_NANAK: "🕯️",
    MAHAVIR: "🕉️", BUDDHA: "☸️", BISMILLAH: "🌙",
    CROSS: "✝️", CANDLE: "🕯️", OM: "🕉️", EARTH: "🌍",
  };
  return map[deity] ?? (religion === "MUSLIM" ? "🌙" : religion === "CHRISTIAN" ? "✝️" : "🙏");
}
