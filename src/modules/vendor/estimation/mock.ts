import { Category, Entry } from './types';

export const CATEGORIES: Category[] = [
	{
		id: 1,
		name: 'Creative DEVELOPMENT',
	},
	{
		id: 2,
		name: 'PRE-PRODUCTION',
	},
	{
		id: 3,
		name: 'PRODUCTION',
	},
	{
		id: 4,
		name: 'Equipment',
		parentCategoryId: 3,
	},
	{
		id: 5,
		name: 'Vehicles',
		parentCategoryId: 3,
	},
	{
		id: 6,
		name: 'Team',
		parentCategoryId: 3,
	},
];

export const ENTRIES: Entry[] = [
	{
		id: 1,
		name: 'Concept Development',
		categoryId: 1,
	},
	{
		id: 2,
		name: 'KV Development',
		categoryId: 1,
	},
	{
		id: 3,
		name: 'Scriptwriting',
		categoryId: 1,
	},
	{
		id: 4,
		name: 'Storyboard',
		categoryId: 1,
		variants: [
			{
				id: 1,
				label: 'Line Drawing',
			},
			{
				id: 2,
				label: 'Detailed Black and White',
			},
			{
				id: 3,
				label: 'Colorized Storyboard',
			},
			{
				id: 4,
				label: 'Highly Detailed Color Storyboard',
			},
		],
	},
	{
		id: 5,
		name: 'Animatic',
		categoryId: 1,
	},
	{
		id: 6,
		name: 'Cast talent',
		categoryId: 2,
	},
	{
		id: 7,
		name: 'Scout locations',
		categoryId: 2,
	},
	{
		id: 8,
		name: 'Gear prep day',
		categoryId: 2,
	},
	{
		id: 9,
		name: "Director's Treatment",
		categoryId: 2,
	},
	{
		id: 10,
		name: 'Camera',
		categoryId: 4,
	},
	{
		id: 11,
		name: 'Lenses',
		categoryId: 4,
	},
	{
		id: 12,
		name: 'Monitors',
		categoryId: 4,
	},
	{
		id: 13,
		name: 'Additional Camera Accessories',
		categoryId: 4,
	},
	{
		id: 14,
		name: 'Drones',
		categoryId: 4,
	},
	{
		id: 15,
		name: 'Dolly',
		categoryId: 4,
	},
	{
		id: 16,
		name: 'Cranes & Jibs',
		categoryId: 4,
	},
	{
		id: 17,
		name: 'Stabilizers and Gimbals',
		categoryId: 4,
	},
	{
		id: 18,
		name: 'Sliders',
		categoryId: 4,
	},
	{
		id: 19,
		name: 'Motion control system',
		categoryId: 4,
	},
	{
		id: 20,
		name: 'Lighting',
		categoryId: 4,
	},
	{
		id: 21,
		name: 'Electric Generators',
		categoryId: 4,
	},
	{
		id: 22,
		name: 'Sound Recording Equipment',
		categoryId: 4,
	},
	{
		id: 23,
		name: 'Teleprompter',
		categoryId: 4,
	},
	{
		id: 24,
		name: 'Walkie Talkie',
		categoryId: 4,
	},
	{
		id: 25,
		name: 'Camera Truck',
		categoryId: 5,
	},
	{
		id: 26,
		name: 'Grip/Lighting Truck',
		categoryId: 5,
	},
	{
		id: 27,
		name: 'Makeup Trailer',
		categoryId: 5,
	},
	{
		id: 28,
		name: 'Wardrobe Trailer',
		categoryId: 5,
	},
	{
		id: 29,
		name: 'Talent Trailer',
		categoryId: 5,
	},
	{
		id: 30,
		name: 'Catering Truck',
		categoryId: 5,
	},
	{
		id: 31,
		name: 'Production Office Trailer',
		categoryId: 5,
	},
	{
		id: 32,
		name: 'Tech Truck',
		categoryId: 5,
	},
	{
		id: 33,
		name: 'Props Truck',
		categoryId: 5,
	},
	{
		id: 34,
		name: 'Portable Toilet',
		categoryId: 5,
	},
	{
		id: 35,
		name: 'Director',
		categoryId: 6,
	},
	{
		id: 36,
		name: 'Director Assistant',
		categoryId: 6,
	},
];
