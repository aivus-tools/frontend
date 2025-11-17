'use client';

import React from 'react';
import { Section, Header, Content } from '../project-details/common/styled';
import { Typography } from 'antd';
import { t } from '@/lib/i18n';
import { styled } from 'styled-components';

const Wrapper = styled.div`
  flex: 1 1 30%;
  min-width: 300px;
`;

const GuidanceContent = styled(Content)`
  min-height: 200px;
  color: var(--gray);
`;

/**
 * Guidance sidebar for Client's Offer
 * Reserved for future functionality (descriptions, notes, etc.)
 */
export function ClientOfferGuidance() {
  return (
    <Wrapper>
      <Section style={{ position: 'sticky', top: 24 }}>
        <Header>{t('GUIDANCE')}</Header>
        <GuidanceContent>
          <Typography.Text type='secondary'>
            {/* Reserved for future guidance content */}
            {t('CLICK_ON_FIELD_FOR_GUIDANCE')}
          </Typography.Text>
        </GuidanceContent>
      </Section>
    </Wrapper>
  );
}

