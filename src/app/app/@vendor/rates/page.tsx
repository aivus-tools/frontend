import { RateTable } from '@/modules/vendor/rates/RateTable';

import styles from './page.module.css';

export default function Page() {
  return (
    <div className={styles.rates}>
      <RateTable />
    </div>
  );
}
