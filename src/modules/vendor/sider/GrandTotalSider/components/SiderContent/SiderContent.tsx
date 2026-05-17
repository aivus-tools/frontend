import styles from './SiderContent.module.css';
import { SiderContentProps } from './SiderContent.props';
import cn from 'classnames';

export const SiderContent = (props: SiderContentProps) => {
  const { children, className, ...rest } = props;
  return (
    <div className={cn(styles.siderContent, className)} {...rest}>
      {children}
    </div>
  );
};
