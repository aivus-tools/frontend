'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetBriefQuery } from '@/services/client/briefApi';
import { t } from '@/lib/i18n';
import Spinner from '@/components/Spinner';
import { styled } from 'styled-components';
import { Tag, Empty, Button } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { AppRoute } from '@/constants/appRoute';
import { formatPrice } from '@/helpers/helper';
import { PROJECT_STATUS } from '@/constants/constants';

const PageWrapper = styled.div`
  padding: 30px;
  max-width: 900px;
`;

const BriefHeader = styled.div`
  margin-bottom: 32px;
`;

const BriefTitle = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 24px;
  color: #4b5675;
  margin: 0 0 8px 0;
`;

const BriefStatus = styled.div`
  margin-bottom: 24px;
`;

const Section = styled.div`
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0px 5px 16.5px -11px rgba(0, 0, 0, 0.25);
  padding: 24px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #2288ff;
  text-transform: uppercase;
  margin: 0 0 16px 0;
`;

const Field = styled.div`
  margin-bottom: 12px;
`;

const FieldLabel = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 10px;
  color: #99a1b7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const FieldValue = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #4b5675;
`;

const OffersSection = styled.div`
  margin-top: 24px;
`;

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const briefId = params.projectId as string;
  const { data: brief, isLoading } = useGetBriefQuery(briefId, { skip: !briefId });

  if (isLoading) {
    return <Spinner />;
  }

  if (!brief) {
    return (
      <PageWrapper>
        <Empty description={t('BRIEF_NOT_FOUND')} />
      </PageWrapper>
    );
  }

  const details = brief.details;

  return (
    <PageWrapper>
      <BriefHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BriefTitle>{details?.projectName || t('UNTITLED_BRIEF')}</BriefTitle>
          <Button
            type="primary"
            icon={<BarChartOutlined />}
            onClick={() => router.push(AppRoute.BRIEF_COMPARISON(briefId))}
            style={{ background: '#2288FF', borderColor: '#2288FF' }}
          >
            {t('COMPARISON')}
          </Button>
        </div>
        <BriefStatus>
          <Tag color={brief.status === PROJECT_STATUS.DRAFT ? 'default' : 'blue'}>{brief.status}</Tag>
        </BriefStatus>
      </BriefHeader>

      <Section>
        <SectionTitle>{t('PROJECT_DETAILS')}</SectionTitle>
        {details?.clientName && (
          <Field>
            <FieldLabel>{t('CLIENT')}</FieldLabel>
            <FieldValue>{details.clientName}</FieldValue>
          </Field>
        )}
        {details?.brandName && (
          <Field>
            <FieldLabel>{t('BRAND_NAME')}</FieldLabel>
            <FieldValue>{details.brandName}</FieldValue>
          </Field>
        )}
        {details?.projectDescription && (
          <Field>
            <FieldLabel>{t('PROJECT_DESCRIPTION')}</FieldLabel>
            <FieldValue>{details.projectDescription}</FieldValue>
          </Field>
        )}
        {details?.description && (
          <Field>
            <FieldLabel>{t('DESCRIPTION')}</FieldLabel>
            <FieldValue>{details.description}</FieldValue>
          </Field>
        )}
        {details?.budget != null && (
          <Field>
            <FieldLabel>{t('CLIENT_BUDGET')}</FieldLabel>
            <FieldValue>$ {formatPrice(details.budget)}</FieldValue>
          </Field>
        )}
      </Section>

      <OffersSection>
        <Section>
          <SectionTitle>{t('OFFERS')}</SectionTitle>
          <Empty description={t('NO_LINKED_OFFERS')} />
        </Section>
      </OffersSection>
    </PageWrapper>
  );
}
