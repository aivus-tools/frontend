import { PropsWithChildren, useCallback, useEffect } from 'react';
import { useSearchActiveKey } from './SearchContext';
import { MenuItem } from '../hooks/useSearchLibrary';
import { OfferData } from '../types';

const generateNumeralId = () => Math.floor(Math.random() * 1000000);

interface Props {
	onSelect: (item: OfferData) => void;
	isTyping: boolean;
	items: MenuItem[];
}

export const ValueSetter = ({ isTyping, items, children, onSelect }: PropsWithChildren<Props>) => {
	const { activeKey, changeActiveKey } = useSearchActiveKey();

	const handleSelect = useCallback(() => {
		const item = items.find((it) => it.key === activeKey);

		if (item) {
			const [categoryId, entryId] = item.key.split('-');
			const newData: OfferData = {
				id: generateNumeralId(),
				entryId: +entryId,
				categoryId: +categoryId,
				item: item.name,
				price: 0,
				units: '',
				quantity: 0,
				cost: 0,
				surcharge: '',
				clientPrice: 0,
				clientCost: 0,
				marketRange: '',
			};
			onSelect(newData);
		}
	}, [activeKey, items, onSelect]);

	const handleEnter = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === 'Enter') {
				handleSelect();
			}
			if (e.key === 'ArrowDown') {
				const index = items.findIndex((it) => it.key === activeKey);
				if (index < items.length - 1) {
					changeActiveKey(items[index + 1].key);
				}
			}
			if (e.key === 'ArrowUp') {
				const index = items.findIndex((it) => it.key === activeKey);
				if (index > 0) {
					changeActiveKey(items[index - 1].key);
				}
			}
		},
		[activeKey, changeActiveKey, handleSelect, items]
	);

	useEffect(() => {
		if (isTyping) {
			window.addEventListener('keydown', handleEnter);
			return () => {
				window.removeEventListener('keydown', handleEnter);
			};
		}
	}, [isTyping, handleEnter]);

	return <>{children}</>;
};
