'use client';
import withLayout from '@/layout/Layout';
import withAuth from '@/layout/withAuth/withAuth';

const Offer = () => {
	return (
		<main>
			<h1>{"Client's Offer Page"}</h1>
		</main>
	);
};

export default withAuth(withLayout(Offer));
