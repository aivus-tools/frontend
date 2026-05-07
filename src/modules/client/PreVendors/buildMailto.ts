import { t } from '@/lib/i18n';

const MAILTO_URL_SAFE_LIMIT = 1800;

interface BuildMailtoInput {
  to: string;
  briefTitle: string;
  shareUrl: string;
  vendorEmailHtml: string | null;
}

export interface MailtoPlan {
  fullUrl: string;
  shortUrl: string;
  body: string;
  needsClipboard: boolean;
}

export function buildMailto(input: BuildMailtoInput): MailtoPlan {
  const extracted = extractSubjectAndBody(input.vendorEmailHtml ?? '');
  const subject = extracted.subject || input.briefTitle.trim() || t('PRE_VENDORS_EMAIL_DEFAULT_SUBJECT');
  const fullBody = composeBody(extracted.bodyHtml, input.shareUrl);
  const fullUrl = `mailto:${input.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullBody)}`;
  const shortUrl = `mailto:${input.to}?subject=${encodeURIComponent(subject)}`;
  return {
    fullUrl,
    shortUrl,
    body: fullBody,
    needsClipboard: fullUrl.length > MAILTO_URL_SAFE_LIMIT,
  };
}

function extractSubjectAndBody(html: string): { subject: string | null; bodyHtml: string } {
  if (!html.trim()) {
    return { subject: null, bodyHtml: '' };
  }
  const match = html.match(/<\s*h1[^>]*>([\s\S]*?)<\/\s*h1\s*>/i);
  if (!match) {
    return { subject: null, bodyHtml: html };
  }
  const inner = match[1].replace(/<[^>]+>/g, '');
  const subject = decodeHtmlEntities(inner).trim();
  const bodyHtml = (html.slice(0, match.index) + html.slice((match.index ?? 0) + match[0].length)).trim();
  return { subject: subject || null, bodyHtml };
}

function composeBody(vendorEmailHtml: string, shareUrl: string): string {
  const text = htmlToMailText(vendorEmailHtml);
  if (!text) {
    return t('PRE_VENDORS_EMAIL_BODY', shareUrl);
  }
  const withoutSubject = stripLeadingSubjectLine(text);
  return `${withoutSubject}\n\n${shareUrl}`;
}

function htmlToMailText(html: string): string {
  if (!html.trim()) {
    return '';
  }
  let result = html
    .replace(/\r\n?/g, '\n')
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote|pre|section|article|header|footer)\s*>/gi, '\n\n')
    .replace(/<\s*li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '');
  result = decodeHtmlEntities(result);
  result = result.replace(/\n[ \t]+/g, '\n').replace(/[ \t]+\n/g, '\n');
  result = result.replace(/\n{3,}/g, '\n\n').trim();
  return result;
}

function decodeHtmlEntities(text: string): string {
  if (typeof document === 'undefined') {
    return text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  const temp = document.createElement('textarea');
  temp.innerHTML = text;
  return temp.value;
}

function stripLeadingSubjectLine(text: string): string {
  const lines = text.split('\n');
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') {
    i += 1;
  }
  if (i >= lines.length || !/^subject\s*:\s*/i.test(lines[i])) {
    return text;
  }
  i += 1;
  while (i < lines.length && lines[i].trim() === '') {
    i += 1;
  }
  return lines.slice(i).join('\n');
}
