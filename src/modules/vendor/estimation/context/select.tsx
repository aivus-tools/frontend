import { createContext, useContext, ReactNode } from 'react';

type HandleSelectContext = () => void;

const handleSelectContext = createContext<HandleSelectContext>(() => {});

interface FocusProviderProps {
  children: ReactNode;
  handleSelect: HandleSelectContext;
}

export const HandleSelectProvider = (props: FocusProviderProps) => {
  return <handleSelectContext.Provider value={props.handleSelect}>{props.children}</handleSelectContext.Provider>;
};

export const useHandleSelect = () => {
  const context = useContext(handleSelectContext);

  if (context === undefined) {
    throw new Error('useHandleSelect must be used within a HandleSelectProvider');
  }

  return context;
};
