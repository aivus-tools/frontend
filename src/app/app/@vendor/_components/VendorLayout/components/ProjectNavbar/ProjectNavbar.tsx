'use client';
import { Button } from 'antd';
import { t } from '@/lib/i18n';
import { useSelectedLayoutSegments } from 'next/navigation';
import { VENDOR_PROJECT_TAB_KEYS } from '@/constants/constants';
import { useSetVendor } from '@/app/app/@vendor/_hooks/useSetVendor';
import { useSetProject } from '@/app/app/@vendor/_hooks/useSetProject';
import { ProjectTabs } from './components/ProjectTabs/ProjectTabs';
import { ExportPopover } from './components/Popover/Popover';

import styles from './ProjectNavbar.module.css';
import { exportToExcel } from '@/helpers/exportToExcel';

export const ProjectNavbar = () => {
  useSetProject();
  useSetVendor();

  const [, , tab] = useSelectedLayoutSegments();

  const handleExport = async ({
    format,
    name,
    date,
    watermark,
  }: {
    format: 'xlsx' | 'pdf' | 'csv';
    name: string;
    date?: string;
    watermark?: string;
  }) => {
    if (format === 'xlsx') {
      await exportToExcel([], name, date, watermark);
    }
  };

  return (
    <div className={styles.navbar}>
      <ProjectTabs />

      <div className={styles.buttons}>
        {tab === VENDOR_PROJECT_TAB_KEYS.OFFER && (
          <ExportPopover action={handleExport}>
            <Button className={styles.export} type='primary'>
              {t('EXPORT')}
            </Button>
          </ExportPopover>
        )}

        <div className={styles.share}>
          <Button type='primary'>{t('SHARE')}</Button>
        </div>
      </div>
    </div>
  );
};
