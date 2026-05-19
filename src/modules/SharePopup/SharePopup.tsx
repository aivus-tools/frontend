'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Input, Button, Switch, Avatar, Popconfirm, Skeleton } from 'antd';
import { CopyOutlined, CheckOutlined, UserOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { useCreateShareMutation, useGetShareByOfferIdQuery, useUpdateShareMutation } from '@/services/client/sharesApi';

import styles from './SharePopup.module.css';

interface SharePopupProps {
  open: boolean;
  onClose: () => void;
  offerId: string;
  ownerName?: string;
  ownerAvatar?: string;
}

export const SharePopup = (props: SharePopupProps) => {
  const { open, onClose, offerId, ownerName, ownerAvatar } = props;
  const [copied, setCopied] = useState(false);
  const [createShare, { isLoading: isCreating }] = useCreateShareMutation();
  const [updateShare] = useUpdateShareMutation();
  const {
    data: existingShare,
    isLoading: isLoadingShare,
    error: shareError,
  } = useGetShareByOfferIdQuery(offerId, {
    skip: !open || !offerId,
  });

  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [hasError, setHasError] = useState(false);
  const createGuardRef = useRef(false);

  useEffect(() => {
    if (existingShare) {
      setShareToken(existingShare.token);
      setIsActive(existingShare.isActive);
    }
  }, [existingShare]);

  useEffect(() => {
    const is404 = shareError && 'status' in shareError && shareError.status === 404;
    if (open && !existingShare && !isLoadingShare && !shareToken && !createGuardRef.current && (!shareError || is404)) {
      createGuardRef.current = true;
      createShare({ offerId })
        .unwrap()
        .then((share) => {
          setShareToken(share.token);
          setIsActive(share.isActive);
        })
        .catch(() => {
          setHasError(true);
        })
        .finally(() => {
          createGuardRef.current = false;
        });
    }
  }, [open, existingShare, isLoadingShare, shareToken, shareError, offerId, createShare]);

  useEffect(() => {
    if (!open) {
      setShareToken(null);
      setIsActive(null);
      setHasError(false);
      setCopied(false);
      createGuardRef.current = false;
    }
  }, [open]);

  const shareUrl = useMemo(
    () => (shareToken && typeof window !== 'undefined' ? `${window.location.origin}/public/${shareToken}` : ''),
    [shareToken]
  );

  const handleCopy = useCallback(async () => {
    if (!shareUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const handleToggle = useCallback(
    async (checked: boolean) => {
      if (!shareToken) {
        return;
      }
      setIsActive(checked);
      try {
        await updateShare({ token: shareToken, isActive: checked }).unwrap();
      } catch {
        setIsActive(!checked);
      }
    },
    [shareToken, updateShare]
  );

  const handleToggleOff = useCallback(() => {
    handleToggle(false);
  }, [handleToggle]);

  const activeState = isActive ?? existingShare?.isActive ?? true;
  const isLoading = isLoadingShare || isCreating;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={520}
      styles={{
        body: { padding: '32px' },
        mask: { background: 'rgba(18, 27, 62, 0.45)' },
      }}
      destroyOnClose
    >
      <h2 className={styles.title}>{t('SHARE_THIS_ESTIMATE')}</h2>

      <div className={styles.linkRow}>
        {isLoading ? (
          <Skeleton.Input active className={styles.skeletonInput} />
        ) : (
          <Input
            readOnly
            value={activeState ? shareUrl : t('LINK_SHARING_DISABLED')}
            disabled={!activeState}
            className={`${styles.linkInput} ${hasError ? styles.linkInputError : ''}`}
          />
        )}
        <Button
          type='primary'
          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
          onClick={handleCopy}
          disabled={!activeState || isLoading}
          className={styles.copyButton}
        >
          {copied ? t('COPIED') : t('COPY')}
        </Button>
      </div>

      {hasError && <div className={styles.errorMessage}>{t('FAILED_TO_GENERATE_LINK')}</div>}

      {!isLoading && (
        <div className={styles.toggleRow}>
          {activeState ? (
            <Popconfirm
              title={t('DEACTIVATE_SHARE_LINK')}
              onConfirm={handleToggleOff}
              okText={t('YES')}
              cancelText={t('NO')}
            >
              <Switch checked={activeState} className={activeState ? styles.toggleSwitchActive : undefined} />
            </Popconfirm>
          ) : (
            <Switch checked={false} onChange={() => handleToggle(true)} />
          )}
          {activeState ? (
            <Popconfirm
              title={t('DEACTIVATE_SHARE_LINK')}
              onConfirm={handleToggleOff}
              okText={t('YES')}
              cancelText={t('NO')}
            >
              <span className={`${styles.toggleLabel} ${styles.toggleLabelClickable}`}>
                {t('ANYONE_WITH_LINK_CAN_VIEW')}
              </span>
            </Popconfirm>
          ) : (
            <span className={styles.toggleLabel}>{t('ANYONE_WITH_LINK_CAN_VIEW')}</span>
          )}
        </div>
      )}

      <div className={styles.divider} />

      <div className={styles.sharedLabel}>{t('SHARED_WITH')}</div>
      <div className={styles.ownerRow}>
        <Avatar size={27} src={ownerAvatar} icon={!ownerAvatar ? <UserOutlined /> : undefined} />
        <span className={styles.ownerName}>{ownerName || t('YOU')}</span>
        <span className={styles.ownerBadge}>({t('OWNER')})</span>
      </div>

      <div className={styles.footer}>
        <Button onClick={onClose} className={`${styles.footerButton} ${styles.cancelButton}`}>
          {t('CANCEL')}
        </Button>
        <Button type='primary' onClick={onClose} className={styles.footerButton}>
          {t('DONE')}
        </Button>
      </div>
    </Modal>
  );
};
