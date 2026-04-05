'use client';

import React from 'react';
import { styled } from 'styled-components';
import { Button } from 'antd';
import { BriefEditor } from './BriefEditor';
import { BriefV2Detail } from '@/types/briefV2.interface';
import { t } from '@/lib/i18n';

interface BriefReadOnlyViewProps {
  brief: BriefV2Detail;
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
  return (
    <ViewWrapper>
      <ActionBar>
        <Button disabled>{t('BRIEF_V2_EXPORT_PDF')}</Button>
        <Button type='primary'>{t('BRIEF_V2_EDIT')}</Button>
      </ActionBar>
      <BriefEditor
        documentHtml={props.brief.documentHtml}
        sectionsStatus={props.brief.sectionsStatus}
        sectionsChanged={[]}
        readOnly={true}
        totalCostUsd={props.brief.totalCostUsd}
        onSectionEdit={null}
      />
    </ViewWrapper>
  );
};
