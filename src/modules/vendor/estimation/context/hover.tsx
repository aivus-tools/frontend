import { createContext, useContext, ReactNode, useState, useMemo, useCallback } from 'react';

interface RowProps {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
  'data-hovered': boolean;
  'data-focused': boolean;
}

interface HoverContextType {
  hoveredRow: string | null;
  focusedRow: string | null;
  focusRow: (id: string | null) => void;
  getRowProps: (id: string) => RowProps;
}

const HoverContext = createContext<HoverContextType | undefined>(undefined);

interface FocusProviderProps {
  children: ReactNode;
}

export const HoverProvider = (props: FocusProviderProps) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [focusedRow, setFocusedRow] = useState<string | null>(null);

  const getRowProps = useCallback(
    (id: string): RowProps => ({
      onMouseEnter: () => setHoveredRow(id),
      onMouseLeave: () => setHoveredRow(null),
      onFocus: () => setFocusedRow(id),
      onBlur: () => setFocusedRow(null),
      'data-hovered': hoveredRow === id || focusedRow === id,
      'data-focused': focusedRow === id,
    }),
    [focusedRow, hoveredRow]
  );

  const focusRow = useCallback(
    (id: string | null) => {
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

  return <HoverContext.Provider value={value}>{props.children}</HoverContext.Provider>;
};

export const useRowHover = () => {
  const context = useContext(HoverContext);

  if (context === undefined) {
    throw new Error('useRowHover must be used within a HoverProvider');
  }

  return context;
};
