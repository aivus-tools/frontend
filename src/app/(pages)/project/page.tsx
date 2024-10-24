'use client';
import withLayout from '@/layout/Layout';
import withAuth from '@/layout/withAuth/withAuth';

const Project = () => {
	return (
		<main>
			<h1>Project Details Page</h1>
		</main>
	);
};

export default withAuth(withLayout(Project));
