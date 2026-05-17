import styles from '../estimation.module.css';

export const RowLine = () => (
  <>
    <div style={{ backgroundColor: 'var(--white)' }} />
    <div className={styles.line} style={{ gridColumn: 'span 5' }} />
    <div style={{ backgroundColor: 'var(--white)' }} />
    <div />
    <div style={{ backgroundColor: 'var(--white)' }} />
    <div className={styles.line} style={{ gridColumn: 'span 4' }} />
  </>
);
