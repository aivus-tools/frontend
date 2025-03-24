import React, { createContext, useContext, ReactNode, useState } from 'react';

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

	const getRowProps = (id: number) => ({
		onMouseEnter: () => setHoveredRow(id),
		onMouseLeave: () => setHoveredRow(null),
		hovered: hoveredRow === id || focusedRow === id,
		focused: focusedRow === id,
	});

	const focusRow = (id: number | null) => {
		setFocusedRow(id);
	};

	return (
		<HoverContext.Provider value={{ getRowProps, focusRow, hoveredRow, focusedRow }}>{children}</HoverContext.Provider>
	);
};

export const useRowHover = () => {
	const context = useContext(HoverContext);

	if (context === undefined) {
		throw new Error('useRowHover must be used within a HoverProvider');
	}

	return context;
};
