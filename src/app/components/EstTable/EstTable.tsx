'use client';
import { EstTableProps } from './EstTable.props';
import styles from './EstTable.module.css';
import cn from 'classnames';
import { THeadItem, Accordion, EditableInput, Percent } from '@/app/components';
import { tHead, TRow, tSection } from '@/app/interfaces/app.interface';
import ArrowIcon from '@/app/icons/arrow-down-icon.svg';
import { useState } from 'react';

export const EstTable = ({data, className, ...props }: EstTableProps) => {
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

	const [isAccordionOpen, setIsAccordionOpen] = useState(false);

	const handleToggle = (isOpen: boolean) => {
		setIsAccordionOpen(isOpen);
	};

	return (
		<div className={cn(styles.est)}
			{...props}
		>
			<div className={cn(styles.hgrid)}>
				<div className={cn(styles.hcontent, styles.contgrid)}>
					{contentTHeads.map((item: tHead, index: number) => {
						return (
							<THeadItem
								key={index}
								className={cn({
									[styles.alignRight]: item.className && item.className === 'alignRight',
								})}
								text={item.text} showIcon={item.showIcon ? true : false}
							/>
						);
					})}
				</div>
				<div className={cn(styles.haside, styles.asidegrid)}>
					{asideTHeads.map((item: tHead, index: number) => {
						return (
							<THeadItem
								key={index}
								className={cn({
									[styles.alignRight]: item.className && item.className === 'alignRight',
								})}
								text={item.text} showIcon={item.showIcon ? true : false}
							/>
						);
					})}
				</div>
			</div>

			{
				data.map((item: tSection, index: number) => {
					return (
						<div className={cn(styles.section)} key={ index }>
							<Accordion title={
								<div className={cn(styles.grid, {
									[styles.opened]: isAccordionOpen,
								})}>
									<div className={cn(styles.content, styles.hsection)}>
										<ArrowIcon className={cn(styles.icon)} />
										{item.title}
									</div>
									<div className={cn(styles.aside, styles.hsection)}>10%</div>
								</div>
							}
								onAccToggle={ handleToggle }
							>
								<div className={cn(styles.grid)}>
									<div className={cn(styles.content, styles.contgrid, styles.csection, styles.accContent)}>
										{
											item.rows && item.rows.map((row: TRow, ind: number) => {
												return (
													<>
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
													</>
												);
											})
										}
									</div>
									<div className={cn(styles.aside, styles.asidegrid, styles.csection, styles.accContent)}>
										{
											item.rows && item.rows.map((row: TRow, ind: number) => {
												return (
													<>
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
															<Percent mark="above" count={row.range}/>
														</div>
													</>
												);
											})
										}
									</div>
								</div>
							</Accordion>
						</div>
					);
				})
			}
		</div>
	);
};
