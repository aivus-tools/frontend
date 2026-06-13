'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { App, Button, Form, Input, Modal } from 'antd';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { t } from '@/lib/i18n';
import {
  useSendPublicBriefToVendorMutation,
  useSendClientBriefToVendorMutation,
  useLazyGetPublicBriefStatusQuery,
} from '@/services/client/publicBriefApi';
import { useLazyGetBriefAiStatusQuery } from '@/services/client/briefAiApi';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 120_000;

const getSendErrorMessage = (error: unknown): string => {
  const fetchError = error as FetchBaseQueryError;
  if (fetchError && typeof fetchError === 'object' && 'status' in fetchError) {
    const status = fetchError.status;
    const data = fetchError.data as { error?: string } | null;
    const errorCode = data?.error;
    if (status === 409) {
      return t('BRANDED_BRIEF_SEND_ERROR_ALREADY_SENT');
    }
    if (status === 400 && errorCode === 'not_ready') {
      return t('BRANDED_BRIEF_SEND_ERROR_NOT_READY');
    }
    if (status === 404 && errorCode === 'agency_not_found') {
      return t('BRANDED_BRIEF_SEND_ERROR_NO_AGENCY');
    }
    if (errorCode === 'failed') {
      return t('BRANDED_BRIEF_SEND_ERROR_FAILED');
    }
  }
  return t('BRANDED_BRIEF_SEND_ERROR');
};

interface SendBriefModalProps {
  value: boolean;
  onChange: (open: boolean) => void;
  briefId: string;
  slug: string;
  vendorName: string;
  isAnon: boolean;
  token: string | null;
  onSuccess: () => void;
}

interface FormValues {
  email: string;
}

export const SendBriefModal = (props: SendBriefModalProps) => {
  const { message: messageApi } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const [isSending, setIsSending] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number>(0);

  const [sendPublic] = useSendPublicBriefToVendorMutation();
  const [sendClient] = useSendClientBriefToVendorMutation();
  const [getPublicStatus] = useLazyGetPublicBriefStatusQuery();
  const [getAuthStatus] = useLazyGetBriefAiStatusQuery();

  const cleanupTimer = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupTimer();
    };
  }, []);

  const pollUntilDone = useCallback(
    async (taskId: string) => {
      const elapsed = Date.now() - startedAtRef.current;
      if (elapsed > POLL_TIMEOUT_MS) {
        setIsSending(false);
        messageApi.error(t('BRANDED_BRIEF_SEND_ERROR'));
        return;
      }

      try {
        let status: string;

        if (props.isAnon) {
          if (!props.token) {
            setIsSending(false);
            messageApi.error(t('BRANDED_BRIEF_SEND_ERROR'));
            return;
          }
          const result = await getPublicStatus({
            briefId: props.briefId,
            taskId,
            token: props.token,
          }).unwrap();
          status = result.status;
        } else {
          const result = await getAuthStatus({
            briefId: props.briefId,
            taskId,
          }).unwrap();
          status = result.status;
        }

        if (status === 'done') {
          setIsSending(false);
          props.onChange(false);
          props.onSuccess();
          return;
        }

        if (status === 'failed') {
          setIsSending(false);
          messageApi.error(t('BRANDED_BRIEF_SEND_ERROR_FAILED'));
          return;
        }

        pollTimerRef.current = setTimeout(() => pollUntilDone(taskId), POLL_INTERVAL_MS);
      } catch (error) {
        setIsSending(false);
        messageApi.error(getSendErrorMessage(error));
      }
    },
    [getAuthStatus, getPublicStatus, messageApi, props]
  );

  const handleSubmit = async (values: FormValues) => {
    if (isSending) {
      return;
    }
    setIsSending(true);
    startedAtRef.current = Date.now();

    try {
      let finalizingTaskId: string | null = null;

      if (props.isAnon) {
        if (!props.token) {
          setIsSending(false);
          messageApi.error(t('BRANDED_BRIEF_SEND_ERROR'));
          return;
        }
        const result = await sendPublic({
          briefId: props.briefId,
          token: props.token,
          email: values.email,
          slug: props.slug,
        }).unwrap();
        finalizingTaskId = result.finalizingTaskId ?? null;
      } else {
        const result = await sendClient({
          briefId: props.briefId,
          slug: props.slug,
        }).unwrap();
        finalizingTaskId = result.finalizingTaskId ?? null;
      }

      if (finalizingTaskId) {
        pollTimerRef.current = setTimeout(() => pollUntilDone(finalizingTaskId as string), POLL_INTERVAL_MS);
      } else {
        setIsSending(false);
        props.onChange(false);
        props.onSuccess();
      }
    } catch (error) {
      setIsSending(false);
      messageApi.error(getSendErrorMessage(error));
    }
  };

  const handleCancel = () => {
    if (isSending) {
      return;
    }
    props.onChange(false);
  };

  return (
    <Modal
      open={props.value}
      title={t('BRANDED_BRIEF_SEND_MODAL_TITLE', props.vendorName)}
      onCancel={handleCancel}
      footer={null}
      maskClosable={!isSending}
    >
      <Form form={form} layout='vertical' onFinish={handleSubmit}>
        {props.isAnon ? (
          <Form.Item
            name='email'
            label={t('BRANDED_BRIEF_SEND_EMAIL_LABEL')}
            rules={[
              { required: true, message: t('BRANDED_BRIEF_SEND_EMAIL_REQUIRED') },
              { type: 'email', message: t('BRANDED_BRIEF_SEND_EMAIL_INVALID') },
            ]}
          >
            <Input type='email' placeholder={t('BRANDED_BRIEF_SEND_EMAIL_PLACEHOLDER')} size='large' />
          </Form.Item>
        ) : null}
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type='primary' htmlType='submit' size='large' block loading={isSending}>
            {isSending ? t('BRANDED_BRIEF_SEND_LOADING') : t('BRANDED_BRIEF_SEND')}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
