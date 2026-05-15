'use client';

import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { ExperimentOutlined, CloseOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { media } from '@/styles/breakpoints';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useBetaFooter } from './BetaFooterContext';

export const BETA_FOOTER_HEIGHT = 84;
export const BETA_FOOTER_HEIGHT_MOBILE = 96;

export const useBetaFooterHeight = (): number => {
  const { isMobile } = useBreakpoint();
  return isMobile ? BETA_FOOTER_HEIGHT_MOBILE : BETA_FOOTER_HEIGHT;
};

interface BetaFooterProps {
  variant?: 'compact' | 'full';
  className?: string;
}

const Wrapper = styled.footer<{ $variant: 'compact' | 'full' }>`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  width: 100%;
  box-sizing: border-box;
  padding: ${(x) => (x.$variant === 'compact' ? '10px 20px' : '14px 24px')};
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #fff4ef 0%, #fff0f6 55%, #f4edff 100%);
  border-top: 1px solid rgba(253, 130, 88, 0.2);
  backdrop-filter: saturate(160%);
  font-family: 'Montserrat', sans-serif;
  color: #4b5675;
  box-shadow: 0 -6px 20px rgba(124, 58, 237, 0.08);

  ${media.mobile} {
    padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 0px));
    gap: 10px;
  }
`;

const CloseBtn = styled.button`
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid rgba(124, 58, 237, 0.25);
  background: rgba(255, 255, 255, 0.75);
  color: #7c3aed;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease;

  &:hover {
    background: #ffffff;
    transform: scale(1.05);
  }

  ${media.mobile} {
    width: 32px;
    height: 32px;
  }
`;

const IconBubble = styled.div`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fd8258 0%, #ff5c9c 55%, #7c3aed 100%);
  color: #ffffff;
  font-size: 18px;
  box-shadow: 0 6px 14px rgba(253, 130, 88, 0.3);

  ${media.mobile} {
    width: 30px;
    height: 30px;
    font-size: 15px;
  }
`;

const Text = styled.div`
  flex: 1;
  min-width: 0;
  font-size: 12px;
  line-height: 1.55;

  ${media.mobile} {
    font-size: 11px;
    line-height: 1.45;
  }
`;

const Title = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2px;
  background: linear-gradient(135deg, #fd8258, #ff5c9c, #7c3aed);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;

  ${media.mobile} {
    font-size: 12px;
  }
`;

export const BetaFooter: React.FC<BetaFooterProps> = (props) => {
  const variant = props.variant ?? 'full';
  const [mounted, setMounted] = useState(false);
  const { dismissed, dismiss } = useBetaFooter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    dismiss();
  };

  return (
    <Wrapper $variant={variant} className={props.className}>
      <IconBubble>
        <ExperimentOutlined />
      </IconBubble>
      <Text>
        <Title>{t('BETA_FOOTER_TITLE')}</Title>
        <div>{t('BETA_FOOTER_BODY')}</div>
        <div style={{ marginTop: 4 }}>{t('BETA_FOOTER_FEEDBACK')}</div>
      </Text>
      <CloseBtn aria-label='dismiss' onClick={handleDismiss}>
        <CloseOutlined style={{ fontSize: 12 }} />
      </CloseBtn>
    </Wrapper>
  );
};
