'use client';

import React from 'react';
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

const getCategoryColor = (category?: string | null): string => {
  switch (category?.toLowerCase()) {
    case 'video':
      return 'var(--bg-blue-subtotal, #F4FBFF)';
    case 'event':
      return 'var(--bg-green, #F4FBDB)';
    default:
      return 'var(--bg-gray-page, #F9F9F9)';
  }
};

const getCategoryBorderColor = (category?: string | null): string => {
  switch (category?.toLowerCase()) {
    case 'video':
      return '#2288FF';
    case 'event':
      return '#A5C500';
    default:
      return '#99A1B7';
  }
};

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
  const formattedCreated = template.createdAt
    ? format(new Date(template.createdAt), 'MMM dd, yyyy')
    : '';
  const formattedUpdated = template.updatedAt
    ? format(new Date(template.updatedAt), 'MMM dd, yyyy')
    : formattedCreated;

  return (
    <div className={styles.card}>
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

        {/* Description */}
        <div className={styles.descriptionCell}>
          <span className={styles.description}>{template.description || ''}</span>
        </div>

        {/* Category badge */}
        <div className={styles.categoryCell}>
          {template.category && (
            <span
              className={styles.categoryBadge}
              style={{
                backgroundColor: getCategoryColor(template.category),
                border: `0.6px solid ${getCategoryBorderColor(template.category)}`,
                color: getCategoryBorderColor(template.category),
              }}
            >
              {template.category}
            </span>
          )}
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

      <div className={styles.actions}>
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
