import { OFFER_DETAILS } from '@/modules/vendor/estimation/mock';
import { OfferDetails } from '@/modules/vendor/estimation/types';
import { useEffect, useState } from 'react';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useOffers = () => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<null | OfferDetails>(null);

	const fetchData = async () => {
		setLoading(true);
		await delay(1000);
		setData(OFFER_DETAILS);
		setLoading(false);
	};

	useEffect(() => {
		fetchData();
	}, []);

	return { loading, data };
};
