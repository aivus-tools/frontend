'use client';
import React from 'react';
import { Typography } from 'antd';
import { useGuidance } from '@/context/GuidanceProvider';
import { styled } from 'styled-components';
import { Section, Header, Content } from './styled';
import { t } from '@/lib/i18n';
import { useComponentSize } from '@/hooks/useComponentSize';

const BorderDashedLine = styled.div`
  border: 1px dashed #99a1b7;
  margin: 8px 0;
`;

const Description = styled(Typography.Text)`
  margin-top: 8px;
  font-size: 12px !important;
  font-weight: 400 !important;
  line-height: 16px !important;
  color: var(--gray) !important;
`;

const ItemTitle = styled(Typography.Text)`
  font-size: 14px !important;
  font-weight: 700 !important;
  line-height: 17px !important;
  color: var(--main) !important;
`;

const SectionLabel = styled(Typography.Text)`
  font-size: 13px !important;
  font-weight: 600 !important;
  margin-top: 16px !important;
  display: block !important;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Guidance = () => {
  const { observedRef, width } = useComponentSize();
  const { focusedField } = useGuidance();

  return (
    <Wrapper ref={observedRef}>
      <Section style={{ position: 'fixed', width: width }}>
        <Header style={{ marginTop: 25 }}>{t('GUIDANCE')}</Header>
        <Content style={{ marginTop: 5 }}>
          {focusedField ? (
            <>
              <ItemTitle>{focusedField.label}</ItemTitle>
              <BorderDashedLine />
              <SectionLabel>{t('WHAT_IS_THIS_USED_FOR')}</SectionLabel>
              <Description>{focusedField.description}</Description>
            </>
          ) : (
            <Typography.Text type='secondary'>{t('CLICK_ON_FIELD_FOR_GUIDANCE')}</Typography.Text>
          )}
        </Content>
      </Section>
    </Wrapper>
  );
};
