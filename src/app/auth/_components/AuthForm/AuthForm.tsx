import styles from './styles.module.css';
import LogoIcon from '@/icons/aivus-logo.svg';
import { Google } from '@/components/Auth/Google';
import { ManageAuth } from './components/MangeAuth/ManageAuth';
import { t } from '@/lib/i18n';

export function AuthForm() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.heading}>
          <LogoIcon />
        </h1>
        <ManageAuth />
        <p className={styles.text}>{t('ACCOUNT_CREATION_INFO')}</p>
        <div className={styles.divider}>{t('OR')}</div>
        <div className={styles.buttonGroup}>
          <Google />
        </div>
        <div className={styles.text}>
          <span>
            {t('TERMS_AGREEMENT')} <a href='#'>{t('TERMS_OF_SERVICE')}</a> {t('AND')}{' '}
            <a href='#'>{t('PRIVACY_POLICY')}</a>.
          </span>
        </div>
      </div>
    </main>
  );
}
