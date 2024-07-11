import React, { useState, useRef, ChangeEvent, FocusEvent, ChangeEventHandler } from 'react';
import styles from './EditableInput.module.css';
import { EditableInputProps } from './EditableInput.props';
import { formatPrice } from '@/app/helpers/helper';

export const EditableInput = ({ value, type = 'number', isPrice = false, disabled = false, className, onChange, ...props }: EditableInputProps) => {
	const [isFocused, setIsFocused] = useState(false);
	const [inputValue, setInputValue] = useState(value.toString());
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFocus = () => {
		setIsFocused(true);
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
		setIsFocused(false);
		const newValue = type === 'number' ? parseFloat(inputValue) : inputValue;
		if (type === 'number' && !isNaN(newValue as number) && onChange) {
			onChange(event);
		}
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (type === 'number' && isNaN(Number(e.target.value)) && e.target.value !== '' && e.target.value !== '-') {
			return;
		}
		setInputValue(e.target.value);
		if (onChange) {
			onChange(e);
		}
	};

	const displayValue = type === 'number' && !isFocused && isPrice ? formatPrice(parseFloat(inputValue)) : inputValue;

	return (
		<div
			className={`${styles.inputWrapper} ${isFocused ? styles.focused : ''} ${className}`}
			onClick={handleFocus}
		>
			<input
				ref={inputRef}
				type={isFocused ? (type === 'number' ? 'number' : 'text') : 'text'}
				value={displayValue}
				disabled={disabled}
				onChange={handleChange}
				onBlur={handleBlur}
				className={styles.input}
				{...props}
			/>
		</div>
	);
};
