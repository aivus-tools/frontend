import styles from './PriceBlock.module.css';
import cn from 'classnames';
import { formatPrice } from '@/helpers/helper';
import { PriceBlockProps } from './PriceBlock.props';

export const PriceBlock = ({
  title,
  amount,
  highlight = false,
  percentDiff = null,
  percentPositive = true,
  children,
  className,
  ...props
}: PriceBlockProps) => {
  return (
    <div className={cn(styles.counter, className)} {...props}>
      <div className={styles.title}>{title}</div>
      <div
        className={cn(styles.count, {
          [styles.primary]: highlight,
        })}
      >
        <div className={cn(styles.currency)}>$</div>
        <div className={cn(styles.num)}>{formatPrice(amount)}</div>
      </div>
      {percentDiff !== null && (
        <div className={cn(styles.percentBadge, percentPositive ? styles.percentPositive : styles.percentNegative)}>
          {percentPositive ? '↑' : '↓'}{' '}
          {percentDiff.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %
        </div>
      )}
      {children && <div className={cn(styles.item)}>{children}</div>}
    </div>
  );
};
