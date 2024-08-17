import { SettingsItemExpensesProps } from './SettingsItemExpenses.props';
import styles from './SettingsItemExpenses.module.css';
import cn from 'classnames';
import { Text } from '@/app/components';
import { formatPrice } from '@/app/helpers/helper';

export const SettingsItemExpenses = ({ className, ...props }: SettingsItemExpensesProps) => {

	return (
		<div
			className={cn(styles.expenses, className)}
			{...props}
		>
			<Text color="grayLight" size="l" weight="regular">Price ($)</Text>
			<Text color="grayDark" size="l" weight="regular">{ formatPrice(10) }</Text>
			<Text color="grayLight" size="l" weight="regular">Total cost ($)</Text>
			<Text color="grayDark" size="l" weight="regular">{ formatPrice(240) }</Text>
		</div>
	);
};
