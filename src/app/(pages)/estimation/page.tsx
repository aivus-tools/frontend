'use client'
import styles from "./page.module.css";
import cn from 'classnames';
import withLayout from '@/app/layout/Layout';
import withAuth from '@/app/layout/withAuth/withAuth';
import { EstTable } from '@/app/components';
import { TRow, tSection, tSubSection } from '@/app/interfaces/app.interface';
import { useEffect, useState } from 'react';

const Estimation = () => {
	const initialData: tSection[] = [
		{
			id: 1,
			title: 'Pre production',
			rows: [
				{
					id: 111,
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
					id: 112,
					item: 'Select an item 1',
					price: 600,
					units: 'units',
					quantity: 1,
					cost: 600,
					surcharge: 10,
					cprice: 700,
					ccost: 700,
					range: 16,
				},
				{
					id: 113,
					item: 'Select an item 2',
					price: 300,
					units: 'units',
					quantity: 1,
					cost: 300,
					surcharge: 10,
					cprice: 300,
					ccost: 300,
					range: 15,
				}
			]
		},
		{
			id: 2,
			title: 'Production',
			subSections: [
				{
					id: 21,
					title: 'Locations',
					rows: [
						{
							id: 211,
							item: 'Colorful Storyboard',
							price: 2000,
							units: 'units',
							quantity: 1,
							cost: 2000,
							surcharge: 10,
							cprice: 2200,
							ccost: 2200,
							range: 16,
						},
						{
							id: 212,
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
					id: 22,
					title: 'Sub Section 2',
					rows: [
						{
							id: 221,
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
							id: 222,
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
				}
			],
		},
		{
			id: 3,
			title: 'Creative',
			rows: [
				{
					id: 311,
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
					id: 312,
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
	]

	const [data, setData] = useState<tSection[]>(initialData);
	const handleRemoveItem = (row: TRow) => {
		setData((prevData) =>
			prevData.map(section => {
				if (section.rows && section.rows.some(item => item.id === row.id)) {
					return {
						...section,
						rows: section.rows.filter(item => item.id !== row.id),
					};
				} else if (section.subSections) {
					return {
						...section,
						subSections: section.subSections.map(subSection => {
							if (subSection.rows && subSection.rows.some(item => item.id === row.id)) {
								return {
									...subSection,
									rows: subSection.rows.filter(item => item.id !== row.id),
								};
							}
							return subSection;
						}),
					};
				}
				return section;
			})
		);
	};

	const handleAddItem = (sectionId: number, isSubSection: boolean) => {
		const newRow: TRow = {
			id: +new Date() % 10000,
			item: '',
			price: 0,
			units: '',
			quantity: 0,
			cost: 0,
			surcharge: 0,
			cprice: 0,
			ccost: 0,
			range: 0,
		};

		const addRowToSection = (section: tSection) => ({
			...section,
			rows: section.rows ? [...section.rows, newRow] : [newRow],
		});

		const addRowToSubSection = (subSection: tSubSection) => ({
			...subSection,
			rows: subSection.rows ? [...subSection.rows, newRow] : [newRow],
		});

		setData((prevData) =>
			prevData.map(section => {
				if (section.id === sectionId) {
					return addRowToSection(section);
				}
				if (section.subSections) {
					return {
						...section,
						subSections: section.subSections.map(subSection =>
							subSection.id === sectionId && isSubSection ? addRowToSubSection(subSection) : subSection
						),
					};
				}
				return section;
			})
		);
	};

	const handleAddSection = () => {
		let newSection: tSection = {
			id: +new Date() % 1000,
			title: 'New Section',
			rows: [],
		};

		setData(prevData => {
			return [...prevData, newSection];
		});
	};

	return (
		<main>
			<EstTable data={data}
				onRemoveItem={handleRemoveItem}
				onAddItem={handleAddItem}
				onAddSection={handleAddSection}
			/>
		</main>
	);
}

export default withAuth(withLayout<{}>(Estimation));
