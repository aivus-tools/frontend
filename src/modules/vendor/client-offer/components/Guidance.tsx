'use client';
import React from 'react';
import { Typography } from 'antd';
import parse from 'html-react-parser';
import { useGuidance } from '@/context/GuidanceProvider';
import { t } from '@/lib/i18n';
import { useComponentSize } from '@/hooks/useComponentSize';

import commonStyles from './components.module.css';
import styles from './Guidance.module.css';

export const Guidance = () => {
  const { observedRef, width } = useComponentSize();
  const { focusedField } = useGuidance();

  return (
    <div className={styles.wrapper} ref={observedRef}>
      <div className={commonStyles.section} style={{ position: 'fixed', width: width }}>
        <div className={commonStyles.header} style={{ marginTop: 25 }}>
          {t('GUIDANCE')}
        </div>
        <div className={commonStyles.content} style={{ marginTop: 5 }}>
          {focusedField ? (
            <>
              <Typography.Text className={styles.itemTitle}>{focusedField.label}</Typography.Text>
              {focusedField.shortDescription && (
                <div className={styles.shortDescription}>{focusedField.shortDescription}</div>
              )}
              {focusedField.description && (
                <>
                  <div className={styles.borderDashedLine} />
                  <div className={styles.sectionTitle}>{t('WHAT_IS_THIS_USED_FOR')}</div>
                  <div className={styles.description}>
                    {typeof focusedField.description === 'string'
                      ? parse(focusedField.description)
                      : focusedField.description}
                  </div>
                </>
              )}
            </>
          ) : (
            <Typography.Text type='secondary'>{t('CLICK_ON_FIELD_FOR_GUIDANCE')}</Typography.Text>
          )}
        </div>
      </div>
    </div>
  );
};
