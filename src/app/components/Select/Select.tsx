'use client';
import { SelectProps } from './Select.props';
import styles from './Select.module.css';
import cn from 'classnames';
import { useState, ChangeEvent, useEffect, useRef } from 'react';
import { Input } from '@/app/components';

export const Select = ({ options, onAdd }: SelectProps) => {
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
	const [showDropdown, setShowDropdown] = useState<boolean>(false);
	const selectRef = useRef<HTMLDivElement>(null);

	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
		const searchTerm = event.target.value;
		setSearchTerm(searchTerm);
		setFilteredOptions(
			options.filter(option =>
				option.toLowerCase().includes(searchTerm.toLowerCase())
			)
		);
		setShowDropdown(true);
	};

	const handleAdd = () => {
		onAdd(searchTerm);
		setSearchTerm('');
		setFilteredOptions(options);
		setShowDropdown(false);
	};

	const handleClickOutside = (event: MouseEvent) => {
		if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
			setShowDropdown(false);
			setSearchTerm('');
			setFilteredOptions(options);
		}
	};

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	return (
		<div className={cn(styles.wrapper)} ref={selectRef}>
			<Input
				type='text'
				value={searchTerm}
				showIcon={true}
				className={cn(styles.inputSearch)}
				onChange={handleSearchChange}
				onFocus={() => setShowDropdown(true)}
				placeholder='Select Units'
			/>
			{showDropdown && (
				<div className={cn(styles.dropdown)}>
					{filteredOptions.length > 0 ? (
						filteredOptions.map((option, index) => (
							<div
								key={index}
								className={cn(styles.option)}
								onClick={() => {
									setSearchTerm(option);
									setShowDropdown(false);
								}}
							>
								{option}
							</div>
						))
					) : (
						<div className={cn(styles.empty)}>
							<p>Do you want to add "{searchTerm}"?</p>
							<div
								className={cn(styles.addBtn)}
								onClick={handleAdd}
							>
								add
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
