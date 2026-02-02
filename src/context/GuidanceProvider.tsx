import React, { useCallback, createContext, useContext, ReactNode, useState } from 'react';
import { GuidanceDictionary } from './guidance-dictionary';

type GuidanceDictionaryType = typeof GuidanceDictionary;
type GuidanceDictionaryKeys = keyof GuidanceDictionaryType;

interface GuidanceItem {
  label: string;
  description: string | ReactNode;
}

interface GuidanceContextType {
  handleFocus: (name: GuidanceDictionaryKeys) => () => void;
  setCustomGuidance: (guidance: GuidanceItem | null) => void;
  focusedField: GuidanceItem | null;
}

const GuidanceContext = createContext<GuidanceContextType | undefined>(undefined);

interface FocusProviderProps {
  children: ReactNode;
}

export const GuidanceProvider: React.FC<FocusProviderProps> = ({ children }) => {
  const [focusedField, setFocusedField] = useState<GuidanceDictionaryKeys | null>(null);
  const [customGuidance, setCustomGuidance] = useState<GuidanceItem | null>(null);

  const handleFocus = useCallback(
    (name: GuidanceDictionaryKeys) => () => {
      setCustomGuidance(null);
      setFocusedField(name);
    },
    []
  );

  const currentGuidance = customGuidance || (focusedField ? GuidanceDictionary[focusedField] : null);

  return (
    <GuidanceContext.Provider value={{ handleFocus, setCustomGuidance, focusedField: currentGuidance }}>
      {children}
    </GuidanceContext.Provider>
  );
};

export const useGuidance = () => {
  const context = useContext(GuidanceContext);

  if (context === undefined) {
    throw new Error('useGuidance must be used within a GuidanceProvider');
  }

  return context;
};
