'use client';
import React from 'react';
import { Typography } from 'antd';
import parse from 'html-react-parser';
import { useGuidance } from '@/context/GuidanceProvider';
import { styled } from 'styled-components';
import { Section, Header, Content } from './styled';
import { t } from '@/lib/i18n';
import { useComponentSize } from '@/hooks/useComponentSize';

const BorderDashedLine = styled.div`
  width: 100%;
  height: 0;
  border-top: 1px dashed #99a1b7;
  margin: 12px 0;
`;

const ShortDescription = styled.div`
  font-size: 9px;
  font-weight: 500;
  line-height: 1.4;
  color: #a0a0a0;
  margin-top: 5px;
`;

const ShortDescriptionLabel = styled.span`
  font-weight: 700;
`;

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  line-height: 17px;
  color: var(--main);
  margin-bottom: 5px;
`;

const Description = styled.div`
  font-size: 9px;
  font-weight: 500;
  line-height: 1.4;
  color: #a0a0a0;
`;

const ItemTitle = styled(Typography.Text)`
  font-size: 14px !important;
  font-weight: 700 !important;
  line-height: 17px !important;
  color: var(--main) !important;
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
              {focusedField.shortDescription && (
                <ShortDescription>
                  {focusedField.shortDescription}
                </ShortDescription>
              )}
              {focusedField.description && (
                <>
                  <BorderDashedLine />
                  <SectionTitle>{t('WHAT_IS_THIS_USED_FOR')}</SectionTitle>
                  <Description>
                    {typeof focusedField.description === 'string'
                      ? parse(focusedField.description)
                      : focusedField.description}
                  </Description>
                </>
              )}
            </>
          ) : (
            <Typography.Text type='secondary'>{t('CLICK_ON_FIELD_FOR_GUIDANCE')}</Typography.Text>
          )}
        </Content>
      </Section>
    </Wrapper>
  );
};
