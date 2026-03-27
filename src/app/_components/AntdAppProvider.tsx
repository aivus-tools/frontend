'use client';

import React from 'react';
import { App } from 'antd';

export const AntdAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <App>{children}</App>;
};
