'use client'
import styles from "./page.module.css";
import withLayout from '@/app/layout/Layout';
import withAuth from '@/app/layout/withAuth/withAuth';
import { EstTable, CustomTable } from '@/app/components';
import { tSection } from '@/app/interfaces/app.interface';


const Estimation = () => {
	const data: tSection[] = [
		{
			title: 'Pre production',
			rows: [
				{
					item: 'Colorful Storyboard',
					price: 1700,
					units: 'units',
					quantity: 1,
					cost: 1700,
					surcharge: 10,
					cprice: 1700,
					ccost: 1700,
					range: 16,
				},
				{
					item: 'Select an item',
					price: 300,
					units: 'units',
					quantity: 1,
					cost: 300,
					surcharge: 10,
					cprice: 300,
					ccost: 300,
					range: 19,
				}
			]
		},
		{
			title: 'Production',
			rows: [
				{
					item: 'Colorful Storyboard',
					price: 1700,
					units: '',
					quantity: 1,
					cost: 1700,
					surcharge: 10,
					cprice: 1700,
					ccost: 1700,
					range: 16,
				},
				{
					item: 'Select an item',
					price: 300,
					units: '',
					quantity: 1,
					cost: 300,
					surcharge: 10,
					cprice: 300,
					ccost: 300,
					range: 19,
				}
			]
		},
		{
			title: 'Creative',
			rows: [
				{
					item: 'Colorful Storyboard',
					price: 1700,
					units: '',
					quantity: 1,
					cost: 1700,
					surcharge: 10,
					cprice: 1700,
					ccost: 1700,
					range: 16,
				},
				{
					item: 'Select an item',
					price: 300,
					units: '',
					quantity: 1,
					cost: 300,
					surcharge: 10,
					cprice: 300,
					ccost: 300,
					range: 19,
				}
			]
		},
	]

	return (
		<main>
			{/*<EstTable data={data} />*/}
			<CustomTable data={data} />
		</main>
	);
}

export default withAuth(withLayout<{}>(Estimation));
