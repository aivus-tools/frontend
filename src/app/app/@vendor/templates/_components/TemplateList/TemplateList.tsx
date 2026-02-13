'use client';

import React from 'react';
import cn from 'classnames';
import { Empty, message } from 'antd';
import { t } from '@/lib/i18n';
import { useGetTemplatesQuery, useDeleteTemplateMutation } from '@/services/client/templatesApi';
import { Template } from '@/types/template.interface';
import { THeadItem } from '@/components/THeadItem/THeadItem';
import Spinner from '@/components/Spinner';
import { TemplateCard } from '../TemplateCard/TemplateCard';

import styles from './TemplateList.module.css';

const templateTHeads = [
  { text: t('PROJECT'), showIcon: true },
  { text: t('DESCRIPTION') },
  { text: t('CATEGORY') },
  { text: t('DASHBOARD_COST_EXPENSES'), className: 'alignRight' },
  { text: t('DASHBOARD_PROFIT'), className: 'alignRight' },
  { text: t('UPDATED') },
  { text: t('CREATED') },
];

export const TemplateList = () => {
  const { data: templates = [], isLoading } = useGetTemplatesQuery();
  const [deleteTemplate] = useDeleteTemplateMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id).unwrap();
      message.success(t('TEMPLATE_DELETED'));
    } catch {
      message.error(t('UNEXPECTED_ERROR'));
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!templates.length) {
    return (
      <div className={styles.templates}>
        <Empty description={t('NO_TEMPLATES')} />
      </div>
    );
  }

  return (
    <div className={styles.templates}>
      <div className={cn(styles.grid, styles.header)}>
        {templateTHeads.map((item, index) => (
          <THeadItem
            key={`thead_${index}`}
            className={cn({
              [styles.alignRight]: item.className === 'alignRight',
            })}
            text={item.text}
            showIcon={item.showIcon}
          />
        ))}
      </div>
      <div className={styles.content}>
        {templates.map((template: Template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};
