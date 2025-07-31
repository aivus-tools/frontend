import { logout } from '@/auth/actions/logout';
import { Button } from 'antd';
import { t } from '@/lib/i18n';

export default async function Page() {
  return (
    <div>
      <Button onClick={logout}>{t('LOGOUT')}</Button>
    </div>
  );
}
