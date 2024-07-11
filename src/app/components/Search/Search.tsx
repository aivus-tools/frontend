'use client';
import { SearchProps } from './Search.props';
import styles from './Search.module.css';
import cn from 'classnames';
import SearchIcon from './search-icon.svg';


export const Search = ({children, className, ...props }: SearchProps) => {

	return (
		<div className={cn(styles.search, className)}
				 {...props}
		>
			<SearchIcon className={cn(styles.searchIcon)} />
			Search
		</div>
	);
};
