'use client';
import styles from "./page.module.css";
import { Button } from '@/app/components';
import cn from 'classnames';

export default function Home() {

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
		</main>
);
}
