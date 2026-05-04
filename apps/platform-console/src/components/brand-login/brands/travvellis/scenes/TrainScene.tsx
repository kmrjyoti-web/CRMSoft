import styles from '../travvellis.module.css';

interface Props {
  sceneRef: React.Ref<HTMLDivElement>;
}

export function TrainScene({ sceneRef }: Props) {
  return (
    <div ref={sceneRef} className={styles.fgScene}>
      <div className={styles.mountains} />
      <div className={styles.trainTrack} />
      <div className={styles.train}>
        <div className={styles.loco}>
          <div className={styles.whl} style={{ left: 12 }} />
          <div className={styles.whl} style={{ left: 50 }} />
          <div className={styles.whl} style={{ left: 80 }} />
          <div className={styles.smoke} style={{ animationDelay: '0s' }} />
          <div className={styles.smoke} style={{ animationDelay: '-.5s', left: 65 }} />
          <div className={styles.smoke} style={{ animationDelay: '-1s', left: 58 }} />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className={styles.tcar}>
            <div className={styles.whl} style={{ left: 10 }} />
            <div className={styles.whl} style={{ left: 70 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
