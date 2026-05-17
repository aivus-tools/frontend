import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

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

export const KeysProvider = (props: FocusProviderProps) => {
  const [keys, setKeys] = useState<string[] | undefined>(props.initialKeys);

  // Update keys when initialKeys change (e.g., when data is loaded)
  useEffect(() => {
    if (props.initialKeys && props.initialKeys.length > 0) {
      setKeys(props.initialKeys);
    }
  }, [props.initialKeys]);

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

  return <HoverContext.Provider value={{ keys, switchKey, addKey }}>{props.children}</HoverContext.Provider>;
};

export const useExpandedKeys = () => {
  const context = useContext(HoverContext);

  if (context === undefined) {
    throw new Error('useExpandedKeys must be used within a KeysProvider');
  }

  return context;
};
