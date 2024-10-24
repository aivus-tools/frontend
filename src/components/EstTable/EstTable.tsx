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
	Sum,
	Select,
} from '@/components';
import { THead, TRow, TSection, TSubSection } from '@/interfaces/app.interface';
import SettingsIcon from '@/icons/settings-icon.svg';
import RemoveIcon from '@/icons/remove-icon.svg';
import AddIcon from '@/icons/add-icon.svg';
import OpenedEyeIcon from '@/icons/opened-eye-icon.svg';
import { useModal } from '@/context/ModalContext';
import { useState } from 'react';
import { formatPrice, getCost } from '@/helpers/helper';
import { contentTHeads, asideTHeads, unitsOptions } from '@/handbook/handbook';
import { useSelector } from 'react-redux';
import { selectTotalCosts, selectExpensesCost, selectGrandTotalCost } from '@/store/selectors';

export const EstTable = ({ data, onRemoveItem, onAddItem, onAddSection, onChangeInput, ...props }: EstTableProps) => {
	const { showModal } = useModal();

	const totalCost = useSelector(selectTotalCosts);
	const expensesCost = useSelector(selectExpensesCost);
	const grandTotalCost = useSelector(selectGrandTotalCost);

	const handleRemoveItem = (row: TRow) => {
		onRemoveItem(row);
	};

	const handleAddItem = (sectionId: number, isSubSection: boolean = false) => {
		onAddItem(sectionId, isSubSection);
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleAddSection = () => {
		onAddSection();
	};

	const handleAddOption = (newOptions: string) => {
		console.log(`add option: ${newOptions}`);
	};

	const handleInputChange = (sectionId: number, rowId: number, field: string, value: string | number) => {
		onChangeInput(sectionId, rowId, field, value);
	};

	const handleOpenSettings = (item: TSection) => {
		console.log(`open settings: ${item}`);
		showModal('side', <SettingsModal />);
	};

	const handleOpenSurcharge = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		showModal('centered', <SurchargeModal />);
	};

	const [openAccordions, setOpenAccordions] = useState<{ [index: number]: boolean }>({});
	const [openSubAccordions, setOpenSubAccordions] = useState<{
		[sectionIndex: number]: { [subIndex: number]: boolean };
	}>({});
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

	const renderHeader = () => {
		return (
			<div className={styles.grid}>
				<div className={cn(styles.hcontent, styles.contentGrid)}>
					<div className={cn(styles.icon)}>
						<SettingsIcon />
					</div>
					{contentTHeads.map((item: THead, index: number) => (
						<THeadItem
							key={`chead_${index}`}
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
						<SettingsIcon />
					</div>
					{asideTHeads.map((item: THead, index: number) => (
						<THeadItem
							key={`ahead_${index}`}
							className={cn({
								[styles.alignRight]: item.className && item.className === 'alignRight',
							})}
							text={item.text}
						/>
					))}
				</div>
			</div>
		);
	};

	const renderRows = (item: TSection | TSubSection, rows: TRow[]) => {
		return rows.map((row: TRow) => (
			<div className={cn(styles.grid, styles.row)} key={`row_${row.id}`}>
				<div className={cn(styles.part, styles.contentGrid)}>
					<div className={cn(styles.icon, styles.settingsIcon)} onClick={() => handleOpenSettings(item)}>
						<SettingsIcon />
					</div>
					<div className={cn(styles.rowItem, styles.item)}>
						<EditableInput
							type='text'
							value={row.item}
							onChange={(e) => handleInputChange(item.id, row.id, 'item', e.target.value)}
						/>
					</div>
					<div className={cn(styles.rowItem, styles.price)}>
						<EditableInput
							type='number'
							isPrice={true}
							value={row.price}
							onChange={(e) => handleInputChange(item.id, row.id, 'price', e.target.value)}
						/>
					</div>
					<div className={cn(styles.rowItem, styles.units)}>
						{/*{ row.units }*/}
						<Select
							options={unitsOptions}
							value={row.units}
							onAdd={(newUnit) => {
								handleAddOption(newUnit);
								handleInputChange(item.id, row.id, 'units', newUnit);
							}}
							onChange={(selectedUnit) => handleInputChange(item.id, row.id, 'units', selectedUnit)}
						/>
					</div>
					<div className={cn(styles.rowItem, styles.quantity)}>
						<EditableInput
							type='number'
							value={row.quantity}
							onChange={(e) => handleInputChange(item.id, row.id, 'quantity', e.target.value)}
						/>
					</div>
					<div className={cn(styles.rowItem, styles.cost, styles.alignRight)}>
						<div>{formatPrice(getCost(row.price, row.quantity))}</div>
					</div>
					<div className={cn(styles.icon, styles.removeIcon)} onClick={() => handleRemoveItem(row)}>
						<RemoveIcon />
					</div>
				</div>
				<div className={cn(styles.part, styles.asideGrid)}>
					<div className={cn(styles.rowItem, styles.element)}></div>
					<div className={cn(styles.rowItem, styles.element)}>
						<EditableInput
							type='number'
							value={row.surcharge}
							onChange={(e) => handleInputChange(item.id, row.id, 'surcharge', e.target.value)}
						/>
					</div>
					<div className={cn(styles.rowItem, styles.element)}>
						<EditableInput
							type='number'
							isPrice={true}
							value={row.cprice}
							onChange={(e) => handleInputChange(item.id, row.id, 'cprice', e.target.value)}
						/>
					</div>
					<div className={cn(styles.rowItem, styles.cost, styles.alignRight)}>
						<div>{formatPrice(getCost(row.cprice, row.quantity))}</div>
					</div>
					<div className={cn(styles.rowItem, styles.element)}>
						<Percent mark='above' count={row.range} />
					</div>
				</div>
			</div>
		));
	};

	const getTotalCost = (item: TSection, field: 'price' | 'cprice'): number => {
		let totalCost = 0;
		if ('subSections' in item && item.subSections) {
			totalCost = item.subSections.reduce((sunSum, sub) => {
				return (
					sunSum +
					(sub.isHidden ? 0 : sub.rows.reduce((partialSum, row) => partialSum + getCost(row[field], row.quantity), 0))
				);
			}, 0);
		} else {
			totalCost = item.rows
				? item.rows.reduce((partialSum, row) => partialSum + getCost(row[field], row.quantity), 0)
				: 0;
		}

		return totalCost;
	};

	const renderSumRow = (item: TSection | TSubSection, type: 'section' | 'subsection' = 'section') => {
		const totalSum = getTotalCost(item, 'price');
		const totalClientSum = getTotalCost(item, 'cprice');

		const isSubSection: boolean = type === 'subsection' ? true : false;
		// let isHasSubSection: boolean = 'subSections' in item;

		return (
			<div
				className={cn(styles.grid, {
					[styles.sectionSum]: !isSubSection,
				})}
			>
				<div
					className={cn(styles.contentTotalGrid, {
						[styles.accsum]: !isSubSection,
						[styles.accsubsum]: isSubSection,
					})}
				>
					<div className={cn(styles.icon)}>
						<AddIcon />
					</div>
					<div
						className={cn(styles.addItem)}
						onClick={() => {
							handleAddItem(item.id, isSubSection);
						}}
					>
						add item
						{/*/ <span onClick={handleAddSection}>section</span>*/}
					</div>
					<div
						className={cn({
							[styles.totalTitle]: !isSubSection,
							[styles.subtotalTitle]: isSubSection,
						})}
					>
						{!isSubSection && item && `${item.title} total:`}
						{isSubSection && item && `Subtotal of ${item.title}`}
					</div>
					<div className={cn(styles.totalSum)}>
						<Sum count={totalSum} size={isSubSection ? 's' : 'm'} type='blue' />
					</div>
				</div>
				<div
					className={cn(styles.asideTotalGrid, {
						[styles.accsum]: !isSubSection,
						[styles.accsubsum]: isSubSection,
					})}
				>
					<div></div>
					<div></div>
					<div className={cn(styles.totalSum)}>
						<Sum count={totalClientSum} size={isSubSection ? 's' : 'm'} type='blue' />
					</div>
					<div>
						<Percent mark='average' count={8} />
					</div>
				</div>
			</div>
		);
	};

	const renderSimpleSection = (item: TSection, index: number) => {
		if (item.isHidden) return null; // Skip rendering if the section is hidden

		const isAccordionOpen = openAccordions[index] || false;
		const totalSum = getTotalCost(item, 'price');
		const totalClientSum = getTotalCost(item, 'cprice');

		return (
			<div
				className={cn(styles.section, {
					[styles.opened]: isAccordionOpen,
				})}
				key={`section_${item.id}`}
			>
				<Accordion
					title={
						<div className={cn(styles.grid)}>
							<div className={cn(styles.accpart, styles.contentTotalGrid)}>
								<div></div>
								<div className={cn(styles.sectionTitle)}>{item.title}</div>
								<div></div>
								<div className={cn(styles.sectionTitleSum, styles.totalSum)}>
									<Sum count={totalSum} type='blue' />
								</div>
							</div>
							<div className={cn(styles.accpart, styles.asideTotalGrid)}>
								<div></div>
								<div>
									<LinkedPercent
										className={cn(styles.sectionTitleSurcharge)}
										highlight={true}
										count={10}
										disabled={true}
										onClick={handleOpenSurcharge}
									/>
								</div>
								<div className={cn(styles.sectionTitleSum, styles.totalSum)}>
									<Sum count={totalClientSum} type='blue' />
								</div>
								<div className={cn(styles.sectionTitleSum)}>
									<Percent mark='average' count={8} />
								</div>
							</div>
						</div>
					}
					onAccToggle={(isOpen: boolean) => handleToggleSection(index, isOpen)}
				>
					{item.rows && item.rows.length > 0 && renderRows(item, item.rows)}
				</Accordion>

				{renderSumRow(item)}
			</div>
		);
	};

	const renderFullSection = (item: TSection, index: number) => {
		if (item.isHidden) return null; // Skip rendering if the section is hidden

		const isAccordionOpen = openAccordions[index] || false;
		const openSubSections = openSubAccordions[index] || {};

		const totalSum = getTotalCost(item, 'price');
		const totalClientSum = getTotalCost(item, 'cprice');

		return (
			<div className={cn(styles.section, { [styles.opened]: isAccordionOpen })} key={`section_${item.id}`}>
				<MultipleAccordion
					title={
						<div className={cn(styles.grid)}>
							<div className={cn(styles.accpart, styles.contentTotalGrid)}>
								<div></div>
								<div className={cn(styles.sectionTitle)}>{item.title}</div>
								<div></div>
								<div className={cn(styles.sectionTitleSum, styles.totalSum)}>
									<Sum count={totalSum} type='blue' />
								</div>
							</div>
							<div className={cn(styles.accpart, styles.asideTotalGrid)}>
								<div></div>
								<div>
									<LinkedPercent
										className={cn(styles.sectionTitleSurcharge)}
										highlight={true}
										count={10}
										disabled={true}
										onClick={handleOpenSurcharge}
									/>
								</div>
								<div className={cn(styles.sectionTitleSum, styles.totalSum)}>
									<Sum count={totalClientSum} type='blue' />
								</div>
								<div className={cn(styles.sectionTitleSum)}>
									<Percent mark='average' count={8} />
								</div>
							</div>
						</div>
					}
					subSections={(item.subSections?.filter((sub) => !sub.isHidden) || []).map((sub, subIndex) => {
						return {
							subTitle: (
								<div
									className={cn(styles.subsection, {
										[styles.opened]: openSubSections[subIndex] || false,
									})}
									key={`sub_${sub.id}`}
								>
									<div className={cn(styles.grid)}>
										<div className={cn(styles.accsub, styles.contentTotalGrid)}>
											<div></div>
											<div>{sub.title}</div>
											<div></div>
											<div className={cn(styles.totalSum)}>
												<Sum count={getTotalCost(sub, 'price')} size='s' type='blue' />
											</div>
										</div>
										<div className={cn(styles.accsub, styles.asideTotalGrid)}>
											<div></div>
											<div></div>
											<div className={cn(styles.totalSum)}>
												<Sum count={getTotalCost(sub, 'cprice')} size='s' type='blue' />
											</div>
											<div>
												<Percent mark='average' count={8} />
											</div>
										</div>
									</div>
								</div>
							),
							subContent: (
								<>
									{sub.rows && sub.rows.length > 0 && renderRows(sub, sub.rows)}
									{renderSumRow(sub, 'subsection')}
								</>
							),
							isOpen: openSubSections[subIndex] || false,
							onToggle: (isOpen: boolean) => handleToggleSubSection(index, subIndex, isOpen),
						};
					})}
					isOpen={isAccordionOpen}
					onToggle={(isOpen: boolean) => handleToggleSection(index, isOpen)}
				/>
				{renderSumRow(item)}
			</div>
		);
	};

	const renderFooter = () => {
		return (
			<>
				<div className={styles.grid}>
					<div className={cn(styles.contentTotalGrid, styles.footerSubTotal)}>
						<div className={cn(styles.icon)}>
							<SettingsIcon />
						</div>
						<div>Subtotal for All Sections</div>
						<div></div>
						<div className={cn(styles.totalSum)}>
							<Sum count={totalCost.total} size='l' type='green' />
						</div>
					</div>
					<div className={cn(styles.asideTotalGrid, styles.footerSubTotal)}>
						<div></div>
						<div></div>
						<div className={cn(styles.totalSum)}>
							<Sum count={totalCost.ctotal} size='l' type='green' />
						</div>
						<div>
							<Percent mark='average' type='inversion' count={2} />
						</div>
					</div>
				</div>
				<div className={styles.grid}>
					<div className={cn(styles.contentTotalGrid, styles.footerExpenses)}>
						<div className={cn(styles.icon)}>
							<OpenedEyeIcon />
						</div>
						<div>Unforeseen expenses</div>
						<div></div>
						<div className={cn(styles.totalSum)}>
							<Sum count={expensesCost.total} size='xs' />
						</div>
					</div>
					<div className={cn(styles.asideTotalGrid, styles.footerExpenses)}>
						<div></div>
						<div></div>
						<div className={cn(styles.totalSum)}>
							<Sum count={expensesCost.ctotal} size='xs' />
						</div>
						<div>
							<Percent mark='average' type='inversion' count={2} />
						</div>
					</div>
				</div>
				<div className={styles.grid}>
					<div className={cn(styles.contentTotalGrid, styles.footerGrandTotal)}>
						<div className={cn(styles.icon)}>
							<SettingsIcon />
						</div>
						<div>Grand total</div>
						<div></div>
						<div className={cn(styles.totalSum)}>
							<Sum count={grandTotalCost.total} size='l' type='dark' />
						</div>
					</div>
					<div className={cn(styles.asideTotalGrid, styles.footerGrandTotal)}>
						<div></div>
						<div></div>
						<div className={cn(styles.totalSum)}>
							<Sum count={grandTotalCost.ctotal} size='l' type='dark' />
						</div>
						<div>
							<Percent mark='average' type='inversion' count={2} />
						</div>
					</div>
				</div>
				<div className={styles.grid}>
					<div className={cn(styles.contentTotalGrid, styles.footerExpenses)}>
						<div className={cn(styles.icon)}>
							<OpenedEyeIcon />
						</div>
						<div>Cost Per Video</div>
						<div></div>
						<div className={cn(styles.totalSum)}>
							<Sum count={10363.5} size='xs' />
						</div>
					</div>
					<div className={cn(styles.asideTotalGrid, styles.footerExpenses)}>
						<div></div>
						<div></div>
						<div className={cn(styles.totalSum)}>
							<Sum count={16310.4} size='xs' />
						</div>
						<div></div>
					</div>
				</div>
			</>
		);
	};

	return (
		<div className={cn(styles.est)} {...props}>
			{renderHeader()}

			{data.map((item: TSection, index: number) => (
				<div key={`grid_${item.id}`}>
					{item.subSections ? renderFullSection(item, index) : item.rows && renderSimpleSection(item, index)}
				</div>
			))}

			{renderFooter()}
		</div>
	);
};
