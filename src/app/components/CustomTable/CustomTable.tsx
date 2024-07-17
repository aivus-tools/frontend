'use client';
import { CustomTableProps } from './CustomTable.props';
import styles from './CustomTable.module.css';
import cn from 'classnames';
import {
	Accordion,
	EditableInput,
	LinkedPercent,
	Percent,
	THeadItem,
	SettingsModal,
	SurchargeModal,
} from '@/app/components';
import { tHead, TRow, tSection } from '@/app/interfaces/app.interface';
import SettingsIcon from '@/app/icons/settings-icon.svg';
import RemoveIcon from '@/app/icons/remove-icon.svg';
import { useModal } from '@/app/context/ModalContext';

export const CustomTable = ({data, className, ...props }: CustomTableProps) => {
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

	return (
		<div className={cn(styles.est)}
				 {...props}
		>
			<div className={styles.grid}>
				<div className={cn(styles.hcontent, styles.contentGrid)}>
					<div className={cn(styles.icon)}>
						<SettingsIcon />
					</div>
					{contentTHeads.map((item: tHead, index: number) => {
						return (
							<THeadItem
								key={index}
								className={cn({
									[styles.alignRight]: item.className && item.className === 'alignRight',
								})}
								text={item.text}
							/>
						);
					})}
					<div></div>
				</div>
				<div className={cn(styles.haside, styles.asideGrid)}>
					<div className={cn(styles.icon)}>
						<SettingsIcon/>
					</div>
					{asideTHeads.map((item: tHead, index: number) => {
						return (
							<THeadItem
								key={index}
								className={cn({
									[styles.alignRight]: item.className && item.className === 'alignRight',
								})}
								text={item.text}
							/>
						);
					})}
				</div>
			</div>
			{
				data.map((item: tSection, index: number) => {
					return (
						<div className={cn(styles.section)} key={index}>
							<Accordion title={
								<div className={cn(styles.grid)}>
									<div className={cn(styles.accpart, styles.contentGrid)}>
										<div></div>
										<div key={index}>{item.title}</div>
									</div>
									<div className={cn(styles.accpart, styles.asideGrid)}>
										<div></div>
										<LinkedPercent highlight={true} count={10} disabled={true} onClick={ handleOpenSurcharge } />
									</div>
								</div>
							}>

								{
									item.rows && item.rows.map((row: TRow, ind: number) => {
										return (
											<div className={cn(styles.grid, styles.row)} key={ind}>
												<div className={cn(styles.part, styles.contentGrid)}>
													<div
														className={cn(styles.icon, styles.settingsIcon)}
														onClick={() => handleOpenSettings(item)}
													>
														<SettingsIcon/>
													</div>
													<div className={cn(styles.rowItem, styles.item)}>
														<EditableInput type="text" value={row.item}/>
													</div>
													<div className={cn(styles.rowItem, styles.alignRight, styles.price)}>
														<EditableInput type="number" isPrice={true} value={row.price}/>
													</div>
													<div className={cn(styles.rowItem, styles.alignRight, styles.units)}>
														<EditableInput type="text" value={row.units}/>
													</div>
													<div className={cn(styles.rowItem, styles.alignRight, styles.quantity)}>
														<EditableInput type="number" value={row.quantity}/>
													</div>
													<div className={cn(styles.rowItem, styles.alignRight, styles.cost)}>
														<EditableInput type="number" disabled={true} isPrice={true} value={row.cost}/>
													</div>
													<div
														className={cn(styles.icon, styles.removeIcon)}
														onClick={() => handleRemoveItem(item, row)}
													>
														<RemoveIcon/>
													</div>
												</div>
												<div className={cn(styles.part, styles.asideGrid)}>
													<div className={cn(styles.rowItem, styles.element)}></div>
													<div className={cn(styles.rowItem, styles.element)}>
														<EditableInput type="number" value={row.surcharge}/>
													</div>
													<div className={cn(styles.rowItem, styles.element)}>
														<EditableInput type="number" isPrice={true} value={row.cprice}/>
													</div>
													<div className={cn(styles.rowItem, styles.element)}>
														<EditableInput type="number" disabled={true} isPrice={true} value={row.ccost}/>
													</div>
													<div className={cn(styles.rowItem, styles.element)}>
														<Percent mark="above" count={row.range}/>
													</div>
												</div>
											</div>
										)
									})
								}
							</Accordion>
						</div>
					);
				})
			}
		</div>
	)
}
