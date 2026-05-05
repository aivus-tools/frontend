import React from 'react';
import { Tooltip } from 'antd';
import { t } from '@/lib/i18n';
import { PreVendor } from '@/types/preVendor.interface';
import {
  Card,
  CardAddress,
  CardBody,
  CardCategory,
  CardDescription,
  CardFooter,
  CardLogo,
  CardLogoFallback,
  CardRank,
  CardTitle,
  CardTop,
  CardTopSpacer,
  CardTopText,
  PortfolioButton,
  SendBriefButton,
} from './styles';
import { buildMailto } from './buildMailto';

interface PreVendorCardProps {
  preVendor: PreVendor;
  briefTitle: string;
  shareUrl: string;
  sendDisabled: boolean;
}

const LocationIcon: React.FC = () => {
  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
      <path
        d='M8 1.333c-2.578 0-4.667 2.09-4.667 4.667 0 3.222 4.667 8.667 4.667 8.667S12.667 9.222 12.667 6c0-2.578-2.089-4.667-4.667-4.667Zm0 6.334a1.667 1.667 0 1 1 0-3.334 1.667 1.667 0 0 1 0 3.334Z'
        fill='#1a1a1a'
      />
    </svg>
  );
};

export const PreVendorCard: React.FC<PreVendorCardProps> = (props) => {
  const x = props.preVendor;
  const mailto = buildMailto({
    to: x.email,
    briefTitle: props.briefTitle,
    shareUrl: props.shareUrl,
  });

  const sendButton = (
    <SendBriefButton
      $disabled={props.sendDisabled}
      href={props.sendDisabled ? undefined : mailto}
      onClick={props.sendDisabled ? (event) => event.preventDefault() : undefined}
      aria-disabled={props.sendDisabled}
    >
      {t('PRE_VENDORS_SEND_BRIEF_BUTTON')}
    </SendBriefButton>
  );

  return (
    <Card>
      <CardTop>
        {x.logoUrl ? (
          <CardLogo>
            <img src={x.logoUrl} alt={x.title} />
          </CardLogo>
        ) : (
          <CardLogoFallback>{x.title.slice(0, 2).toUpperCase()}</CardLogoFallback>
        )}
        <CardTopText>
          {x.rankLabel ? <CardRank>{x.rankLabel}</CardRank> : null}
          {x.categoryLabel ? <CardCategory>{x.categoryLabel}</CardCategory> : null}
        </CardTopText>
        <CardTopSpacer />
        {x.portfolioUrl ? (
          <PortfolioButton href={x.portfolioUrl} target='_blank' rel='noopener noreferrer'>
            {t('PRE_VENDORS_PORTFOLIO_LABEL')} ↗
          </PortfolioButton>
        ) : null}
      </CardTop>

      <CardBody>
        <CardTitle>{x.title}</CardTitle>
        <CardDescription>{x.shortDescription}</CardDescription>
      </CardBody>

      <CardFooter>
        {props.sendDisabled ? (
          <Tooltip title={t('PRE_VENDORS_SEND_BRIEF_DISABLED_HINT')}>{sendButton}</Tooltip>
        ) : (
          sendButton
        )}
        {x.address ? (
          <CardAddress>
            <LocationIcon />
            <span>{x.address}</span>
          </CardAddress>
        ) : null}
      </CardFooter>
    </Card>
  );
};
