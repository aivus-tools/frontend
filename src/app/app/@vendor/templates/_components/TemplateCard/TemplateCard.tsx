'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { Template } from '@/types/template.interface';
import { formatPrice } from '@/helpers/helper';
import { format } from 'date-fns';

import styles from './TemplateCard.module.css';

interface TemplateCardProps {
  template: Template;
  onDelete: (id: string) => void;
}

const getAccentColor = (category?: string | null): string => {
  switch (category?.toLowerCase()) {
    case 'video':
      return '#2288FF';
    case 'event':
      return '#A5C500';
    default:
      return '#99A1B7';
  }
};

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onDelete }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/app/templates/${template.id}`);
  };

  const formattedCreated = template.createdAt
    ? format(new Date(template.createdAt), 'MMM dd, yyyy')
    : '';
  const formattedUpdated = template.updatedAt
    ? format(new Date(template.updatedAt), 'MMM dd, yyyy')
    : formattedCreated;

  return (
    <div className={styles.card} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className={styles.row}>
        {/* Project name + source */}
        <div className={styles.projectCell}>
          <div
            className={styles.accent}
            style={{ backgroundColor: getAccentColor(template.category) }}
          />
          <div>
            <div className={styles.projectName}>{template.name}</div>
            <div className={styles.sourceOffer}>
              {template.sourceOfferName || t('TEMPLATE')}
            </div>
          </div>
        </div>

        {/* Cost/Expenses */}
        <div className={styles.costCell}>
          <div className={styles.costValue}>
            {template.cost != null ? `$ ${formatPrice(template.cost)}` : ''}
          </div>
        </div>

        {/* Profit */}
        <div className={styles.profitCell}>
          <div className={styles.profitValue}>
            {template.profit != null ? `$ ${formatPrice(template.profit)}` : ''}
          </div>
        </div>

        {/* Updated */}
        <div className={styles.dateCell}>
          <div className={styles.dateValue}>{formattedUpdated}</div>
        </div>

        {/* Created */}
        <div className={styles.dateCell}>
          <div className={styles.dateValue}>{formattedCreated}</div>
        </div>
      </div>

      <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
        <Popconfirm
          title={t('DELETE_TEMPLATE_CONFIRM')}
          onConfirm={() => onDelete(template.id)}
          okText={t('YES')}
          cancelText={t('NO')}
        >
          <button className={styles.deleteBtn} aria-label={t('DELETE')}>
            <DeleteOutlined />
          </button>
        </Popconfirm>
      </div>
    </div>
  );
};
