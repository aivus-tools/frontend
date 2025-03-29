'use client';

import type { OfferData } from './types';
import { CLIENTS_HEADERS, HEADERS } from './constants';
import { useRowHover } from './context/hover';
import SettingsIcon from '@/icons/settings-icon.svg';
import DeleteIcon from '@/icons/delete.svg';
import { EstimationItem } from './styled';
import { RowLine } from './RowLine';
import { Flex } from 'antd';
import { EntrieInput } from './EntrieInput';
import { useAppDispatch } from '@/lib/hooks';
import { removeOfferRow } from '@/store/slices/offer';

export function Entries({ data = [] }: { data?: OfferData[] }) {
	const dispatch = useAppDispatch();
	const handleRemove = (id: number) => {
		dispatch(removeOfferRow(id));
	};
	const { getRowProps, hoveredRow, focusedRow } = useRowHover();
	const checkActive = (id: number) => hoveredRow === id || focusedRow === id;

	return (
		<>
			{data.map((it) => (
				<>
					{HEADERS.map(({ key, itemStyle }) => {
						if (key === 'link') {
							return null;
						}

						if (key === 'settings') {
							return (
								<EstimationItem key={`settings-${key}`} {...getRowProps(it.id)} style={{ justifyContent: 'center' }}>
									{checkActive(it.id) && (
										<Flex align='center' justify='center' style={{ height: '100%' }}>
											<SettingsIcon
												style={{ cursor: 'grab', color: 'var(--gray)' }}
												onClick={() => console.log('onDrag', it.id)}
											/>
										</Flex>
									)}
								</EstimationItem>
							);
						}

						if (key === 'item') {
							const rowProps = getRowProps(it.id);
							return (
								<EstimationItem key={`item-${key}`} style={itemStyle} {...rowProps}>
									<EntrieInput value={it} />
									{/* {rowProps.focused ? <EntrieInput value={it} /> : it[key]} */}
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

						return (
							<EstimationItem key={`${key}-${it[key]}`} style={itemStyle} {...getRowProps(it.id)}>
								{it[key]}
							</EstimationItem>
						);
					})}
					<div />
					{CLIENTS_HEADERS.map(({ key, itemStyle }) => {
						if (key === 'settings' || key === 'actions') {
							return null;
						}
						if (key === 'link') {
							return <EstimationItem key={key} {...getRowProps(it.id)} />;
						}

						return (
							<EstimationItem key={`${key}-${it[key]}`} style={itemStyle} {...getRowProps(it.id)}>
								{it[key]}
							</EstimationItem>
						);
					})}
					<RowLine />
				</>
			))}
		</>
	);
}
