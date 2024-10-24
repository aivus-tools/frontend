import { SettingsItemMarketProps } from './SettingsItemMarket.props';
import styles from './SettingsItemMarket.module.css';
import cn from 'classnames';
import { Percent, Text } from '@/components';
import Link from 'next/link';

export const SettingsItemMarket = ({ className, ...props }: SettingsItemMarketProps) => {
	return (
		<div className={cn(styles.market, className)} {...props}>
			<div className={cn(styles.section)}>
				<Text color='grayLight' size='l' weight='regular'>
					Your final price for client is
				</Text>
			</div>
			<div className={cn(styles.section, styles.flex)}>
				<Percent mark='above' count={16} />
				<div className={cn(styles.more)}>
					<Text color='red' size='l' weight='bold'>
						above the average market price
					</Text>
					<Link className={cn(styles.link)} href='#'>
						More details
					</Link>
				</div>
			</div>
		</div>
	);
};
