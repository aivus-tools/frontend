'use client';

import { useEffect } from 'react';
import { App, Button, Form, Input, Radio, Select, TimePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { t } from '@/lib/i18n';
import { useGetAgentProfileQuery, useUpdateAgentProfileMutation } from '@/services/client/emailAgentApi';
import { AgentProfilePayload, NotificationMode } from '@/types/emailAgent.interface';
import { PageSpinner } from '@/components/PageSpinner';
import { MailboxConnectPanel } from '../MailboxConnectPanel/MailboxConnectPanel';
import { getBackendErrorMessage } from '../helpers';

import styles from './AgentSettingsForm.module.css';

const TIME_FORMAT = 'HH:mm';

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

interface SettingsFormValues {
  instruction: string;
  producerEmail: string;
  notificationMode: NotificationMode;
  timezone?: string;
  start?: Dayjs | null;
  end?: Dayjs | null;
}

export const AgentSettingsForm = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<SettingsFormValues>();
  const { data: profile, isLoading } = useGetAgentProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateAgentProfileMutation();

  useEffect(() => {
    if (profile) {
      const hours = profile.workingHours || {};
      form.setFieldsValue({
        instruction: profile.instruction,
        producerEmail: profile.producerEmail,
        notificationMode: profile.notificationRules?.mode ?? 'every',
        timezone: hours.timezone,
        start: hours.start ? dayjs(hours.start, TIME_FORMAT) : null,
        end: hours.end ? dayjs(hours.end, TIME_FORMAT) : null,
      });
    }
  }, [profile, form]);

  const handleSubmit = async (values: SettingsFormValues) => {
    const workingHours: AgentProfilePayload['workingHours'] = {};
    if (values.timezone) {
      workingHours.timezone = values.timezone;
    }
    if (values.start) {
      workingHours.start = values.start.format(TIME_FORMAT);
    }
    if (values.end) {
      workingHours.end = values.end.format(TIME_FORMAT);
    }

    const payload: AgentProfilePayload = {
      instruction: values.instruction ?? '',
      producerEmail: values.producerEmail ?? '',
      notificationRules: { mode: values.notificationMode },
      workingHours,
    };

    try {
      await updateProfile(payload).unwrap();
      message.success(t('EMAIL_AGENT_SAVED'));
    } catch (error) {
      message.error(getBackendErrorMessage(error) ?? t('EMAIL_AGENT_SAVE_FAILED'));
    }
  };

  if (isLoading) {
    return <PageSpinner />;
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.pageTitle}>{t('EMAIL_AGENT_SETTINGS_TITLE')}</h1>

      <Form form={form} layout='vertical' onFinish={handleSubmit} className={styles.form}>
        <Form.Item
          name='instruction'
          label={t('EMAIL_AGENT_INSTRUCTION_LABEL')}
          extra={t('EMAIL_AGENT_INSTRUCTION_HINT')}
        >
          <Input.TextArea
            autoSize={{ minRows: 8, maxRows: 20 }}
            placeholder={t('EMAIL_AGENT_INSTRUCTION_PLACEHOLDER')}
            maxLength={8000}
            showCount
          />
        </Form.Item>

        <Form.Item
          name='producerEmail'
          label={t('EMAIL_AGENT_PRODUCER_EMAIL_LABEL')}
          extra={t('EMAIL_AGENT_PRODUCER_EMAIL_HINT')}
          rules={[{ type: 'email', message: t('EMAIL_AGENT_PRODUCER_EMAIL_LABEL') }]}
        >
          <Input placeholder='producer@studio.com' size='large' />
        </Form.Item>

        <Form.Item name='notificationMode' label={t('EMAIL_AGENT_NOTIFICATION_MODE_LABEL')}>
          <Radio.Group className={styles.radioGroup}>
            <Radio value='every'>{t('EMAIL_AGENT_NOTIFICATION_MODE_EVERY')}</Radio>
            <Radio value='urgent_and_digest'>{t('EMAIL_AGENT_NOTIFICATION_MODE_DIGEST')}</Radio>
          </Radio.Group>
        </Form.Item>

        <div className={styles.workingHours}>
          <label className={styles.fieldLabel}>{t('EMAIL_AGENT_WORKING_HOURS_LABEL')}</label>
          <p className={styles.hint}>{t('EMAIL_AGENT_WORKING_HOURS_HINT')}</p>
          <div className={styles.workingHoursRow}>
            <Form.Item name='timezone' label={t('EMAIL_AGENT_TIMEZONE_LABEL')} className={styles.tzField}>
              <Select
                size='large'
                allowClear
                showSearch
                placeholder='UTC'
                options={TIMEZONES.map((zone) => ({ value: zone, label: zone }))}
              />
            </Form.Item>
            <Form.Item name='start' label={t('EMAIL_AGENT_START_LABEL')} className={styles.timeField}>
              <TimePicker format={TIME_FORMAT} minuteStep={15} size='large' className={styles.timePicker} />
            </Form.Item>
            <Form.Item name='end' label={t('EMAIL_AGENT_END_LABEL')} className={styles.timeField}>
              <TimePicker format={TIME_FORMAT} minuteStep={15} size='large' className={styles.timePicker} />
            </Form.Item>
          </div>
        </div>

        <Button type='primary' htmlType='submit' loading={isSaving} size='large'>
          {t('EMAIL_AGENT_SAVE')}
        </Button>
      </Form>

      <div className={styles.divider} />

      <MailboxConnectPanel />
    </div>
  );
};
