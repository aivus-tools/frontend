import styles from './styles.module.css';
import { Button } from '@/components';
import { signIn } from '@/auth';

/**
 * check configuration https://authjs.dev/getting-started/providers/google#configuration
 */
export async function Google() {
	return (
		<form
			action={async () => {
				'use server';
				await signIn('google', { callbackUrl: 'http://localhost:3000/app/dashboard' });
			}}
		>
			<Button className={styles.authButton} color='transparent'>
				<div className={styles.icon}>
					<svg width='20' height='20' viewBox='0 0 19 19' fill='none' xmlns='http://www.w3.org/2000/svg'>
						<path
							d='M18.1999 9.71255C18.1999 9.11322 18.1419 8.49455 18.0453 7.91455H9.67395V11.3365H14.4686C14.2753 12.4385 13.6373 13.4052 12.6899 14.0239L15.5513 16.2472C17.2333 14.6812 18.1999 12.3999 18.1999 9.71255Z'
							fill='#4280EF'
						></path>
						<path
							d='M9.67398 18.374C12.0713 18.374 14.082 17.5814 15.5513 16.228L12.69 14.024C11.8973 14.5654 10.8726 14.8747 9.67398 14.8747C7.35398 14.8747 5.40131 13.3087 4.68598 11.2207L1.74731 13.4827C3.25531 16.4794 6.30998 18.374 9.67398 18.374Z'
							fill='#34A353'
						></path>
						<path
							d='M4.68598 11.2011C4.31864 10.0991 4.31864 8.90042 4.68598 7.79842L1.74731 5.51709C0.490643 8.03042 0.490643 10.9884 1.74731 13.4824L4.68598 11.2011Z'
							fill='#F6B704'
						></path>
						<path
							d='M9.67398 4.14449C10.9306 4.12516 12.168 4.60849 13.0766 5.47849L15.6093 2.92649C14.0046 1.41849 11.878 0.606492 9.67398 0.625826C6.30998 0.625826 3.25531 2.52049 1.74731 5.51716L4.68598 7.79849C5.40131 5.69116 7.35398 4.14449 9.67398 4.14449Z'
							fill='#E54335'
						></path>
					</svg>
				</div>
				Sign in with Google
			</Button>
		</form>
	);
}
