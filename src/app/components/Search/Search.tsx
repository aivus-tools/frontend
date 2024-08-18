'use client';
import { SearchProps } from './Search.props';
import styles from './Search.module.css';
import cn from 'classnames';
import SearchIcon from '@/app/icons/search-icon.svg';


export const Search = ({type = 'gray', children, className, ...props }: SearchProps) => {

	return (
		<div className={cn(styles.search, className, {
			[styles.gray]: type === 'gray',
			[styles.white]: type === 'white',
		})}
			{...props}
		>
			<SearchIcon className={cn(styles.searchIcon)} />
			Search
		</div>
	);
};
