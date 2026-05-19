import { t } from '@/lib/i18n';
import { BriefList } from './_components/BriefList/BriefList';

import styles from './page.module.css';

export default function Page() {
  return (
    <>
      <h1 className={styles.pageTitle}>{t('MY_PROJECTS_TITLE')}</h1>
      <BriefList />
    </>
  );
}
