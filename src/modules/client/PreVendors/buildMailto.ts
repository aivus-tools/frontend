import { t } from '@/lib/i18n';

interface BuildMailtoInput {
  to: string;
  briefTitle: string;
  shareUrl: string;
}

export function buildMailto(input: BuildMailtoInput): string {
  const subject = input.briefTitle;
  const body = t('PRE_VENDORS_EMAIL_BODY', input.shareUrl);
  return `mailto:${input.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
