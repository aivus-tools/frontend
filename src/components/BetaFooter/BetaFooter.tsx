'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ExperimentOutlined, CloseOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useBetaFooter } from './BetaFooterContext';

import styles from './BetaFooter.module.css';

export const BETA_FOOTER_HEIGHT = 84;
export const BETA_FOOTER_HEIGHT_MOBILE = 96;

export const useBetaFooterHeight = (): number => {
  const { isMobile } = useBreakpoint();
  const { measuredHeight } = useBetaFooter();
  if (measuredHeight != null && measuredHeight > 0) {
    return measuredHeight;
  }
  return isMobile ? BETA_FOOTER_HEIGHT_MOBILE : BETA_FOOTER_HEIGHT;
};

interface BetaFooterProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const BetaFooter = (props: BetaFooterProps) => {
  const variant = props.variant ?? 'full';
  const [mounted, setMounted] = useState(false);
  const { dismissed, dismiss, setMeasuredHeight } = useBetaFooter();
  const footerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const element = footerRef.current;
    if (!element || dismissed) {
      setMeasuredHeight(null);
      return;
    }

    const updateHeight = () => {
      setMeasuredHeight(Math.ceil(element.getBoundingClientRect().height));
    };
    updateHeight();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => {
      observer.disconnect();
      setMeasuredHeight(null);
    };
  }, [dismissed, mounted, setMeasuredHeight]);

  if (!mounted || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    dismiss();
  };

  const variantClassName = variant === 'compact' ? styles.variantCompact : styles.variantFull;
  const wrapperClassName = [styles.wrapper, variantClassName, props.className].filter(Boolean).join(' ');

  return (
    <footer ref={footerRef} className={wrapperClassName}>
      <div className={styles.iconBubble}>
        <ExperimentOutlined />
      </div>
      <div className={styles.text}>
        <div className={styles.title}>{t('BETA_FOOTER_TITLE')}</div>
        <div>{t('BETA_FOOTER_BODY')}</div>
        <div className={styles.feedback}>{t('BETA_FOOTER_FEEDBACK')}</div>
      </div>
      <button type='button' className={styles.closeButton} aria-label='dismiss' onClick={handleDismiss}>
        <CloseOutlined className={styles.closeIcon} />
      </button>
    </footer>
  );
};
