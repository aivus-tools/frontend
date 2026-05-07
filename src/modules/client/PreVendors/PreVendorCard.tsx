import React, { useState } from 'react';
import { App, Button, Modal, Popover, Tooltip } from 'antd';
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
  EmailModalDescription,
  EmailModalPreview,
  PortfolioButton,
  SendBriefButton,
} from './styles';
import { buildMailto, MailtoPlan } from './buildMailto';

interface PreVendorCardProps {
  preVendor: PreVendor;
  briefTitle: string;
  shareUrl: string;
  vendorEmailHtml: string | null;
  sendDisabled: boolean;
  disabledPopoverContent?: React.ReactNode;
  disabledPopoverTitle?: React.ReactNode;
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy path
    }
  }
  if (typeof document === 'undefined') {
    return false;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
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
  const { message } = App.useApp();
  const [modalPlan, setModalPlan] = useState<MailtoPlan | null>(null);

  const plan = buildMailto({
    to: x.email,
    briefTitle: props.briefTitle,
    shareUrl: props.shareUrl,
    vendorEmailHtml: props.vendorEmailHtml,
  });

  const href = props.sendDisabled || plan.needsClipboard ? undefined : plan.fullUrl;

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (props.sendDisabled) {
      if (!props.disabledPopoverContent) {
        event.preventDefault();
      }
      return;
    }
    if (!plan.needsClipboard) {
      return;
    }
    event.preventDefault();
    void copyToClipboard(plan.body).then((success) => {
      if (!success) {
        message.error(t('PRE_VENDORS_EMAIL_COPY_FAILED'));
      }
    });
    setModalPlan(plan);
  };

  const handleCopyAgain = () => {
    if (!modalPlan) {
      return;
    }
    void copyToClipboard(modalPlan.body).then((success) => {
      if (success) {
        message.success(t('PRE_VENDORS_EMAIL_BODY_COPIED'));
      } else {
        message.error(t('PRE_VENDORS_EMAIL_COPY_FAILED'));
      }
    });
  };

  const handleOpenMail = () => {
    if (!modalPlan) {
      return;
    }
    window.open(modalPlan.shortUrl, '_blank', 'noopener,noreferrer');
    setModalPlan(null);
  };

  const sendButton = (
    <SendBriefButton
      $disabled={props.sendDisabled}
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      onClick={handleClick}
      aria-disabled={props.sendDisabled}
    >
      {t('PRE_VENDORS_SEND_BRIEF_BUTTON')}
    </SendBriefButton>
  );

  const renderSendButton = () => {
    if (!props.sendDisabled) {
      return sendButton;
    }
    if (props.disabledPopoverContent) {
      return (
        <Popover
          content={props.disabledPopoverContent}
          title={props.disabledPopoverTitle}
          trigger='click'
          placement='top'
        >
          {sendButton}
        </Popover>
      );
    }
    return <Tooltip title={t('PRE_VENDORS_SEND_BRIEF_DISABLED_HINT')}>{sendButton}</Tooltip>;
  };

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
        {renderSendButton()}
        {x.address ? (
          <CardAddress>
            <LocationIcon />
            <span>{x.address}</span>
          </CardAddress>
        ) : null}
      </CardFooter>

      <Modal
        open={modalPlan !== null}
        title={t('PRE_VENDORS_EMAIL_MODAL_TITLE')}
        onCancel={() => setModalPlan(null)}
        width={640}
        footer={[
          <Button key='close' onClick={() => setModalPlan(null)}>
            {t('PRE_VENDORS_EMAIL_MODAL_CLOSE')}
          </Button>,
          <Button key='copy' onClick={handleCopyAgain}>
            {t('PRE_VENDORS_EMAIL_MODAL_COPY_AGAIN')}
          </Button>,
          <Button key='open' type='primary' onClick={handleOpenMail}>
            {t('PRE_VENDORS_EMAIL_MODAL_OPEN')}
          </Button>,
        ]}
      >
        <EmailModalDescription>{t('PRE_VENDORS_EMAIL_MODAL_DESCRIPTION')}</EmailModalDescription>
        <EmailModalPreview>{modalPlan?.body ?? ''}</EmailModalPreview>
      </Modal>
    </Card>
  );
};
