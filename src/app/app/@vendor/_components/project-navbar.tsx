'use client';
import { Button } from 'antd';
import { ProjectTabs } from './project-tabs';
import { useSetProject } from '../_hooks/useSetProject';
import { useSetVendor } from '../_hooks/useSetVendor';
import { t } from '@/lib/i18n';
import { useSelectedLayoutSegments } from 'next/navigation';
import { VENDOR_PROJECT_TAB_KEYS } from '@/constants/constants';

export const ProjectNavbar = () => {
  useSetProject();
  useSetVendor();

  const [, , tab] = useSelectedLayoutSegments();

  debugger;

  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <ProjectTabs />
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Button type='primary'>{t('SHARE')}</Button>
      </div>

      {tab === VENDOR_PROJECT_TAB_KEYS.OFFER && (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Button type='primary'>{t('EXPORT')}</Button>
        </div>
      )}
    </div>
  );
};
