import { SettingsItemTaxesProps } from './SettingsItemTaxes.props';
import styles from './SettingsItemTaxes.module.css';
import cn from 'classnames';
import { Text } from '@/app/components';
import { formatPrice } from '@/app/helpers/helper';

export const SettingsItemTaxes = ({ className, ...props }: SettingsItemTaxesProps) => {

	return (
		<div
			className={cn(styles.taxes, className)}
			{...props}
		>
			<Text color="grayLight" size="l" weight="regular">Taxes ($)</Text>
			<Text color="grayDark" size="l" weight="regular">{ formatPrice(2) }</Text>
			<Text color="grayLight" size="l" weight="regular">Full Taxes ($)</Text>
			<Text color="grayDark" size="l" weight="regular">{ formatPrice(48) }</Text>
		</div>
	);
};
