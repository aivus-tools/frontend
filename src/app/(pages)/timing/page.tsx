'use client';
import withLayout from '@/layout/Layout';
import withAuth from '@/layout/withAuth/withAuth';

const Timing = () => {
	return (
		<main>
			<h1>Timing Page</h1>
		</main>
	);
};

export default withAuth(withLayout(Timing));
