'use client';
import { SidebarNavSectionProps } from './SidebarNavSection.props';
import styles from './SidebarNavSection.module.css';
import cn from 'classnames';
import ArrowIcon from '@/icons/arrow-left-icon.svg';
import OpenedEyeIcon from '@/icons/opened-eye-icon.svg';
import ClosedEyeIcon from '@/icons/closed-eye-icon.svg';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateSectionVisibility } from '@/store/actions';

export const SidebarNavSection = ({ section, className, ...props }: SidebarNavSectionProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const dispatch = useDispatch();

	const toggleSection = () => {
		if (section.type !== 'row') {
			setIsOpen(!isOpen);
		}
	};

	const toggleHideSection = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent the toggleSection from firing
		dispatch(updateSectionVisibility({ sectionId: section.id, isHidden: !section.isHidden })); // Corrected dispatch
	};

	return (
		<div className={cn(styles.section, className)} {...props}>
			<div className={cn(styles.item, { [styles.row]: section.type === 'row' })} onClick={toggleSection}>
				{section.type !== 'row' && <ArrowIcon className={cn(styles.icon, { [styles.rotated]: isOpen })} />}
				<div className={cn(styles.title)}>{section.title}</div>
				{section.type !== 'row' &&
					(section.isHidden ? (
						<ClosedEyeIcon className={cn(styles.icon)} onClick={toggleHideSection} />
					) : (
						<OpenedEyeIcon className={cn(styles.icon)} onClick={toggleHideSection} />
					))}
			</div>

			{isOpen && section.children && (
				<div className={cn(styles.subsection)}>
					{section.children.map((child) => (
						<SidebarNavSection key={child.id} section={child} />
					))}
				</div>
			)}
		</div>
	);
};
