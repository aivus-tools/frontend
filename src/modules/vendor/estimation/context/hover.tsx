import React, { createContext, useContext, ReactNode, useState, useMemo, useCallback } from 'react';

interface HoverContextType {
  hoveredRow: number | null;
  focusedRow: number | null;
  focusRow: (id: number | null) => void;
  getRowProps: (id: number) => {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    hovered: boolean;
    focused: boolean;
  };
}

const HoverContext = createContext<HoverContextType | undefined>(undefined);

interface FocusProviderProps {
  children: ReactNode;
}

export const HoverProvider: React.FC<FocusProviderProps> = ({ children }) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [focusedRow, setFocusedRow] = useState<number | null>(null);

  const getRowProps = useCallback(
    (id: number) => ({
      onMouseEnter: () => setHoveredRow(id),
      onMouseLeave: () => setHoveredRow(null),
      onFocus: () => setFocusedRow(id),
      onBlur: () => setFocusedRow(null),
      hovered: hoveredRow === id || focusedRow === id,
      focused: focusedRow === id,
    }),
    [focusedRow, hoveredRow]
  );

  const focusRow = useCallback(
    (id: number | null) => {
      setFocusedRow(id);
    },
    [setFocusedRow]
  );

  const value = useMemo(
    () => ({
      hoveredRow,
      focusedRow,
      focusRow,
      getRowProps,
    }),
    [hoveredRow, focusedRow, focusRow, getRowProps]
  );

  return <HoverContext.Provider value={value}>{children}</HoverContext.Provider>;
};

export const useRowHover = () => {
  const context = useContext(HoverContext);

  if (context === undefined) {
    throw new Error('useRowHover must be used within a HoverProvider');
  }

  return context;
};
