'use client';

import { UnforeseenExpenses } from './UnforeseenExpenses';
import { GrandTotal } from './GrandTotal';
import { CostPerVideo } from './CostPerVideo';
import { SubtotalAllSections } from './SubtotalAllSections';

export const Summary = () => {
	return (
		<>
			<SubtotalAllSections />
			<UnforeseenExpenses />
			<GrandTotal />
			<CostPerVideo />
		</>
	);
};
