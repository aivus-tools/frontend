import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface SearchContextType {
  activeKey?: string;
  changeActiveKey: (key: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface FocusProviderProps {
  children: ReactNode;
  activeKey?: string;
}

export const SearchProvider = (props: FocusProviderProps) => {
  const [activeKey, setActiveKey] = useState(props.activeKey);

  useEffect(() => {
    setActiveKey(props.activeKey);
  }, [props.activeKey]);

  const changeActiveKey = (key: string) => {
    setActiveKey(key);
  };

  return <SearchContext.Provider value={{ activeKey, changeActiveKey }}>{props.children}</SearchContext.Provider>;
};

export const useSearchActiveKey = () => {
  const context = useContext(SearchContext);

  if (context === undefined) {
    throw new Error('useSearchActiveKey must be used within a SearchProvider');
  }

  return context;
};
