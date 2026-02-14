'use client';
import { Button, message } from 'antd';
import { t } from '@/lib/i18n';
import { useSelectedLayoutSegments } from 'next/navigation';
import { VENDOR_PROJECT_TAB_KEYS } from '@/constants/constants';
import { useSetVendor } from '@/app/app/@vendor/_hooks/useSetVendor';
import { useSetProject } from '@/app/app/@vendor/_hooks/useSetProject';
import { ProjectTabs } from './components/ProjectTabs/ProjectTabs';
import { ExportPopover } from './components/Popover/Popover';

import styles from './ProjectNavbar.module.css';
import { exportToExcel } from '@/helpers/excelExport/exportToExcel';
import { useAppSelector } from '@/store/hooks';
import { selectCategoriesExportData, selectOfferMetaData } from '@/store/slices/offer/selectors';
import { Dayjs } from 'dayjs';
import { useState } from 'react';
import { SharePopup } from '@/modules/SharePopup/SharePopup';
import { SaveTemplateModal } from '@/modules/vendor/SaveTemplateModal/SaveTemplateModal';
import { useSession } from 'next-auth/react';

export const ProjectNavbar = () => {
  useSetProject();
  useSetVendor();

  const categoriesExportData = useAppSelector(selectCategoriesExportData);
  const offerMetaData = useAppSelector(selectOfferMetaData);
  const session = useSession();
  const [shareOpen, setShareOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);

  const [, , tab] = useSelectedLayoutSegments();

  const handleExport = async ({
    format,
    name,
    date,
    watermark,
  }: {
    format: 'xlsx' | 'pdf' | 'csv';
    name: string;
    date?: Dayjs;
    watermark?: string;
  }) => {
    if (format === 'xlsx') {
      await exportToExcel(categoriesExportData, name, date, watermark, offerMetaData?.id);
    } else {
      message.info(t('COMING_SOON'));
    }
  };

  const isEstimation = tab === VENDOR_PROJECT_TAB_KEYS.ESTIMATION;

  return (
    <div className={styles.navbar}>
      <ProjectTabs />

      <div className={styles.buttons}>
        {isEstimation && offerMetaData?.id && (
          <Button onClick={() => setSaveTemplateOpen(true)}>
            {t('SAVE_AS_TEMPLATE')}
          </Button>
        )}

        {tab === VENDOR_PROJECT_TAB_KEYS.OFFER && (
          <ExportPopover action={handleExport}>
            <Button className={styles.export} type='primary'>
              {t('EXPORT')}
            </Button>
          </ExportPopover>
        )}

        {offerMetaData?.id && (
          <div className={styles.share}>
            <Button type='primary' onClick={() => setShareOpen(true)}>
              {t('SHARE')}
            </Button>
          </div>
        )}
      </div>

      {offerMetaData?.id && (
        <>
          <SharePopup
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            offerId={offerMetaData.id}
            ownerName={session.data?.user?.name ?? undefined}
            ownerAvatar={session.data?.user?.image ?? undefined}
          />
          <SaveTemplateModal
            open={saveTemplateOpen}
            onClose={() => setSaveTemplateOpen(false)}
            offerId={offerMetaData.id}
          />
        </>
      )}
    </div>
  );
};
