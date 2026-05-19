import { t } from '@/lib/i18n';
import { ProjectList } from './_components/project-list';

import styles from './page.module.css';

export default function Page() {
  return (
    <>
      <h1 className={styles.pageTitle}>{t('MY_PROJECTS_TITLE')}</h1>
      <ProjectList />
    </>
  );
}
