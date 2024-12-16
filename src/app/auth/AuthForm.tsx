import styles from './styles.module.css';
import LogoIcon from '@/icons/aivus-logo.svg';
import { Google } from '@/components/Auth/Google';
// import { Apple } from '@/components/Auth/Apple';
import { ManageAuth } from './components/ManageAuth';

export function AuthForm() {
	return (
		<main className={styles.main}>
			<div className={styles.container}>
				<h1 className={styles.heading}>
					<LogoIcon />
				</h1>
				<ManageAuth />
				<p className={styles.text}>An account will be created upon verification if you do not have one.</p>
				<div className={styles.divider}>OR</div>
				<div className={styles.buttonGroup}>
					<Google />
					{/* <Apple /> */}
				</div>
				<div className={styles.text}>
					<span>
						By signing up, you are agreeing to our <a href='#'>Terms of Service</a> and <a href='#'>Privacy Policy</a>.
					</span>
				</div>
			</div>
		</main>
	);
}
