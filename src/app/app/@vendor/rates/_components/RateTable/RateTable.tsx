'use client';

import { useAppDispatch } from '@/store/hooks';
import { Rate } from '@/types/rate.interface';
import { openSidebar, setSidebarInfo } from '@/store/slices/sidebar';
import { Header } from './components/Header/Header';
import { TableCollapse } from './components/Collapse/Collapse';
import { Content } from './components/Content/Content';
import { AddRateModal } from './components/AddRateModal/AddRateModal';
import { t } from '@/lib/i18n';
import { useGetRatesQuery, useDeleteRateMutation } from '@/services/client/ratesApi';
import Spinner from '@/components/Spinner';
import React, { useMemo, useState } from 'react';
import { Empty, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import styles from './RateTable.module.css';

export const RateTable = () => {
  const dispatch = useAppDispatch();
  const { data: rates = [], isLoading } = useGetRatesQuery();
  const [deleteRate] = useDeleteRateMutation();
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Group rates by their entry category or a default "General" group
  const groupedRates = useMemo(() => {
    const groups: Record<string, Rate[]> = {};
    rates.forEach((rate) => {
      const groupName = rate.entry?.categoryRef?.name || 'General';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(rate);
    });
    return groups;
  }, [rates]);

  const showSidebar = (rate: Rate): void => {
    dispatch(openSidebar());
    dispatch(setSidebarInfo({ type: 'rate', data: rate }));
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRate(id).unwrap();
      message.success(t('RATE_DELETED'));
    } catch {
      message.error(t('UNEXPECTED_ERROR'));
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!rates.length) {
    return (
      <div className={styles.rateTable}>
        <Header />
        <Empty description={t('NO_RATES')} style={{ marginTop: 60 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddModalOpen(true)}
          >
            {t('ADD_RATE_CARD')}
          </Button>
        </Empty>
        <AddRateModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
      </div>
    );
  }

  const groupEntries = Object.entries(groupedRates);

  return (
    <div className={styles.rateTable}>
      <Header />
      {groupEntries.map(([groupName, groupRates]) => (
        <TableCollapse
          key={groupName}
          label={groupName}
          extra={
            <button
              className={styles.addItemBtn}
              onClick={(e) => {
                e.stopPropagation();
                setAddModalOpen(true);
              }}
            >
              <PlusOutlined style={{ fontSize: 10 }} /> {t('ADD_RATE_ITEM')}
            </button>
          }
          content={
            <Content
              rates={groupRates}
              onSelect={showSidebar}
              onDelete={handleDelete}
            />
          }
        />
      ))}
      <div className={styles.addSectionRow}>
        <button
          className={styles.addSectionBtn}
          onClick={() => setAddModalOpen(true)}
        >
          <PlusOutlined style={{ fontSize: 10 }} /> {t('ADD_SECTION')}
        </button>
      </div>
      <AddRateModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
};
