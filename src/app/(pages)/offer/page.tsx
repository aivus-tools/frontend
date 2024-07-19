'use client';
import styles from "./page.module.css";
import withLayout from '@/app/layout/Layout';
import withAuth from '@/app/layout/withAuth/withAuth';

const Offer = () => {
	return (
		<main>
			<h1>Client's Offer Page</h1>
		</main>
	);
}

export default withAuth(withLayout<{}>(Offer));
