import React, { createContext, useContext, ReactNode, useState } from 'react';

interface KeysContextType {
	keys: (string | number)[] | undefined;
	setKey: (key: string | number) => void;
}

const HoverContext = createContext<KeysContextType | undefined>(undefined);

interface FocusProviderProps {
	children: ReactNode;
}

export const KeysProvider: React.FC<FocusProviderProps> = ({ children }) => {
	const [keys, setKeys] = useState<(string | number)[]>();

	const setKey = (key: string | number) => {
		setKeys((prevKeys) => {
			if (prevKeys?.includes(key)) {
				return prevKeys.filter((prevKey) => prevKey !== key);
			}

			return [...(prevKeys || []), key];
		});
	};

	return <HoverContext.Provider value={{ keys, setKey }}>{children}</HoverContext.Provider>;
};

export const useExpandedKeys = () => {
	const context = useContext(HoverContext);

	if (context === undefined) {
		throw new Error('useExpandedKeys must be used within a KeysProvider');
	}

	return context;
};
