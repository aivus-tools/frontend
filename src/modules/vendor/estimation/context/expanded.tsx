import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface KeysContextType {
  keys: string[] | undefined;
  switchKey: (key: string) => void;
  addKey: (key: string) => void;
}

const HoverContext = createContext<KeysContextType | undefined>(undefined);

interface FocusProviderProps {
  children: ReactNode;
  initialKeys?: string[];
}

export const KeysProvider: React.FC<FocusProviderProps> = ({ children, initialKeys }) => {
  const [keys, setKeys] = useState<string[] | undefined>(initialKeys);

  // Update keys when initialKeys change (e.g., when data is loaded)
  useEffect(() => {
    if (initialKeys && initialKeys.length > 0) {
      setKeys(initialKeys);
    }
  }, [initialKeys]);

  const switchKey = (key: string) => {
    setKeys((prevKeys) => {
      if (prevKeys?.includes(key)) {
        return prevKeys.filter((prevKey) => prevKey !== key);
      }

      return [...(prevKeys || []), key];
    });
  };

  const addKey = (key: string) =>
    setKeys((prevKey) => {
      if (prevKey?.includes(key)) {
        return prevKey;
      }

      return [...(prevKey || []), key];
    });

  return <HoverContext.Provider value={{ keys, switchKey, addKey }}>{children}</HoverContext.Provider>;
};

export const useExpandedKeys = () => {
  const context = useContext(HoverContext);

  if (context === undefined) {
    throw new Error('useExpandedKeys must be used within a KeysProvider');
  }

  return context;
};
