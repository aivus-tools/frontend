'use client';
import React, { useCallback, createContext, useContext, useState, PropsWithChildren, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthType } from '@/types/user';

const AuthTypeContext = createContext<{ authType: AuthType | null; setAuthType: (authType: AuthType) => void }>({
  authType: null,
  setAuthType: () => {},
});

export const AuthTypeProvider = ({ children }: PropsWithChildren) => {
  const [authType, setAuthType] = useState<AuthType | null>(null);
  const params = useSearchParams();
  const type = params.get('type') as AuthType;
  const setAuthTypeCallback = useCallback((authType: AuthType) => setAuthType(authType), []);
  useEffect(() => {
    if (authType === null) {
      setAuthType(type);
    }
  }, [authType, type]);

  return (
    <AuthTypeContext.Provider value={{ authType, setAuthType: setAuthTypeCallback }}>
      {children}
    </AuthTypeContext.Provider>
  );
};

export const useAuthType = () => {
  const context = useContext(AuthTypeContext);

  if (context === undefined) {
    throw new Error('useAuthType must be used within a GuidanceProvider');
  }

  return context;
};
