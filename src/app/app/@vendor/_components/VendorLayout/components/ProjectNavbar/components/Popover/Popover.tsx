'use client';

import React, { useState, useEffect } from 'react';
import { Popover as AntdPopover, Select, Input, DatePicker, Switch, Button } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { t, tRich } from '@/lib/i18n';

import styles from './Popover.module.css';

export type ExportPopoverProps = {
  children: React.ReactElement;
  action: (data: { format: 'xlsx' | 'pdf' | 'csv'; name: string; date?: Dayjs; watermark?: string }) => void;
  defaultName?: string;
};

export const ExportPopover: React.FC<ExportPopoverProps> = ({ children, action, defaultName }) => {
  const [format, setFormat] = useState<'xlsx' | 'pdf' | 'csv'>('pdf');
  const [name, setName] = useState(defaultName || '');

  useEffect(() => {
    if (defaultName && !name) setName(defaultName);
  }, [defaultName]);

  const [includeDate, setIncludeDate] = useState(true);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermark, setWatermark] = useState('');

  const disableWatermark = !watermarkEnabled;

  const handleSubmit = () => {
    action({
      format,
      name,
      date: includeDate && date ? date : undefined,
      watermark: watermarkEnabled && watermark !== '' ? watermark : undefined,
    });
  };

  const content = (
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.headerRow}>
          <div className={styles.headerLabel}>{t('EXPORT')}</div>
          <Select
            size='small'
            value={format}
            onChange={(v) => setFormat(v)}
            className={styles.formatSelect}
            options={[
              { label: 'pdf', value: 'pdf' },
            ]}
          />
        </div>

        <div className={styles.helper}>
          {tRich('EXPORT_VERSION_SAVED_HELPER', {
            b: <strong />,
          })}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.label}>{t('NAME_THIS_VERSION')}</div>
        <Input placeholder={t('VERSION_NAME')} value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className={styles.block}>
        <div className={styles.row}>
          <div className={styles.label}>{t('INCLUDE_DATE')}</div>
          <DatePicker
            value={date}
            onChange={(d) => setDate(d)}
            disabled={!includeDate}
            format='MM/DD/YYYY'
            suffixIcon={null}
          />
          <Switch size='small' checked={includeDate} onChange={setIncludeDate} />
        </div>

        <div className={styles.row}>
          <div className={styles.label}>{t('WATERMARK')}</div>
          <Input
            placeholder={t('EXAMPLE')}
            value={watermark}
            onChange={(e) => setWatermark(e.target.value)}
            disabled={disableWatermark}
          />
          <Switch size='small' checked={watermarkEnabled} onChange={setWatermarkEnabled} />
        </div>
      </div>

      <Button type='primary' block onClick={handleSubmit} className={styles.actionButton}>
        {t('SAVE_AND_DOWNLOAD')}
      </Button>
    </div>
  );

  return (
    <AntdPopover content={content} trigger='click' placement='bottomRight' arrow={false}>
      {children}
    </AntdPopover>
  );
};

export default ExportPopover;
