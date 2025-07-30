'use client';
import { Button, message, Typography } from 'antd';
import { useState } from 'react';

import { GROUPS } from '@/constants/constants';
import { Groups } from '@/types/user.interface.';

import styles from './form.module.css';
import { useChangeGroup } from '@/hooks/useChangeGroup';
import { useSession } from 'next-auth/react';
import Spinner from '@/components/Spinner';

const { Title } = Typography;

export function Form() {
  const session = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const { change } = useChangeGroup();
  const [group, setGroup] = useState<Groups | null>(null);

  const trigger = (group: Groups) => async () => {
    setLoading(true);
    setGroup(group);
    try {
      await change(group);
    } catch (error) {
      messageApi.error('An unexpected error occurred');
      console.error('Failed to change role:', error);
    } finally {
      setLoading(false);
    }
  };

  if (session.data?.user?.group !== GROUPS.confirmed) {
    return <Spinner />;
  }

  return (
    <main className={styles.main}>
      {contextHolder}
      <div className={styles.container}>
        <Title level={2}>Please, choose your role:</Title>
        <Button
          type='primary'
          onClick={trigger(GROUPS.client)}
          loading={loading && group === GROUPS.client}
          disabled={loading}
        >
          I&apos;m a client
        </Button>
        <Button onClick={trigger(GROUPS.vendor)} loading={loading && group === GROUPS.vendor} disabled={loading}>
          I&apos;m a vendor
        </Button>
      </div>
    </main>
  );
}
