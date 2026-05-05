import React, { forwardRef } from 'react';
import { getLocale, t, tRich } from '@/lib/i18n';
import { PreVendor } from '@/types/preVendor.interface';
import { PreVendorCard } from './PreVendorCard';
import { RatingRunetaLogo } from './RatingRunetaLogo';
import {
  Grid,
  HeaderDescription,
  HeaderHeading,
  HeaderLogo,
  HeaderTextBlock,
  HeaderTitle,
  HeaderTop,
  Section,
  SimpleHeader,
} from './styles';

interface PreVendorsBlockProps {
  preVendors: PreVendor[];
  briefTitle: string;
  shareUrl: string;
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
    <Section ref={ref}>
      {isRu ? (
        <>
          <HeaderTop>
            <HeaderLogo>
              <RatingRunetaLogo variant='header' height={26} />
            </HeaderLogo>
            <HeaderTitle>{t('PRE_VENDORS_BLOCK_TITLE')}</HeaderTitle>
          </HeaderTop>
          <HeaderTextBlock>
            <HeaderHeading>{t('PRE_VENDORS_RATING_HEADING')}</HeaderHeading>
            <HeaderDescription>
              {tRich('PRE_VENDORS_RATING_DESCRIPTION', {
                a: <a href={methodologyUrl} target='_blank' rel='noopener noreferrer' />,
              })}
            </HeaderDescription>
          </HeaderTextBlock>
        </>
      ) : (
        <SimpleHeader>{t('PRE_VENDORS_BLOCK_TITLE')}</SimpleHeader>
      )}

      <Grid>
        {props.preVendors.map((x) => (
          <PreVendorCard
            key={x.id}
            preVendor={x}
            briefTitle={props.briefTitle}
            shareUrl={props.shareUrl}
            sendDisabled={props.sendDisabled}
            disabledPopoverContent={props.disabledPopoverContent}
            disabledPopoverTitle={props.disabledPopoverTitle}
          />
        ))}
      </Grid>
    </Section>
  );
});

PreVendorsBlock.displayName = 'PreVendorsBlock';
