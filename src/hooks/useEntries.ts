import { ENTRIES } from '@/modules/vendor/estimation/mock';
import { Entry } from '@/modules/vendor/estimation/types';
import { useEffect, useState } from 'react';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useEntries = () => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<null | Entry[]>(null);

	const fetchData = async () => {
		setLoading(true);
		await delay(1000);
		setData(ENTRIES);
		setLoading(false);
	};

	useEffect(() => {
		fetchData();
	}, []);

	return { loading, data };
};
