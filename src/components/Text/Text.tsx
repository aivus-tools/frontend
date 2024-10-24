import { TextProps } from './Text.props';
import styles from './Text.module.css';
import cn from 'classnames';

export const Text = ({
	color = 'primary',
	size = 'm',
	weight = 'medium',
	children,
	className,
	...props
}: TextProps) => {
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
