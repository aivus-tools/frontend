'use client';
import { MultipleAccordionProps } from './MultipleAccordion.props';
import styles from './MultipleAccordion.module.css';
import cn from 'classnames';
import { useState } from 'react';
import ArrowIcon from '@/app/icons/arrow-down-icon.svg';

export const MultipleAccordion = ({ title, content, subSections = [], className, ...props }: MultipleAccordionProps) => {
	const [isContentOpen, setIsContentOpen] = useState(false);
	const [openSubSections, setOpenSubSections] = useState<boolean[]>(new Array(subSections.length).fill(false));

	const toggleContent = () => {
		setIsContentOpen(!isContentOpen);
		// Close all subSections if main content is closed
		if (isContentOpen) {
			setOpenSubSections(new Array(subSections.length).fill(false));
		}
	};

	const toggleSubContent = (index: number) => {
		setOpenSubSections(openSubSections.map((isOpen, i) => (i === index ? !isOpen : isOpen)));
	};

	return (
		<div className={cn(styles.accordion, className)} {...props}>
			<div className={cn(styles.title, { [styles.opened]: isContentOpen })} onClick={toggleContent}>
				<ArrowIcon className={cn(styles.icon)} />
				{title}
			</div>
			{isContentOpen && (
				<div className={cn(styles.content)}>
					{content}
					{subSections.map((subSection, index) => (
						<div key={index}>
							<div onClick={() => toggleSubContent(index)} className={cn(styles.subTitle, { [styles.opened]: openSubSections[index] })}>
								<ArrowIcon className={cn(styles.icon)} />
								{subSection.subTitle}
							</div>
							{openSubSections[index] && <div className={cn(styles.subContent)}>{subSection.subContent}</div>}
						</div>
					))}
				</div>
			)}
		</div>
	);
};
