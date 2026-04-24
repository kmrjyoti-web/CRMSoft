import styles from '../travvellis.module.css';

const CAMEL_PATH = 'M6 46 Q10 36 16 34 Q18 24 24 24 Q26 10 32 14 Q36 8 40 16 Q44 24 42 32 Q46 34 48 42 L50 46 L46 46 L44 38 L42 46 L38 46 L34 36 L26 36 L22 46 L18 46 L20 38 L12 38 L10 46 Z';

interface Props {
  sceneRef: React.Ref<HTMLDivElement>;
}

export function DesertScene({ sceneRef }: Props) {
  return (
    <div ref={sceneRef} className={styles.fgScene}>
      {/* Pyramids */}
      <svg className={styles.landmark} style={{ left: '55%', bottom: '26vh' }} width="220" height="160" viewBox="0 0 220 160">
        <path d="M110 158 L50 20 L-10 158 Z" fill="rgba(160,120,60,.95)" />
        <path d="M110 158 L50 20 L50 158 Z" fill="rgba(120,80,40,.95)" />
        <path d="M200 158 L160 50 L120 158 Z" fill="rgba(150,110,50,.9)" />
        <path d="M200 158 L160 50 L160 158 Z" fill="rgba(110,70,30,.9)" />
      </svg>

      <div className={styles.dunes} />

      {/* Camel caravan */}
      <div className={styles.caravan}>
        <svg width="64" height="54" viewBox="0 0 64 54">
          <path d={CAMEL_PATH} fill="#1a1208" />
        </svg>
        <svg width="58" height="50" viewBox="0 0 64 54">
          <path d={CAMEL_PATH} fill="#1a1208" />
        </svg>
        <svg width="62" height="52" viewBox="0 0 64 54">
          <path d={CAMEL_PATH} fill="#1a1208" />
        </svg>
      </div>
    </div>
  );
}
