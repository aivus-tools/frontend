import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface SearchContextType {
	activeKey?: string;
	changeActiveKey: (key: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface FocusProviderProps {
	children: ReactNode;
	activeKey?: string;
}

export const SearchProvider: React.FC<FocusProviderProps> = ({ children, activeKey: initialActiveKey }) => {
	const [activeKey, setActiveKey] = useState(initialActiveKey);

	useEffect(() => {
		setActiveKey(initialActiveKey);
	}, [initialActiveKey]);

	const changeActiveKey = (key: string) => {
		setActiveKey(key);
	};

	return <SearchContext.Provider value={{ activeKey, changeActiveKey }}>{children}</SearchContext.Provider>;
};

export const useSearchActiveKey = () => {
	const context = useContext(SearchContext);

	if (context === undefined) {
		throw new Error('useSearchActiveKey must be used within a SearchProvider');
	}

	return context;
};
