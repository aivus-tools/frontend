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
import { GuidanceProvider } from '@/context/Guidance';
import { useAppDispatch } from '@/store/hooks';
import { setMode } from '@/store/slices/project';
import { initialValues } from './initialValues';

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
        let briefId: string | undefined;
        if (brief) {
          briefId = brief.id;
          await update({ ...brief, details });
        } else {
          const data = await create(details);
          briefId = data?.id;
        }
        messageApi.success('Details saved successfully');
        if (briefId) {
          dispatch(setMode('view'));
          router.push(`/app/dashboard/${briefId}/details`);
        } else {
          messageApi.error('An error occurred while saving the details');
        }
      } catch (error) {
        console.error(error);
        messageApi.error(
          (error as { data?: { message?: string } })?.data?.message || 'An error occurred while saving the details'
        );
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
              <Header>Initial parameters</Header>
              <Content>
                <InitialParameters />
              </Content>
            </Section>
            <Section>
              <Header>the Client</Header>
              <Content>
                <Client />
              </Content>
            </Section>
            <Section>
              <Header>the Client’s brief</Header>
              <Content>
                <Brief />
              </Content>
            </Section>
            <Section>
              <Header>Rights and Technical Specifications</Header>
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
