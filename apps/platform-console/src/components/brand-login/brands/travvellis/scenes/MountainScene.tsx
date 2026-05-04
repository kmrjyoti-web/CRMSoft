import styles from '../travvellis.module.css';
import { Seagulls } from './Seagulls';

interface Props {
  sceneRef: React.Ref<HTMLDivElement>;
}

export function MountainScene({ sceneRef }: Props) {
  return (
    <div ref={sceneRef} className={styles.fgScene}>
      <div className={styles.mountains} />
      <Seagulls count={5} />
    </div>
  );
}
