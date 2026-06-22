import styles from './VersionTag.module.css';

interface VersionTagProps {
  theme?: 'light' | 'dark';
}

export const VersionTag = (props: VersionTagProps) => {
  const sha = process.env.NEXT_PUBLIC_GIT_COMMIT?.slice(0, 7) ?? 'dev';
  const themeClass = props.theme === 'dark' ? styles.dark : styles.light;

  return (
    <span className={`${styles.root} ${themeClass}`} data-theme={props.theme ?? 'light'}>
      {sha}
    </span>
  );
};
