'use client';
import React, { useCallback } from 'react';

import { Button, Flex, Typography, Form } from 'antd';
import { useComponentSize } from '@/hooks/useComponentSize';
import { Section, Header, Content } from '../common/styled';
import { useGuidance } from '@/context/GuidanceProvider';
import { styled } from 'styled-components';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectMode, setMode } from '@/store/slices/project';
import { t } from '@/lib/i18n';

const BorderDashedLine = styled.div`
  border: 1px dashed #99a1b7;
  margin: 8px 0;
`;

const Description = styled(Typography.Text)`
  margin-top: 8px;
  font-size: 9px !important;
  font-weight: 700 !important;
  line-height: 10.97px !important;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const GuidanceAndControls = () => {
  const { observedRef, width } = useComponentSize();
  const [form] = Form.useForm();
  const { focusedField } = useGuidance();
  const mode = useAppSelector(selectMode);
  const dispatch = useAppDispatch();

  const reset = useCallback(() => {
    form.resetFields();
    dispatch(setMode('view'));
  }, [dispatch, form]);

  const edit = useCallback(() => {
    dispatch(setMode('edit'));
  }, [dispatch]);

  const controls =
    mode === 'edit' ? (
      <Section style={{ position: 'fixed', width: width, bottom: '24px', minWidth: '300px' }}>
        <Content>
          <Flex gap={8} align='center' justify='space-between'>
            <Typography.Text type='secondary'>{t('SAVED_AT')} 02:14 pm</Typography.Text>
            <Button type='text' onClick={reset}>
              {t('CANCEL')}
            </Button>
            <Form.Item style={{ width: 'auto', margin: 0 }}>
              <Button type='primary' htmlType='submit'>
                {t('SAVE')}
              </Button>
            </Form.Item>
          </Flex>
        </Content>
      </Section>
    ) : (
      <Flex
        gap={8}
        align='center'
        justify='end'
        style={{ position: 'fixed', width: width, bottom: '24px', minWidth: '300px' }}
      >
        <Button type='primary' onClick={edit} style={{ margin: '10px 30px' }}>
          {t('EDIT')}
        </Button>
      </Flex>
    );

  return (
    <Wrapper ref={observedRef}>
      <Section style={{ position: 'fixed', width: width }}>
        <Header>{t('GUIDANCE')}</Header>
        <Content>
          {focusedField ? (
            <>
              <Typography.Text>{focusedField.label}</Typography.Text>
              <BorderDashedLine />
              <Typography.Text>{t('WHAT_IS_THIS_USED_FOR')}</Typography.Text>
              <Description type='secondary'>{focusedField.description}</Description>
            </>
          ) : (
            <Typography.Text>{t('CLICK_ON_FIELD_FOR_GUIDANCE')}</Typography.Text>
          )}
        </Content>
      </Section>
      {controls}
    </Wrapper>
  );
};
