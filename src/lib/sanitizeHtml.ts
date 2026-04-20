import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'span',
  'div',
  'br',
  'hr',
  'strong',
  'em',
  'u',
  's',
  'b',
  'i',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'code',
  'pre',
];

const ALLOWED_ATTR = ['href', 'title', 'target', 'rel', 'class', 'colspan', 'rowspan'];

export const sanitizeHtml = (dirty: string | null | undefined): string => {
  if (!dirty) {
    return '';
  }
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'srcdoc'],
    ALLOW_DATA_ATTR: false,
  });
};
