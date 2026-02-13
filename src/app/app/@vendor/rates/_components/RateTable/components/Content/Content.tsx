'use client';

import React from 'react';
import { Rate } from '@/types/rate.interface';
import { Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { formatPrice } from '@/helpers/helper';

import styles from './Content.module.css';

interface ContentProps {
  rates: Rate[];
  onSelect?: (rate: Rate) => void;
  onDelete?: (id: string) => void;
}

export const Content: React.FC<ContentProps> = ({ rates, onSelect, onDelete }) => {
  if (!rates.length) {
    return null;
  }

  return (
    <div className={styles.content}>
      {rates.map((rate) => (
        <div
          key={rate.id}
          className={styles.row}
          onClick={() => onSelect?.(rate)}
        >
          <div className={styles.nameCell}>
            <span className={styles.name}>{rate.name}</span>
            {rate.entry && (
              <span className={styles.entryCount}>
                {' '}
                <span className={styles.badge}>1</span>
              </span>
            )}
          </div>
          <div className={styles.priceCell}>
            {formatPrice(rate.basePrice)}
          </div>
          <div className={styles.unitCell}>
            <span className={styles.perLabel}>{t('PER')}</span>
            <span className={styles.unitValue}>
              {rate.entry?.categoryRef?.name || 'Unit'}
            </span>
          </div>
          <div className={styles.actions}>
            {onDelete && (
              <Popconfirm
                title={t('DELETE_RATE_CONFIRM')}
                onConfirm={(e) => {
                  e?.stopPropagation();
                  onDelete(String(rate.id));
                }}
                onCancel={(e) => e?.stopPropagation()}
                okText={t('YES')}
                cancelText={t('NO')}
              >
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={t('DELETE')}
                >
                  <DeleteOutlined />
                </button>
              </Popconfirm>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
