import styles from '../travvellis.module.css';

const CLOUD_DEFS = [
  { w: 220, h: 70,  top: 12, dur: 110, delay: 0,    op: 0.75 },
  { w: 160, h: 56,  top: 22, dur: 140, delay: -40,  op: 0.6  },
  { w: 260, h: 80,  top: 6,  dur: 95,  delay: -18,  op: 0.8  },
  { w: 180, h: 60,  top: 28, dur: 130, delay: -65,  op: 0.55 },
  { w: 200, h: 65,  top: 16, dur: 160, delay: -100, op: 0.7  },
];

export function Clouds() {
  return (
    <div className={styles.clouds}>
      {CLOUD_DEFS.map((c, i) => (
        <div
          key={i}
          className={styles.cloud}
          style={{
            width: c.w,
            height: c.h,
            top: `${c.top}%`,
            left: '-20vw',
            ['--dur' as string]: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
            opacity: c.op,
          } as React.CSSProperties}
        >
          <svg width={c.w} height={c.h} viewBox={`0 0 ${c.w} ${c.h}`} fill="rgba(255,255,255,.9)">
            <ellipse cx={c.w * 0.3}  cy={c.h * 0.5}  rx={c.w * 0.22} ry={c.h * 0.38} />
            <ellipse cx={c.w * 0.5}  cy={c.h * 0.4}  rx={c.w * 0.28} ry={c.h * 0.48} />
            <ellipse cx={c.w * 0.7}  cy={c.h * 0.55} rx={c.w * 0.22} ry={c.h * 0.36} />
            <ellipse cx={c.w * 0.85} cy={c.h * 0.48} rx={c.w * 0.15} ry={c.h * 0.32} />
            <ellipse cx={c.w * 0.15} cy={c.h * 0.55} rx={c.w * 0.12} ry={c.h * 0.26} />
          </svg>
        </div>
      ))}
    </div>
  );
}
