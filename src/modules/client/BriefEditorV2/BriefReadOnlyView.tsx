'use client';

import React, { useState } from 'react';
import { styled } from 'styled-components';
import { Button } from 'antd';
import { BriefEditor } from './BriefEditor';
import { BriefSharePopup } from '@/modules/BriefSharePopup/BriefSharePopup';
import { BriefV2Detail } from '@/types/briefV2.interface';
import { t } from '@/lib/i18n';
import { ApiRoute } from '@/constants/apiRoute';

interface BriefReadOnlyViewProps {
  brief: BriefV2Detail;
  onEdit?: (() => void) | null;
}

const ViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 70px);
  background: #f8f9fb;
`;

const ActionBar = styled.div`
  padding: 12px 20px;
  border-bottom: 1px solid #eef0f4;
  background: #ffffff;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

export const BriefReadOnlyView: React.FC<BriefReadOnlyViewProps> = (props) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const isCompleted = props.brief.status === 'COMPLETED';

  const handlePdf = async () => {
    try {
      const { downloadPdf } = await import('@/helpers/downloadPdf');
      await downloadPdf(ApiRoute.BRIEF_AI_PDF(props.brief.id), 'Brief.pdf');
    } catch {
      // noop
    }
  };

  return (
    <ViewWrapper>
      <ActionBar>
        <Button onClick={handlePdf}>{t('BRIEF_V2_EXPORT_PDF')}</Button>
        {isCompleted && <Button onClick={() => setIsShareOpen(true)}>{t('BRIEF_V2_SHARE')}</Button>}
        {props.onEdit && (
          <Button type='primary' onClick={props.onEdit}>
            {t('BRIEF_V2_EDIT')}
          </Button>
        )}
      </ActionBar>
      <BriefEditor
        documentHtml={props.brief.documentHtml}
        sectionsStatus={props.brief.sectionsStatus}
        sectionsChanged={[]}
        readOnly={true}
        totalCostUsd={props.brief.totalCostUsd}
        onSectionEdit={null}
      />
      {isCompleted && (
        <BriefSharePopup open={isShareOpen} onClose={() => setIsShareOpen(false)} briefId={props.brief.id} />
      )}
    </ViewWrapper>
  );
};
