'use client';
import styles from "./page.module.css";
import cn from 'classnames';
import { useState } from 'react';
import { Button, EditableInput } from '@/app/components';
import { formatPrice } from '@/app/helpers/helper';

export default function Home() {
	const [value, setValue] = useState(11893);
	const [valueNum, setValueNum] = useState(2);
	const [valueText, setValueText] = useState('Colorful Storyboard');


	const clickButton = (name:string) => {
		console.log(`click ${name} button`);
	}

	return (
		<main className={styles.main}>
			<h1>Main Page</h1>
			<div className={cn(styles.flex)}>
				<div className={cn(styles.flexItem)}>
					<Button
						size="m"
						color="transparent"
						onClick={() => {
							clickButton('transparent');
						}}
					> Button
					</Button>
				</div>
				<div className={cn(styles.flexItem)}>
					<Button
						size="m"
						color="beige"
						onClick={() => {
							clickButton('beige');
						}}
					>
						Button
					</Button>
				</div>
				<div className={cn(styles.flexItem)}>
					<Button
						size="m"
						color="primary"
						onClick={() => {
							clickButton('primary');
						}}
					>
						Button
					</Button>
				</div>
			</div>

			<div className={cn(styles.item)}>
				<div className={cn(styles.flexItem)}>
					<span>Price Input:</span>
					<EditableInput value={value} isPrice={true} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						setValue(parseInt(e.target.value));
					}} className={cn(styles.input)}/>
				</div>

				<div className={cn(styles.flexItem)}>Current Price: {formatPrice(value)}</div>
			</div>
			<div className={cn(styles.item)}>
				<div className={cn(styles.flexItem)}>
					<span>Number Input:</span>
					<EditableInput
						value={valueNum}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setValueNum(parseInt(e.target.value));
						}}
						className={cn(styles.input)}
					/>
				</div>
				<div className={cn(styles.flexItem)}>
					<p>Current Quantity: {valueNum}</p>
				</div>
			</div>
			<div className={cn(styles.item)}>
				<div className={cn(styles.flexItem)}>
					<span>String Input:</span>
					<EditableInput value={valueText} type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						setValueText(e.target.value);
					}} className={cn(styles.input)}/>
				</div>
				<div className={cn(styles.flexItem)}>
					<p>Current Text: {valueText}</p>
				</div>
			</div>

			<div className={cn(styles.item)}>
				<div className={cn(styles.flexItem)}>
					<span>Disabled Input:</span>
					<EditableInput value={valueText} type="text" disabled={true} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						setValueText(e.target.value);
					}} className={cn(styles.input)}/>
				</div>
				<div className={cn(styles.flexItem)}>
					<p>Current Text: {valueText}</p>
				</div>
			</div>

		</main>
	);
}
