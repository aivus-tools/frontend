'use client';
import { Button, App, Tooltip, Input } from 'antd';
import { t } from '@/lib/i18n';
import { useSelectedLayoutSegments } from 'next/navigation';
import { VENDOR_PROJECT_TAB_KEYS } from '@/constants/constants';
import { useSetVendor } from '@/app/app/@vendor/_hooks/useSetVendor';
import { useSetProject } from '@/app/app/@vendor/_hooks/useSetProject';
import { ProjectTabs } from './components/ProjectTabs/ProjectTabs';
import { ExportPopover } from './components/Popover/Popover';

import styles from './ProjectNavbar.module.css';
import { exportOfferToExcel } from '@/helpers/excelExport/exportToExcel';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectOfferMetaData, selectTemplateId } from '@/store/slices/offer/selectors';
import { useLazyGetOfferExportDataQuery } from '@/services/client/offersApi';
import { setMetaData } from '@/store/slices/offer/slice';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useRef, useState } from 'react';
import { SharePopup } from '@/modules/SharePopup/SharePopup';
import { SaveTemplateModal } from '@/modules/vendor/SaveTemplateModal/SaveTemplateModal';
import { useSession } from 'next-auth/react';
import { useUpdateTemplateMutation } from '@/services/client/templatesApi';

interface ProjectNavbarProps {
  variant?: 'desktop' | 'mobile';
}

export const ProjectNavbar = (props: ProjectNavbarProps) => {
  const variant = props.variant ?? 'desktop';
  const isMobile = variant === 'mobile';
  const { message } = App.useApp();
  useSetProject();
  useSetVendor();

  const dispatch = useAppDispatch();
  const offerMetaData = useAppSelector(selectOfferMetaData);
  const [triggerExportData] = useLazyGetOfferExportDataQuery();
  const templateId = useAppSelector(selectTemplateId);
  const session = useSession();
  const [shareOpen, setShareOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [updateTemplate] = useUpdateTemplateMutation();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isTemplateMode = templateId != null;

  const [, , tab] = useSelectedLayoutSegments();

  const handleTemplateNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value;
      if (offerMetaData) {
        dispatch(setMetaData({ ...offerMetaData, projectName: name }));
      }
      if (templateId) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          updateTemplate({ id: templateId, body: { name } });
        }, 800);
      }
    },
    [dispatch, offerMetaData, templateId, updateTemplate]
  );

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
    if (format === 'xlsx' && offerMetaData?.id) {
      const result = await triggerExportData(offerMetaData.id).unwrap();
      await exportOfferToExcel(result, { fileName: name, date, watermark });
    } else if (format === 'pdf' && offerMetaData?.id) {
      window.open(`/export/${offerMetaData.id}`, '_blank');
    } else {
      message.info(t('COMING_SOON'));
    }
  };

  const isEstimation = tab === VENDOR_PROJECT_TAB_KEYS.ESTIMATION;

  return (
    <div className={styles.navbar}>
      {isTemplateMode ? (
        <Input
          value={offerMetaData?.projectName ?? ''}
          onChange={handleTemplateNameChange}
          placeholder={t('TEMPLATE_NAME_PLACEHOLDER')}
          variant='borderless'
          className={styles.templateNameInput}
        />
      ) : isMobile ? null : (
        <ProjectTabs />
      )}

      <div className={styles.buttons}>
        {!isTemplateMode && isEstimation && offerMetaData?.id && (
          <Button onClick={() => setSaveTemplateOpen(true)}>{t('SAVE_AS_TEMPLATE')}</Button>
        )}

        {!isTemplateMode && tab === VENDOR_PROJECT_TAB_KEYS.OFFER && (
          <ExportPopover
            action={handleExport}
            defaultName={
              offerMetaData?.projectName ? `${offerMetaData.projectName} ${dayjs().format('MM-DD-YYYY')}` : ''
            }
          >
            <Button className={styles.export} type='primary'>
              {t('EXPORT')}
            </Button>
          </ExportPopover>
        )}

        {!isTemplateMode && offerMetaData?.id && (
          <div className={styles.share}>
            <Tooltip title={offerMetaData.status !== 'PUBLISHED' ? t('SHARE_PUBLISH_REQUIRED') : undefined}>
              <Button type='primary' disabled={offerMetaData.status !== 'PUBLISHED'} onClick={() => setShareOpen(true)}>
                {t('SHARE')}
              </Button>
            </Tooltip>
          </div>
        )}
      </div>

      {!isTemplateMode && offerMetaData?.id && (
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
