import { SettingsItemQuantityProps } from './SettingsItemQuantity.props';
import styles from './SettingsItemQuantity.module.css';
import cn from 'classnames';
import { Text } from '@/components';

export const SettingsItemQuantity = ({ className, ...props }: SettingsItemQuantityProps) => {
	return (
		<div className={cn(styles.quantity, className)} {...props}>
			<Text color='grayLight' size='l' weight='regular'>
				Pictures
			</Text>
			<Text color='gray' size='l' weight='regular'>
				12
			</Text>

			<Text color='gray' size='l' weight='regular'>
				x
			</Text>

			<Text color='grayLight' size='l' weight='regular'>
				Videos
			</Text>
			<Text color='grayDark' size='l' weight='regular'>
				2
			</Text>

			<Text color='gray' size='l' weight='regular'>
				=
			</Text>
			<Text color='grayDark' size='l' weight='regular'>
				24
			</Text>
		</div>
	);
};
