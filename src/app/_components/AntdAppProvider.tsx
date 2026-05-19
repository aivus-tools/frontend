'use client';

import React from 'react';
import { App } from 'antd';

interface AntdAppProviderProps {
  children: React.ReactNode;
}

export const AntdAppProvider = (props: AntdAppProviderProps) => {
  return <App>{props.children}</App>;
};
