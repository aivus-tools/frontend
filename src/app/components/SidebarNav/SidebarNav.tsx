'use client';
import { SidebarNavProps } from './SidebarNav.props';
import styles from './SidebarNav.module.css';
import cn from 'classnames';
import ArrowIcon from './arrow-left-icon.svg';
import OpenedEyeIcon from './opened-eye-icon.svg';
import ClosedEyeIcon from './closed-eye-icon.svg';


export const SidebarNav = ({children, className, ...props }: SidebarNavProps) => {

	return (
		<div className={cn(styles.nav, className)}
				 {...props}
		>
			<div className={cn(styles.section)}>
				<div className={cn(styles.item)}>
					<ArrowIcon className={cn(styles.icon)}/>
					<div className={cn(styles.title)}>Creative</div>
					<ClosedEyeIcon className={cn(styles.icon)}/>
				</div>

				<div className={cn(styles.subsection)}></div>
			</div>

			<div className={cn(styles.section)}>
				<div className={cn(styles.item)}>
					<ArrowIcon className={cn(styles.icon)}/>
					<div className={cn(styles.title)}>Pre-production</div>
					<OpenedEyeIcon className={cn(styles.icon)}/>
				</div>

				<div className={cn(styles.subsection)}></div>
			</div>

			<div className={cn(styles.section)}>
				<div className={cn(styles.item)}>
					<ArrowIcon className={cn(styles.icon)}/>
					<div className={cn(styles.title)}>Production</div>
					<OpenedEyeIcon className={cn(styles.icon)}/>
				</div>

				<div className={cn(styles.subsection)}>
					<div className={cn(styles.item)}>
						<ArrowIcon className={cn(styles.icon)}/>
						<div className={cn(styles.title)}>Locations</div>
						<OpenedEyeIcon className={cn(styles.icon)}/>
					</div>

					<div className={cn(styles.item)}>
						<ArrowIcon className={cn(styles.icon)}/>
						<div className={cn(styles.title)}>Equipment</div>
						<OpenedEyeIcon className={cn(styles.icon)}/>
					</div>

					<div className={cn(styles.item)}>
						<ArrowIcon className={cn(styles.icon)}/>
						<div className={cn(styles.title)}>Fee</div>
						<OpenedEyeIcon className={cn(styles.icon)}/>
					</div>
				</div>
			</div>

			<div className={cn(styles.section)}>
				<div className={cn(styles.item)}>
					<ArrowIcon className={cn(styles.icon)}/>
					<div className={cn(styles.title)}>Creative</div>
					<OpenedEyeIcon className={cn(styles.icon)}/>
				</div>

				<div className={cn(styles.subsection)}></div>
			</div>

			<div className={cn(styles.section)}>
				<div className={cn(styles.item)}>
					<ArrowIcon className={cn(styles.icon)}/>
					<div className={cn(styles.title)}>Creative</div>
					<OpenedEyeIcon className={cn(styles.icon)}/>
				</div>

				<div className={cn(styles.subsection)}></div>
			</div>

		</div>
	);
};
