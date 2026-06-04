import React, { useEffect, useState } from 'react';
import { t } from '@/lib/i18n';
import { FINALIZING_PROGRESS_CEILING, FINALIZING_STAGE_KEYS, FINALIZING_STAGE_TOTAL_MS } from '../constants';

import styles from '../BriefEditor.module.css';

export const FinalizingView = () => {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 250);
    return () => clearInterval(interval);
  }, []);

  const stageCount = FINALIZING_STAGE_KEYS.length;
  const perStageMs = FINALIZING_STAGE_TOTAL_MS / stageCount;
  const stageIndex = Math.min(stageCount - 1, Math.floor(elapsedMs / perStageMs));
  const linearProgress = Math.min(FINALIZING_PROGRESS_CEILING, (elapsedMs / FINALIZING_STAGE_TOTAL_MS) * 100);
  const stageLabels = FINALIZING_STAGE_KEYS.map((key, index) => ({
    key,
    label: t(key),
    isActive: index === stageIndex,
    isDone: index < stageIndex,
  }));

  return (
    <div className={styles.generatingOverlay}>
      <div className={styles.spinner} />
      <h3 className={styles.generatingTitle}>{t('BRIEF_V3_FINALIZING_TITLE')}</h3>
      <p className={styles.generatingSubtitle}>{t('BRIEF_V3_FINALIZING_ETA')}</p>
      <div
        className={styles.finalizingProgressTrack}
        role='progressbar'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(linearProgress)}
      >
        <div className={styles.finalizingProgressBar} style={{ width: `${linearProgress}%` }} />
      </div>
      <ul className={styles.finalizingStageList}>
        {stageLabels.map((stage) => (
          <li
            key={stage.key}
            className={
              stage.isActive
                ? `${styles.finalizingStage} ${styles.finalizingStageActive}`
                : stage.isDone
                  ? `${styles.finalizingStage} ${styles.finalizingStageDone}`
                  : styles.finalizingStage
            }
          >
            {stage.label}
          </li>
        ))}
      </ul>
    </div>
  );
};
