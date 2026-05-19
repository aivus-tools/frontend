import { Spin } from 'antd';
import styles from './PageSpinner.module.css';

export const PageSpinner = () => {
  return (
    <div className={styles.wrapper}>
      <Spin spinning />
    </div>
  );
};
