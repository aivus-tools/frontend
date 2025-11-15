'use client';
import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { InitialParameters } from './InitialParameters';
import { Client } from './Client';
import { Brief } from './Brief';
import { Specifications } from './Specifications';
import { GuidanceAndControls } from '../common/GuidanceAndControls';
import { Wrapper, Section, Header, Column, Content } from '../common/styled';
import { Form, message } from 'antd';
import { useMutateBrief } from '@/hooks/useMutateBrief';
import { Details as DetailsType } from '@/types/brief.interface';
import { useBrief } from '@/hooks/useBrief';
import { GuidanceProvider } from '@/context/GuidanceProvider';
import { useAppDispatch } from '@/store/hooks';
import { setMode } from '@/store/slices/project';
import { initialValues } from './initialValues';
import { t } from '@/lib/i18n';
import { AppRoute } from '@/constants/appRoute';

export default function Details() {
  const dispatch = useAppDispatch();
  const { create, update, isLoading: isMutating } = useMutateBrief();
  const { data: brief, isLoading } = useBrief();
  const [form] = Form.useForm<DetailsType>();
  const [messageApi, context] = message.useMessage();
  const router = useRouter();

  useEffect(() => {
    form.setFieldsValue(initialValues);
    if (!isLoading && brief && typeof brief.details === 'object') {
      form.setFieldsValue(brief.details);
    }
  }, [brief, form, isLoading]);

  const handleSubmit = useCallback(
    async (details: DetailsType) => {
      console.log('details', details);
      try {
        let projectId: string | undefined;
        if (brief) {
          // Update existing brief
          await update({ ...brief, details });
          // TODO: Get projectId from brief or store
          projectId = brief.id; // Temporary: using briefId as projectId
        } else {
          // Create new brief + project + offer
          const data = await create(details);
          projectId = (data as { projectId?: string })?.projectId || data?.id;
        }
        messageApi.success(t('DETAILS_SAVED_SUCCESSFULLY'));
        if (projectId) {
          dispatch(setMode('view'));
          router.push(AppRoute.DASHBOARD_PROJECT_DETAILS(projectId));
        } else {
          messageApi.error(t('ERROR_SAVING_DETAILS'));
        }
      } catch (error) {
        console.error(error);
        messageApi.error((error as { data?: { message?: string } })?.data?.message || t('ERROR_SAVING_DETAILS'));
      }
    },
    [brief, create, dispatch, messageApi, router, update]
  );

  return (
    <GuidanceProvider>
      {context}
      <Form<DetailsType>
        form={form}
        layout='vertical'
        disabled={isMutating}
        size='large'
        initialValues={initialValues}
        onFinish={handleSubmit}
        scrollToFirstError
        clearOnDestroy
        onValuesChange={(changedValues, { collaborators }) => {
          if (changedValues.collaborators) {
            if (collaborators?.every((person) => !!person)) {
              form.setFieldsValue({ collaborators: [...collaborators, ''] });
            }
          }
        }}
      >
        <Wrapper>
          <Column style={{ flex: '1 1 70%' }}>
            <Section>
              <Header>{t('INITIAL_PARAMETERS')}</Header>
              <Content>
                <InitialParameters />
              </Content>
            </Section>
            <Section>
              <Header>{t('THE_CLIENT')}</Header>
              <Content>
                <Client />
              </Content>
            </Section>
            <Section>
              <Header>{t('THE_CLIENTS_BRIEF')}</Header>
              <Content>
                <Brief />
              </Content>
            </Section>
            <Section>
              <Header>{t('RIGHTS_AND_TECHNICAL_SPECIFICATIONS')}</Header>
              <Content>
                <Specifications />
              </Content>
            </Section>
          </Column>
          <Column style={{ flex: '1 1 30%', justifyContent: 'space-between' }}>
            <GuidanceAndControls />
          </Column>
        </Wrapper>
      </Form>
    </GuidanceProvider>
  );
}
