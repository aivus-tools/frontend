import { SettingsItemTitleProps } from './SettingsItemTitle.props';
import styles from './SettingsItemTitle.module.css';
import cn from 'classnames';
import SettingsIcon from '@/app/icons/settings-icon.svg';

export const SettingsItemTitle = ({ title, subTitle, className, ...props }: SettingsItemTitleProps) => {


	return (
		<div
			className={cn(styles.item, className)}
			{...props}
		>
			<div className={cn(styles.header, className)}>
				<SettingsIcon/>
				<div className={cn(styles.titleWrap, className)}>
					<div className={cn(styles.title, className)}>{ title }</div>
					<div className={cn(styles.subTitle, className)}>{ subTitle }</div>
				</div>
			</div>
			<div className={cn(styles.description, className)}>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas tincidunt tristique blandit. Vestibulum placerat elit eu eros sodales viverra.
			</div>

		</div>
	);
};
