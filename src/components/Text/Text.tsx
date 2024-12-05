import styles from './Text.module.css';
import cn from 'classnames';

import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

interface Props extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	color?: 'gray' | 'grayLight' | 'grayDark' | 'primary' | 'red';
	size?: 'xs' | 's' | 'm' | 'l' | 'xl';
	weight?: 'thin' | 'extralight' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'exrtabold' | 'black';
	children: ReactNode;
}

export const Text = ({ color = 'primary', size = 'm', weight = 'medium', children, className, ...props }: Props) => {
	return (
		<div
			className={cn(styles.quantity, className, {
				[styles.gray]: color === 'gray',
				[styles.grayLight]: color === 'grayLight',
				[styles.grayDark]: color === 'grayDark',
				[styles.red]: color === 'red',
				[styles.thin]: weight === 'thin',
				[styles.extralight]: weight === 'extralight',
				[styles.light]: weight === 'light',
				[styles.regular]: weight === 'regular',
				[styles.medium]: weight === 'medium',
				[styles.semibold]: weight === 'semibold',
				[styles.bold]: weight === 'bold',
				[styles.exrtabold]: weight === 'exrtabold',
				[styles.black]: weight === 'black',
				[styles.xs]: size === 'xs',
				[styles.s]: size === 's',
				[styles.m]: size === 'm',
				[styles.l]: size === 'l',
				[styles.l]: size === 'xl',
			})}
			{...props}
		>
			{children}
		</div>
	);
};
