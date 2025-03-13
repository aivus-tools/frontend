import React, { useCallback, createContext, useContext, ReactNode, useState } from 'react';
import { GuidanceDictionary } from './guidance-dictionary';

type GuidanceDictionaryType = typeof GuidanceDictionary;
type GuidanceDictionaryKeys = keyof GuidanceDictionaryType;

interface GuidanceContextType {
	handleFocus: (name: GuidanceDictionaryKeys) => () => void;
	focusedField: { label: string; description: string | ReactNode } | null;
}

const GuidanceContext = createContext<GuidanceContextType | undefined>(undefined);

interface FocusProviderProps {
	children: ReactNode;
}

export const GuidanceProvider: React.FC<FocusProviderProps> = ({ children }) => {
	const [focusedField, setFocusedField] = useState<GuidanceDictionaryKeys | null>(null);

	const handleFocus = useCallback(
		(name: GuidanceDictionaryKeys) => () => {
			setFocusedField(name);
		},
		[]
	);

	return (
		<GuidanceContext.Provider
			value={{ handleFocus, focusedField: focusedField ? GuidanceDictionary[focusedField] : null }}
		>
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
