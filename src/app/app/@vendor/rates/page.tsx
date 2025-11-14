import { RateTable } from '@/app/app/@vendor/rates/_components/RateTable/RateTable';

import styles from './page.module.css';

export default function Page() {
  return (
    <div className={styles.rates}>
      <RateTable />
    </div>
  );
}
