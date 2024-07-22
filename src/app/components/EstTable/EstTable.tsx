'use client';
import { EstTableProps } from './EstTable.props';
import styles from './EstTable.module.css';
import cn from 'classnames';
import {
	Accordion,
	MultipleAccordion,
	EditableInput,
	LinkedPercent,
	Percent,
	THeadItem,
	SettingsModal,
	SurchargeModal,
} from '@/app/components';
import { tHead, TRow, tSection, tSubSection, SubSection } from '@/app/interfaces/app.interface';
import SettingsIcon from '@/app/icons/settings-icon.svg';
import RemoveIcon from '@/app/icons/remove-icon.svg';
import { useModal } from '@/app/context/ModalContext';
import { useState } from 'react';
import { formatPrice } from '@/app/helpers/helper';

export const EstTable = ({data, className, ...props }: EstTableProps) => {
	const { showModal } = useModal();

	const contentTHeads: tHead[] = [
		{
			text: 'Item',
			showIcon: true,
		},
		{
			text: 'Price, $',
			className: 'alignRight',
		},
		{
			text: 'Units',
			className: 'alignRight',
		},
		{
			text: 'Quantity',
			className: 'alignRight',
		},
		{
			text: 'Cost, $',
			className: 'alignRight',
		},
	]
	const asideTHeads: tHead[] = [
		{
			text: 'Surcharge',
			showIcon: true,
		},
		{
			text: 'Client’s price',
		},
		{
			text: 'Client’s cost',
			// className: 'alignRight',
		},
		{
			text: 'Market Range',
		},
	]

	const handleRemoveItem = (item: tSection , row: TRow) => {
		console.log(`remove: ${item} - ${row}`);
	}

	const handleOpenSettings = (item: tSection) => {
		console.log(`open settings: ${item}`);
		showModal('side', <SettingsModal /> );
	}

	const handleOpenSurcharge = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		showModal('centered', <SurchargeModal />);
	};

	const [openAccordions, setOpenAccordions] = useState<{ [index: number]: boolean }>({});
	const [openSubAccordions, setOpenSubAccordions] = useState<{ [sectionIndex: number]: { [subIndex: number]: boolean } }>({});
	const handleToggleSection = (index: number, isOpen: boolean) => {
		setOpenAccordions((prev) => ({
			...prev,
			[index]: isOpen,
		}));
		if (!isOpen) {
			setOpenSubAccordions((prev) => {
				const newState = { ...prev };
				delete newState[index];
				return newState;
			});
		}
	};

	const handleToggleSubSection = (sectionIndex: number, subIndex: number, isOpen: boolean) => {
		setOpenSubAccordions((prev) => ({
			...prev,
			[sectionIndex]: {
				...prev[sectionIndex],
				[subIndex]: isOpen,
			},
		}));
	};

	const renderRows = (item: tSection | tSubSection, rows: TRow[]) => {
		return rows.map((row: TRow, rowIndex: number) => (
			<div className={cn(styles.grid, styles.row)} key={rowIndex}>
				<div className={cn(styles.part, styles.contentGrid)}>
					<div className={cn(styles.icon, styles.settingsIcon)} onClick={() => handleOpenSettings(item)}>
						<SettingsIcon />
					</div>
					<div className={cn(styles.rowItem, styles.item)}>
						<EditableInput type="text" value={row.item} />
					</div>
					<div className={cn(styles.rowItem, styles.alignRight, styles.price)}>
						<EditableInput type="number" isPrice={true} value={row.price} />
					</div>
					<div className={cn(styles.rowItem, styles.alignRight, styles.units)}>
						<EditableInput type="text" value={row.units} />
					</div>
					<div className={cn(styles.rowItem, styles.alignRight, styles.quantity)}>
						<EditableInput type="number" value={row.quantity} />
					</div>
					<div className={cn(styles.rowItem, styles.alignRight, styles.cost)}>
						<EditableInput type="number" disabled={true} isPrice={true} value={row.cost} />
					</div>
					<div className={cn(styles.icon, styles.removeIcon)} onClick={() => handleRemoveItem(item, row)}>
						<RemoveIcon />
					</div>
				</div>
				<div className={cn(styles.part, styles.asideGrid)}>
					<div className={cn(styles.rowItem, styles.element)}></div>
					<div className={cn(styles.rowItem, styles.element)}>
						<EditableInput type="number" value={row.surcharge} />
					</div>
					<div className={cn(styles.rowItem, styles.element)}>
						<EditableInput type="number" isPrice={true} value={row.cprice} />
					</div>
					<div className={cn(styles.rowItem, styles.element)}>
						<EditableInput type="number" disabled={true} isPrice={true} value={row.ccost} />
					</div>
					<div className={cn(styles.rowItem, styles.element)}>
						<Percent mark="above" count={row.range} />
					</div>
				</div>
			</div>
		));
	};

	const getTotalCost = (item: tSection, field: 'cost' | 'ccost'): number => {
		let totalSum = 0;
		if ('subSections' in item && item.subSections) {
			totalSum = item.subSections.reduce((sunSum, sub) => {
				return sunSum + sub.rows.reduce((partialSum, row) => partialSum + row[field], 0);
			}, 0)
		} else {
			totalSum = item.rows ? item.rows.reduce((partialSum, row) => partialSum + row[field], 0) : 0;
		}

		return totalSum
	}

	const renderTotalSum = (item: tSection) => {
		const totalSum = getTotalCost(item, 'cost');
		const totalClientSum = getTotalCost(item, 'ccost');

		return (
			<div className={cn(styles.sectionSum, styles.grid)}>
				<div className={cn(styles.accsum, styles.contentTotalGrid)}>
					<div></div>
					<div className={cn(styles.sectionTitle)}></div>
					<div className={cn(styles.totalTitle)}>
						{ item && item.title } total:
					</div>
					<div className={cn(styles.totalSum)}>
						$ {formatPrice(totalSum)}
					</div>
				</div>
				<div className={cn(styles.accsum, styles.asideTotalGrid)}>
					<div></div>
					<div></div>
					<div className={cn(styles.totalSum)}>
						$ {formatPrice(totalClientSum)}
					</div>
					<div>
						<Percent mark="average" count={8}/>
					</div>
				</div>
			</div>
		);
	}

	const renderSubTotalSum = (sub: tSubSection) => {
		const totalSum = getTotalCost(sub, 'cost');
		const totalClientSum = getTotalCost(sub, 'ccost');

		return (
			<div className={cn(styles.subSectionSum, styles.grid)}>
				<div className={cn(styles.accsubsum, styles.contentTotalGrid)}>
					<div></div>
					<div className={cn(styles.sectionTitle)}></div>
					<div className={cn(styles.subtotalTitle)}>
						Subtotal of { sub.title }:
					</div>
					<div className={cn(styles.totalSum, styles.subtotalSum)}>
						$ {formatPrice(totalSum)}
					</div>
				</div>
				<div className={cn(styles.accsubsum, styles.asideTotalGrid)}>
					<div></div>
					<div></div>
					<div className={cn(styles.totalSum, styles.subtotalSum)}>
						$ {formatPrice(totalClientSum)}
					</div>
					<div>
						<Percent mark="average" count={8}/>
					</div>
				</div>
			</div>
		)
	}

	const renderSimpleSection = (item: tSection, index: number) => {
		const isAccordionOpen = openAccordions[index] || false;
		const totalSum = getTotalCost(item, 'cost');
		const totalClientSum = getTotalCost(item, 'ccost');

		return (
			<div className={cn(styles.section, {
				[styles.opened]: isAccordionOpen,
			})} key={index}>
				<Accordion title={
					<div className={cn(styles.grid)}>
						<div className={cn(styles.accpart, styles.contentTotalGrid)}>
							<div></div>
							<div className={cn(styles.sectionTitle)}>{item.title}</div>
							<div></div>
							<div className={cn(styles.sectionTitleSum, styles.totalSum)}>$ {formatPrice(totalSum)}</div>
						</div>
						<div className={cn(styles.accpart, styles.asideTotalGrid)}>
							<div></div>
							<div>
								<LinkedPercent className={cn(styles.sectionTitleSurcharge)} highlight={true} count={10} disabled={true} onClick={handleOpenSurcharge}/>
							</div>
							<div className={cn(styles.sectionTitleSum, styles.totalSum)}>$ {formatPrice(totalClientSum)}</div>
							<div className={cn(styles.sectionTitleSum)}>
								<Percent mark="average" count={8}/>
							</div>
						</div>
					</div>
				}
					onAccToggle={(isOpen: boolean) => handleToggleSection(index, isOpen)}
				>
					{ item.rows && item.rows.length > 0 && renderRows(item, item.rows) }
				</Accordion>

				{ renderTotalSum(item) }
			</div>
		);
	}

	const renderFullSection = (item: tSection, index: number) => {
		const isAccordionOpen = openAccordions[index] || false;
		const openSubSections = openSubAccordions[index] || {};

		const totalSum = getTotalCost(item, 'cost');
		const totalClientSum = getTotalCost(item, 'ccost');

		return (
			<div className={cn(styles.section, { [styles.opened]: isAccordionOpen })} key={index}>
				<MultipleAccordion
					title={
						<div className={cn(styles.grid)}>
							<div className={cn(styles.accpart, styles.contentTotalGrid)}>
								<div></div>
								<div className={cn(styles.sectionTitle)}>{item.title}</div>
								<div></div>
								<div className={cn(styles.sectionTitleSum, styles.totalSum)}>$ {formatPrice(totalSum)}</div>
							</div>
							<div className={cn(styles.accpart, styles.asideTotalGrid)}>
								<div></div>
								<div>
									<LinkedPercent className={cn(styles.sectionTitleSurcharge)} highlight={true} count={10}
																		disabled={true} onClick={handleOpenSurcharge}/>
								</div>
								<div className={cn(styles.sectionTitleSum, styles.totalSum)}>$ {formatPrice(totalClientSum)}</div>
								<div className={cn(styles.sectionTitleSum)}>
									<Percent mark="average" count={8}/>
								</div>
							</div>
						</div>
					}
					subSections={(item.subSections || []).map((sub, subIndex) => ({
						subTitle: (
							<div className={cn(styles.subsection, {
								[styles.opened] : openSubSections[subIndex] || false
							})} key={subIndex}>
								<div className={cn(styles.grid)}>
									<div className={cn(styles.accsub, styles.contentTotalGrid)}>
										<div></div>
										<div>{sub.title}</div>
										<div></div>
										<div className={cn(styles.totalSum, styles.subtotalSum)}>$ {formatPrice(getTotalCost(sub, 'cost'))}</div>
									</div>
									<div className={cn(styles.accsub, styles.asideTotalGrid)}>
										<div></div>
										<div></div>
										<div className={cn(styles.totalSum, styles.subtotalSum)}>
											$ {formatPrice(getTotalCost(sub, 'ccost'))}
										</div>
										<div>
											<Percent mark="average" count={8}/>
										</div>
									</div>
								</div>
							</div>
						),
						subContent: (
							<>
								{sub.rows && sub.rows.length > 0 && renderRows(sub, sub.rows)}
								{renderSubTotalSum(sub)}
							</>
						),
						isOpen: openSubSections[subIndex] || false,
						onToggle: (isOpen: boolean) => handleToggleSubSection(index, subIndex, isOpen),
					}))}
					isOpen={isAccordionOpen}
					onToggle={(isOpen: boolean) => handleToggleSection(index, isOpen)}
				/>
				{ renderTotalSum(item) }
			</div>
		);
	};

	return (
		<div className={cn(styles.est)} {...props}>
			<div className={styles.grid}>
				<div className={cn(styles.hcontent, styles.contentGrid)}>
					<div className={cn(styles.icon)}>
						<SettingsIcon/>
					</div>
					{contentTHeads.map((item: tHead, index: number) => (
						<THeadItem
							key={index}
							className={cn({
								[styles.alignRight]: item.className && item.className === 'alignRight',
							})}
							text={item.text}
						/>
					))}
					<div></div>
				</div>
				<div className={cn(styles.haside, styles.asideGrid)}>
					<div className={cn(styles.icon)}>
						<SettingsIcon/>
					</div>
					{asideTHeads.map((item: tHead, index: number) => (
						<THeadItem
							key={index}
							className={cn({
								[styles.alignRight]: item.className && item.className === 'alignRight',
							})}
							text={item.text}
						/>
					))}
				</div>
			</div>

			{data.map((item: tSection, index: number) => (
				<div key={index}>
					{'subSections' in item && item.subSections ? (
						renderFullSection(item, index)
					) : (
						'rows' in item && item.rows && renderSimpleSection(item, index)
					)}
				</div>
			))}

		</div>
	);
}
