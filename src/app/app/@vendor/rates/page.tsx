import { t } from '@/lib/i18n';
import { RateTable } from '@/app/app/@vendor/rates/_components/RateTable/RateTable';

export default function Page() {
  return (
    <div>
      <h1>{t('RATES')}</h1>
      <RateTable />
    </div>
  );
}
