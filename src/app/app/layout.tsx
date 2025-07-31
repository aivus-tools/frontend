import { auth, signOut } from '@/auth/auth';
import { ReduxStore } from '@/context/ReduxProvider';
import { GROUPS } from '@/constants/constants';
import React from 'react';
import { Sidebar } from '@/components/Sidebar/Sidebar';

export default async function Layout({
  vendor,
  client,
  unknown,
}: {
  vendor: React.ReactNode;
  client: React.ReactNode;
  unknown: React.ReactNode;
}) {
  const session = await auth();
  const { group } = session?.user ?? {};

  const getComponent = () => {
    switch (group) {
      case GROUPS.vendor:
        return vendor;
      case GROUPS.client:
        return client;
      case GROUPS.confirmed:
      case GROUPS.unconfirmed:
        return unknown;
      default: {
        signOut();
        return null;
      }
    }
  };

  return (
    <ReduxStore>
      {getComponent()}
      <Sidebar />
    </ReduxStore>
  );
}
