import React, { forwardRef } from 'react';
import { getLocale, t, tRich } from '@/lib/i18n';
import { PreVendor } from '@/types/preVendor.interface';
import { PreVendorCard } from './PreVendorCard';
import { RatingRunetaLogo } from './RatingRunetaLogo';

import styles from './PreVendorsBlock.module.css';

interface PreVendorsBlockProps {
  preVendors: PreVendor[];
  briefTitle: string;
  shareUrl: string;
  vendorEmailHtml: string | null;
  sendDisabled: boolean;
  disabledPopoverContent?: React.ReactNode;
  disabledPopoverTitle?: React.ReactNode;
}

export const PreVendorsBlock = forwardRef<HTMLElement, PreVendorsBlockProps>((props, ref) => {
  if (props.preVendors.length === 0) {
    return null;
  }

  const isRu = getLocale() === 'ru';
  const methodologyUrl = t('PRE_VENDORS_METHODOLOGY_URL');

  return (
    <section ref={ref} className={styles.section}>
      {isRu ? (
        <>
          <div className={styles.headerTop}>
            <div className={styles.headerLogo}>
              <RatingRunetaLogo variant='header' height={26} />
            </div>
            <h2 className={styles.headerTitle}>{t('PRE_VENDORS_BLOCK_TITLE')}</h2>
          </div>
          <div className={styles.headerTextBlock}>
            <p className={styles.headerHeading}>{t('PRE_VENDORS_RATING_HEADING')}</p>
            <p className={styles.headerDescription}>
              {tRich('PRE_VENDORS_RATING_DESCRIPTION', {
                a: <a href={methodologyUrl} target='_blank' rel='noopener noreferrer' />,
              })}
            </p>
          </div>
        </>
      ) : (
        <h2 className={styles.simpleHeader}>{t('PRE_VENDORS_BLOCK_TITLE')}</h2>
      )}

      <div className={styles.grid}>
        {props.preVendors.map((x) => (
          <PreVendorCard
            key={x.id}
            preVendor={x}
            briefTitle={props.briefTitle}
            shareUrl={props.shareUrl}
            vendorEmailHtml={props.vendorEmailHtml}
            sendDisabled={props.sendDisabled}
            disabledPopoverContent={props.disabledPopoverContent}
            disabledPopoverTitle={props.disabledPopoverTitle}
          />
        ))}
      </div>
    </section>
  );
});

PreVendorsBlock.displayName = 'PreVendorsBlock';
