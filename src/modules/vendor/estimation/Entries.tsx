'use client';

import type { HeaderKey, OfferData } from './types';
import { CLIENTS_HEADERS, HEADERS } from './constants';
import { useRowHover } from './context/hover';
import SettingsIcon from '@/icons/settings-icon.svg';
import DeleteIcon from '@/icons/delete.svg';
import { EstimationItem } from './styled';
import { RowLine } from './RowLine';
import { Flex, InputNumber, Select } from 'antd';
import { EntrieInput } from './EntrieInput';
import { useAppDispatch } from '@/lib/hooks';
import { changeOfferRow, removeOfferRow } from '@/store/slices/offer';
import { useDrawerOffer } from './context/drawer';

export function Entries({ data = [] }: { data?: OfferData[] }) {
	const dispatch = useAppDispatch();
	const handleRemove = (id: number) => {
		dispatch(removeOfferRow(id));
	};
	const handleChange = (id: number, key: keyof OfferData) => (data: number | null) => {
		dispatch(changeOfferRow({ id, [key]: data ?? 0 }));
	};
	const { getRowProps, hoveredRow, focusedRow } = useRowHover();
	const checkActive = (id: number) => hoveredRow === id || focusedRow === id;
	const { onOpen } = useDrawerOffer();

	return (
		<>
			{data.map((it) => (
				<>
					{HEADERS.map(({ key, itemStyle, itemProps }) => {
						if (key === 'link') {
							return null;
						}

						if (key === 'settings') {
							return (
								<EstimationItem key={`settings-${key}`} {...getRowProps(it.id)} style={{ justifyContent: 'center' }}>
									{checkActive(it.id) && (
										<Flex align='center' justify='center' style={{ height: '100%' }}>
											<SettingsIcon style={{ cursor: 'pointer', color: 'var(--gray)' }} onClick={() => onOpen(it)} />
										</Flex>
									)}
								</EstimationItem>
							);
						}

						if (key === 'item') {
							const rowProps = getRowProps(it.id);
							return (
								<EstimationItem key={`item-${key}`} style={itemStyle} {...rowProps}>
									<EntrieInput value={it} variant={checkActive(it.id) ? 'outlined' : 'borderless'} />
								</EstimationItem>
							);
						}

						if (key === 'actions') {
							return (
								<EstimationItem key={`actions-${key}`} {...getRowProps(it.id)} style={{ justifyContent: 'center' }}>
									{checkActive(it.id) && (
										<Flex align='center' justify='center' style={{ height: '100%' }}>
											<DeleteIcon style={{ cursor: 'pointer' }} onClick={() => handleRemove(it.id)} />
										</Flex>
									)}
								</EstimationItem>
							);
						}

						if (key === 'units') {
							return (
								<EstimationItem key={`actions-${key}`} {...getRowProps(it.id)} style={{ justifyContent: 'center' }}>
									<Select
										style={{ width: '100%' }}
										placeholder='Select unit'
										variant={checkActive(it.id) ? 'outlined' : 'borderless'}
										value={it.units as string}
										onChange={handleChange(it.id, 'units')}
										options={[
											{ value: 'seconds', label: 'Seconds' },
											{ value: 'minutes', label: 'Minutes' },
											{ value: 'hours', label: 'Hours' },
											{ value: 'days', label: 'Days' },
										]}
									/>
								</EstimationItem>
							);
						}

						return (
							<EstimationItem key={`${it.id}-${key}`} style={itemStyle} {...getRowProps(it.id)}>
								<InputNumber
									variant={checkActive(it.id) ? 'outlined' : 'borderless'}
									onChange={handleChange(it.id, key)}
									value={it[key] as number}
									controls={false}
									{...itemProps}
								/>
							</EstimationItem>
						);
					})}
					<div />
					{CLIENTS_HEADERS.map(({ key, itemStyle, itemProps }) => {
						if (!isClientKey(key)) {
							return null;
						}
						if (key === 'link') {
							return <EstimationItem key={key} {...getRowProps(it.id)} />;
						}

						if (key === 'marketRange') {
							return <EstimationItem key={key} {...getRowProps(it.id)} />;
						}

						return (
							<EstimationItem key={`${key}-${it.id}`} style={itemStyle} {...getRowProps(it.id)}>
								<InputNumber
									variant={checkActive(it.id) ? 'outlined' : 'borderless'}
									onChange={handleChange(it.id, key)}
									value={it[key] as number}
									controls={false}
									{...itemProps}
								/>
							</EstimationItem>
						);
					})}
					<RowLine />
				</>
			))}
		</>
	);
}

const isClientKey = (key: HeaderKey): key is 'link' | 'surcharge' | 'clientPrice' | 'clientCost' | 'marketRange' => {
	return ['link', 'surcharge', 'clientPrice', 'clientCost', 'marketRange'].includes(key);
};
