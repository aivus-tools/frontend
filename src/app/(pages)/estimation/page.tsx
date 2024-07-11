'use client'
import styles from "./page.module.css";
import withLayout from '@/app/layout/Layout';
import withAuth from '@/app/layout/withAuth/withAuth';


const Estimation = () => {

	return (
		<main>
			<h1>Estimation Page</h1>
		</main>
	);
}

export default withAuth(withLayout<{}>(Estimation));
