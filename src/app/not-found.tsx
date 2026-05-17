import type { Metadata } from 'next';
import { NotFound } from '@/components/NotFound';

export const metadata: Metadata = {
  title: 'Page not found | Aivus',
};

export default function NotFoundPage() {
  return <NotFound />;
}
