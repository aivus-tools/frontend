'use client';
import { AccordionProps } from './Accordion.props';
import styles from './Accordion.module.css';
import cn from 'classnames';
import { useState, useRef, useEffect } from 'react';
import ArrowIcon from '@/app/icons/arrow-down-icon.svg';

export const Accordion = ({ title, children, className, onToggle, ...props }: AccordionProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [height, setHeight] = useState('0px');
	const contentRef = useRef<HTMLDivElement>(null);

	const toggleAccordion = () => {
		setIsOpen(!isOpen);
		if (contentRef.current) {
			setHeight(isOpen ? '0px' : `${contentRef.current.scrollHeight}px`);
		}
		if (onToggle) {
			onToggle(!isOpen);
		}
	};

	useEffect(() => {
		if (contentRef.current) {
			setHeight(isOpen ? `${contentRef.current.scrollHeight}px` : '0px');
		}
	}, [isOpen]);

	return (
		<div className={cn(styles.accordion, className)} {...props}>
			<div
				className={cn(styles.title, { [styles.opened]: isOpen })}
				onClick={toggleAccordion}
			>
				<ArrowIcon className={cn(styles.icon)} />
				{title}
			</div>
			<div
				ref={contentRef}
				style={{ maxHeight: height, transition: 'max-height 0.3s ease' }}
				className={cn(styles.content, { [styles.opened]: isOpen })}
			>
				<div className={cn(styles.contentInner)}>{children}</div>
			</div>
		</div>
	);
};
