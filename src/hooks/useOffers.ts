import { OFFERS } from '@/modules/vendor/estimation/mock';
import { OfferData } from '@/modules/vendor/estimation/types';
import { useEffect, useState } from 'react';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useOffers = () => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<null | OfferData[]>(null);

	const fetchData = async () => {
		setLoading(true);
		await delay(1000);
		setData(OFFERS);
		setLoading(false);
	};

	useEffect(() => {
		fetchData();
	}, []);

	return { loading, data };
};
