import Image from 'next/image';

import { t } from '@/lib/i18n';

export const ProfileImage = ({ url }: { url: string }) => {
  return <Image width={32} height={32} src={url} alt={t('PROFILE_IMAGE')} />;
};
