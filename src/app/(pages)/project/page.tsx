'use client';
import styles from "./page.module.css";
import withLayout from '@/app/layout/Layout';
import withAuth from '@/app/layout/withAuth/withAuth';

const Project = () => {
	return (
		<main>
			<h1>Project Details Page</h1>
		</main>
	);
}

export default withAuth(withLayout<{}>(Project));
