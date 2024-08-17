'use client';
import { SettingsModalProps } from './SettingsModal.props';
import styles from './SettingsModal.module.css';
import cn from 'classnames';
import {
	SettingsItem, SettingsItemClient,
	SettingsItemExpenses, SettingsItemMarket,
	SettingsItemQuantity,
	SettingsItemTaxes,
	SettingsItemTitle,
} from '@/app/components';



export const SettingsModal = ({children, className, ...props }: SettingsModalProps) => {
	return (
		<div
			className={cn(styles.settings, className)}
			{...props}
		>
			<h2 className={cn(styles.title)}>Settings</h2>
			<SettingsItemTitle
				title="Colourful Storyboard"
				subTitle="Options of the item"
			/>
			<SettingsItem title="Quantity">
				<SettingsItemQuantity />
			</SettingsItem>
			<SettingsItem title="Expenses">
				<SettingsItemExpenses />
			</SettingsItem>
			<SettingsItem title="Taxes">
				<SettingsItemTaxes />
			</SettingsItem>
			<SettingsItem title="For client">
				<SettingsItemClient />
			</SettingsItem>
			<SettingsItem title="Market Analytics">
				<SettingsItemMarket />
			</SettingsItem>
		</div>
	);
};
