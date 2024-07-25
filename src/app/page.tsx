'use client';
import styles from "./page.module.css";
import cn from 'classnames';
import { ChangeEvent, useState } from 'react';
import { Button, EditableInput, Select, Input, Percent, LinkedPercent } from '@/app/components';
import { formatPrice } from '@/app/helpers/helper';
import Link from 'next/link';

export default function Home() {
	const [value, setValue] = useState(11893);
	const [valueNum, setValueNum] = useState(2);
	const [valueText, setValueText] = useState('Colorful Storyboard');

	const [inputVal, setInputVal] = useState<string>('Simple Input text');

	const clickButton = (name:string) => {
		console.log(`click ${name} button`);
	}

	const [options, setOptions] = useState<string[]>(['Option 1', 'Option 2', 'Option 3']);

	const handleAddOption = (newOption: string) => {
		console.log(`add ${newOption} option`);
		setOptions([...options, newOption]);
	};

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setInputVal(e.target.value);
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
			<div className={cn(styles.flex)}>
				<Link href={'/estimation'}>Estimation page</Link>
			</div>

			<div className={cn(styles.flex)}>
				<div className={cn(styles.section)}>
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
							<EditableInput value={valueText} type="text" disabled={true}
														 onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
															 setValueText(e.target.value);
														 }} className={cn(styles.input)}/>
						</div>
						<div className={cn(styles.flexItem)}>
							<p>Current Text: {valueText}</p>
						</div>
					</div>
				</div>
				<div className={cn(styles.section)}>
					<div className={cn(styles.item)}>
						<Input
							value={inputVal}
							onChange={handleInputChange}
						/>
						{/*<Select options={options} onAdd={handleAddOption}/>*/}
					</div>
					<div className={cn(styles.item)}>
						<div className={cn(styles.flex)}>
							<div className={cn(styles.flexItem)}>
								<Percent mark="average" size="s" rounded={true} count={16}/>
							</div>
							<div className={cn(styles.flexItem)}>
								<Percent mark="average" size="s" count={16}/>
							</div>
							<div className={cn(styles.flexItem)}>
								<Percent mark="average" size="s" type="inversion" count={16}/>
							</div>
							<div className={cn(styles.flexItem)}>
								<Percent mark="average" size="s" type="transparent" count={16}/>
							</div>
						</div>

					</div>
					<div className={cn(styles.item)}>
						<div className={cn(styles.flex)}>
							<div className={cn(styles.flexItem)}>
								<Percent mark="above" rounded={true} count={16}/>
							</div>
							<div className={cn(styles.flexItem)}>
								<Percent mark="above" count={16}/>
							</div>
							<div className={cn(styles.flexItem)}>
								<Percent mark="above" type="inversion" count={16}/>
							</div>
							<div className={cn(styles.flexItem)}>
								<Percent mark="above" type="transparent" count={16}/>
							</div>
						</div>
					</div>
					<div className={cn(styles.item)}>
						<div className={cn(styles.flex)}>
						<div className={cn(styles.flexItem)}>
								<Percent mark="below" size="l" rounded={true} count={16}/>
							</div>
							<div className={cn(styles.flexItem)}>
								<Percent mark="below" size="l" count={16}/>
							</div>
							<div className={cn(styles.flexItem)}>
								<Percent mark="below" size="l" type="inversion" count={16}/>
							</div>
							<div className={cn(styles.flexItem)}>
								<Percent mark="below" size="l" type="transparent" count={16}/>
							</div>
						</div>
					</div>
					<div className={cn(styles.item)}>
						<div className={cn(styles.flex)}>
							<div className={cn(styles.flexItem)}>
								<Percent mark="na" rounded={true} count={0}/>
							</div>
							<div className={cn(styles.flexItem)}>
								<Percent mark="na" count={0}/>
							</div>
							<div className={cn(styles.flexItem)}>
								<Percent mark="na" type="inversion" count={0}/>
							</div>
							<div className={cn(styles.flexItem)}>
								<Percent mark="na" type="transparent" count={0}/>
							</div>
						</div>
					</div>
				</div>
				<div className={cn(styles.section)}>
					<div className={cn(styles.item)}>
						<LinkedPercent count={10}/>
					</div>
					<div className={cn(styles.item)}>
						<LinkedPercent linked={false} count={16}/>
					</div>
					<div className={cn(styles.item)}>
						<LinkedPercent linked={false} disabled={true} count={16}/>
					</div>
					<div className={cn(styles.item)}>
						<LinkedPercent highlight={true} count={10}/>
					</div>
					<div className={cn(styles.item)}>
						<LinkedPercent linked={false} highlight={true} count={16}/>
					</div>
					<div className={cn(styles.item)}>
						<LinkedPercent linked={false} highlight={true} disabled={true} count={16}/>
					</div>
				</div>
			</div>
		</main>
	);
}
