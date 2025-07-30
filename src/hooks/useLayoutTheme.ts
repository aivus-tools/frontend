import { usePathname } from 'next/navigation';

export const useLayoutTheme = () => {
  const pathname = usePathname();
  const isRoot = (pathname?.split('/').length ?? 0) <= 3;

  return isRoot ? 'dark' : 'light';
};
