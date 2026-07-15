'use client';

import { App, Button, Card, Form, Input, Popconfirm, Tag } from 'antd';
import { t } from '@/lib/i18n';
import {
  useConnectMailboxMutation,
  useDisconnectMailboxMutation,
  useGetMailboxesQuery,
} from '@/services/client/emailAgentApi';
import { EmailAccountRole, Mailbox } from '@/types/emailAgent.interface';
import { getBackendErrorMessage, mailboxStatusColor, mailboxStatusLabel } from '../helpers';

import styles from './MailboxConnectPanel.module.css';

interface MailboxRowProps {
  role: EmailAccountRole;
  title: string;
  hint: string;
  mailbox: Mailbox | undefined;
}

interface ConnectFormValues {
  email: string;
  credential: string;
}

const MailboxRow = (props: MailboxRowProps) => {
  const { message } = App.useApp();
  const [form] = Form.useForm<ConnectFormValues>();
  const [connectMailbox, { isLoading: isConnecting }] = useConnectMailboxMutation();
  const [disconnectMailbox, { isLoading: isDisconnecting }] = useDisconnectMailboxMutation();

  const handleConnect = async (values: ConnectFormValues) => {
    try {
      await connectMailbox({
        role: props.role,
        email: values.email.trim(),
        credential: values.credential,
      }).unwrap();
      message.success(t('EMAIL_AGENT_MAILBOX_CONNECTED_OK'));
      form.resetFields();
    } catch (error) {
      message.error(getBackendErrorMessage(error) ?? t('EMAIL_AGENT_MAILBOX_CONNECT_FAILED'));
    }
  };

  const handleDisconnect = async () => {
    if (!props.mailbox) {
      return;
    }
    try {
      await disconnectMailbox(props.mailbox.id).unwrap();
      message.success(t('EMAIL_AGENT_MAILBOX_DISCONNECTED_OK'));
    } catch (error) {
      message.error(getBackendErrorMessage(error) ?? t('EMAIL_AGENT_DRAFT_ACTION_FAILED'));
    }
  };

  return (
    <Card className={styles.row} size='small'>
      <div className={styles.rowHeader}>
        <div>
          <div className={styles.roleTitle}>{props.title}</div>
          <div className={styles.roleHint}>{props.hint}</div>
        </div>
        {props.mailbox && (
          <Tag color={mailboxStatusColor(props.mailbox.status)}>{mailboxStatusLabel(props.mailbox.status)}</Tag>
        )}
      </div>

      {props.mailbox ? (
        <div className={styles.connected}>
          <span className={styles.email}>{props.mailbox.email}</span>
          <Popconfirm
            title={t('EMAIL_AGENT_MAILBOX_DISCONNECT')}
            okText={t('EMAIL_AGENT_MAILBOX_DISCONNECT')}
            cancelText={t('EMAIL_AGENT_CANCEL')}
            onConfirm={handleDisconnect}
          >
            <Button danger loading={isDisconnecting}>
              {t('EMAIL_AGENT_MAILBOX_DISCONNECT')}
            </Button>
          </Popconfirm>
        </div>
      ) : (
        <Form form={form} layout='vertical' onFinish={handleConnect} className={styles.connectForm}>
          <Form.Item
            name='email'
            label={t('EMAIL_AGENT_MAILBOX_EMAIL')}
            rules={[{ required: true, type: 'email', message: t('EMAIL_AGENT_MAILBOX_EMAIL') }]}
          >
            <Input placeholder='info@studio.com' size='large' autoComplete='off' />
          </Form.Item>
          <Form.Item
            name='credential'
            label={t('EMAIL_AGENT_MAILBOX_APP_PASSWORD')}
            rules={[{ required: true, message: t('EMAIL_AGENT_MAILBOX_APP_PASSWORD') }]}
          >
            <Input.Password placeholder='xxxx xxxx xxxx xxxx' size='large' autoComplete='off' />
          </Form.Item>
          <Button type='primary' htmlType='submit' loading={isConnecting} size='large'>
            {t('EMAIL_AGENT_MAILBOX_CONNECT')}
          </Button>
        </Form>
      )}
    </Card>
  );
};

export const MailboxConnectPanel = () => {
  const { data } = useGetMailboxesQuery();
  const mailboxes = data?.mailboxes ?? [];
  const monitor = mailboxes.find((box) => box.role === 'monitor');
  const agent = mailboxes.find((box) => box.role === 'agent');

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{t('EMAIL_AGENT_MAILBOX_TITLE')}</h2>
      <div className={styles.rows}>
        <MailboxRow
          role='monitor'
          title={t('EMAIL_AGENT_MAILBOX_MONITOR')}
          hint={t('EMAIL_AGENT_MAILBOX_MONITOR_HINT')}
          mailbox={monitor}
        />
        <MailboxRow
          role='agent'
          title={t('EMAIL_AGENT_MAILBOX_AGENT')}
          hint={t('EMAIL_AGENT_MAILBOX_AGENT_HINT')}
          mailbox={agent}
        />
      </div>
    </div>
  );
};
