import { t } from '@/lib/i18n';
import styles from './SidebarHeader.module.css';

export const SidebarHeader = () => {
  return <div className={styles.title}>{t('DESCRIPTION')}</div>;
};
