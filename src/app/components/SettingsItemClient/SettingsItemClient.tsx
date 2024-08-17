import { SettingsItemClientProps } from './SettingsItemClient.props';
import styles from './SettingsItemClient.module.css';
import cn from 'classnames';
import { Text } from '@/app/components';
import { formatPrice } from '@/app/helpers/helper';

export const SettingsItemClient = ({ className, ...props }: SettingsItemClientProps) => {

	return (
		<div
			className={cn(styles.client, className)}
			{...props}
		>
			<div className={cn(styles.column)}>
				<div className={cn(styles.section)}>
					<Text className={cn(styles.item)} color="grayLight" size="l" weight="regular">Surcharge</Text>
					<Text className={cn(styles.item)} color="grayDark" size="l" weight="regular">20%</Text>
				</div>
				<div className={cn(styles.section)}>
					<Text className={cn(styles.item)} color="grayLight" size="l" weight="regular">Total cost ($)</Text>
					<Text color="grayDark" size="l" weight="regular">$ 480</Text>
				</div>
			</div>
			<div className={cn(styles.column)}>
				<div className={cn(styles.section)}>
					<Text className={cn(styles.item)} color="grayLight" size="l" weight="regular">Price for client ($)</Text>
					<Text className={cn(styles.item)} color="grayDark" size="l" weight="regular">{formatPrice(20)}</Text>
				</div>
				<div className={cn(styles.section)}>
					<Text className={cn(styles.item)} color="grayLight" size="l" weight="regular">Profit </Text>
					<div className={cn(styles.flex)}>
						<Text color="grayDark" size="l" weight="regular">$ 240</Text>
						<Text color="grayDark" size="l" weight="regular">% 100</Text>
					</div>
				</div>
			</div>
		</div>
	);
};
