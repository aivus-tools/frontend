import React, { createContext, useContext, ReactNode } from 'react';

type HandleSelectContext = () => void;

const handleSelectContext = createContext<HandleSelectContext>(() => {});

interface FocusProviderProps {
	children: ReactNode;
	handleSelect: HandleSelectContext;
}

export const HandleSelectProvider: React.FC<FocusProviderProps> = ({ children, handleSelect }) => {
	return <handleSelectContext.Provider value={handleSelect}>{children}</handleSelectContext.Provider>;
};

export const useHandleSelect = () => {
	const context = useContext(handleSelectContext);

	if (context === undefined) {
		throw new Error('useHandleSelect must be used within a HandleSelectProvider');
	}

	return context;
};
