'use client';
import { MultipleAccordionProps } from './MultipleAccordion.props';
import styles from './MultipleAccordion.module.css';
import cn from 'classnames';
import { useState } from 'react';
import ArrowIcon from '@/app/icons/arrow-down-icon.svg';

export const MultipleAccordion = ({ title, content, subSections = [], isOpen, onToggle, ...props }: MultipleAccordionProps) => {
	const [localIsOpen, setLocalIsOpen] = useState(isOpen);

	const toggleContent = () => {
		const newIsOpen = !localIsOpen;
		setLocalIsOpen(newIsOpen);
		onToggle(newIsOpen);
	};

	return (
		<div className={cn(styles.accordion)} {...props}>
			<div className={cn(styles.title, { [styles.opened]: localIsOpen })} onClick={toggleContent}>
				<ArrowIcon className={cn(styles.icon)} />
				{title}
			</div>
			{localIsOpen && (
				<div className={cn(styles.content)}>
					{content}
					{subSections.map((subSection, index) => (
						<div key={index}>
							<div onClick={() => subSection.onToggle(!subSection.isOpen)} className={cn(styles.subTitle, { [styles.opened]: subSection.isOpen })}>
								<ArrowIcon className={cn(styles.icon)} />
								{subSection.subTitle}
							</div>
							{subSection.isOpen && <div className={cn(styles.subContent)}>{subSection.subContent}</div>}
						</div>
					))}
				</div>
			)}
		</div>
	);
};
