'use client'
import styles from "./page.module.css";
import cn from 'classnames';
import withLayout from '@/app/layout/Layout';
import withAuth from '@/app/layout/withAuth/withAuth';
import { EstTable } from '@/app/components';
import { TRow, TSection, TSubSection } from '@/app/interfaces/app.interface';
import { useEffect, useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/store/store';
import { setTableData, removeItem, addItem, addSection, updateItem } from '@/app/store/actions';

const Estimation = () => {
	const initialData: TSection[] = [
		{
			id: 1,
			title: 'Pre production',
			isHidden: false,
			rows: [
				{
					id: 111,
					item: 'Colorful Storyboard',
					price: 1700,
					units: 'Units',
					quantity: 1,
					surcharge: 10,
					cprice: 1700,
					range: 16,
				},
				{
					id: 112,
					item: 'Select an item 1',
					price: 600,
					units: 'Pack',
					quantity: 1,
					surcharge: 10,
					cprice: 700,
					range: 16,
				},
				{
					id: 113,
					item: 'Select an item 2',
					price: 300,
					units: 'Piece',
					quantity: 1,
					surcharge: 10,
					cprice: 300,
					range: 15,
				}
			]
		},
		{
			id: 2,
			title: 'Production',
			isHidden: false,
			subSections: [
				{
					id: 21,
					title: 'Locations',
					isHidden: false,
					rows: [
						{
							id: 211,
							item: 'Colorful Storyboard',
							price: 2000,
							units: 'Units',
							quantity: 1,
							surcharge: 10,
							cprice: 2200,
							range: 16,
						},
						{
							id: 212,
							item: 'Select an item',
							price: 300,
							units: 'Units',
							quantity: 1,
							surcharge: 10,
							cprice: 300,
							range: 19,
						}
					]
				},
				{
					id: 22,
					title: 'Sub Section 2',
					isHidden: false,
					rows: [
						{
							id: 221,
							item: 'Colorful Storyboard',
							price: 1700,
							units: '',
							quantity: 1,
							surcharge: 10,
							cprice: 1700,
							range: 16,
						},
						{
							id: 222,
							item: 'Select an item',
							price: 300,
							units: 'Units',
							quantity: 1,
							surcharge: 10,
							cprice: 300,
							range: 19,
						}
					]
				}
			],
		},
		{
			id: 3,
			title: 'Creative',
			isHidden: false,
			rows: [
				{
					id: 311,
					item: 'Colorful Storyboard',
					price: 1700,
					units: 'Piece',
					quantity: 1,
					surcharge: 10,
					cprice: 1700,
					range: 16,
				},
				{
					id: 312,
					item: 'Select an item',
					price: 300,
					units: 'Piece',
					quantity: 1,
					surcharge: 10,
					cprice: 300,
					range: 19,
				}
			]
		},
	]

	const data = useSelector((state: RootState) => state.estimates.data);
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setTableData(initialData));
	}, [dispatch]);

	const handleRemoveItem = (row: TRow) => {
		dispatch(removeItem(row.id));
	};
	const handleAddItem = (sectionId: number, isSubSection: boolean) => {
		const newRow: TRow = {
			id: +new Date() % 10000,
			item: '',
			price: 0,
			units: '',
			quantity: 0,
			surcharge: 0,
			cprice: 0,
			range: 0,
		};

		dispatch(addItem({ sectionId, newRow, isSubSection }));
	};
	const handleAddSection = () => {
		let newSection: TSection = {
			id: +new Date() % 1000,
			title: 'New Section',
			isHidden: false,
			rows: [],
		};

		dispatch(addSection(newSection));
	};
	const handleInputChange = (sectionId: number, rowId: number, field: string, value: string | number) => {
		dispatch(updateItem({ sectionId, rowId, field, value }));
	};

	// useEffect(() => {
	// 	console.log(data);
	// }, [data]);

	return (
		<main>
			<EstTable data={data}
				onRemoveItem={handleRemoveItem}
				onAddItem={handleAddItem}
				onAddSection={handleAddSection}
				onChangeInput={handleInputChange}
			/>
		</main>
	);
}

export default withAuth(withLayout<{}>(Estimation));
