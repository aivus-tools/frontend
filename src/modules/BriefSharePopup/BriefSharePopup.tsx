'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Input, Button, Switch, Popconfirm, Skeleton } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import {
  useCreateBriefShareMutation,
  useGetBriefShareByBriefIdQuery,
  useUpdateBriefShareMutation,
} from '@/services/client/briefShareApi';
import { Title, LinkRow, ToggleRow, ToggleLabel, Footer } from '@/modules/SharePopup/styled';

interface BriefSharePopupProps {
  open: boolean;
  onClose: () => void;
  briefId: string;
}

export const BriefSharePopup: React.FC<BriefSharePopupProps> = (props) => {
  const [copied, setCopied] = useState(false);
  const [createShare, { isLoading: isCreating }] = useCreateBriefShareMutation();
  const [updateShare] = useUpdateBriefShareMutation();
  const {
    data: existingShare,
    isLoading: isLoadingShare,
    error: shareError,
  } = useGetBriefShareByBriefIdQuery(props.briefId, {
    skip: !props.open || !props.briefId,
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
    if (
      props.open &&
      !existingShare &&
      !isLoadingShare &&
      !shareToken &&
      !createGuardRef.current &&
      (!shareError || is404)
    ) {
      createGuardRef.current = true;
      createShare(props.briefId)
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
  }, [props.open, existingShare, isLoadingShare, shareToken, shareError, props.briefId, createShare]);

  useEffect(() => {
    if (!props.open) {
      setShareToken(null);
      setIsActive(null);
      setHasError(false);
      setCopied(false);
      createGuardRef.current = false;
    }
  }, [props.open]);

  const shareUrl = useMemo(
    () => (shareToken && typeof window !== 'undefined' ? `${window.location.origin}/shared-brief/${shareToken}` : ''),
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
      open={props.open}
      onCancel={props.onClose}
      footer={null}
      centered
      width={520}
      styles={{
        body: { padding: '32px' },
        mask: { background: 'rgba(18, 27, 62, 0.45)' },
      }}
      destroyOnClose
    >
      <Title>{t('SHARE_THIS_BRIEF')}</Title>

      <LinkRow>
        {isLoading ? (
          <Skeleton.Input active style={{ flex: 1, height: 40 }} />
        ) : (
          <Input
            readOnly
            value={activeState ? shareUrl : t('LINK_SHARING_DISABLED')}
            disabled={!activeState}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 6,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 500,
              fontSize: 13,
              color: '#4B5675',
              borderColor: hasError ? '#D63C22' : '#D9D9D9',
            }}
          />
        )}
        <Button
          type='primary'
          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
          onClick={handleCopy}
          disabled={!activeState || isLoading}
          style={{
            height: 40,
            minWidth: 80,
            borderRadius: 4,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {copied ? t('COPIED') : t('COPY')}
        </Button>
      </LinkRow>

      {hasError && (
        <div style={{ color: '#D63C22', fontSize: 12, marginTop: -12, marginBottom: 12 }}>
          {t('FAILED_TO_GENERATE_LINK')}
        </div>
      )}

      {!isLoading && (
        <ToggleRow>
          {activeState ? (
            <Popconfirm
              title={t('DEACTIVATE_SHARE_LINK')}
              onConfirm={handleToggleOff}
              okText={t('YES')}
              cancelText={t('NO')}
            >
              <Switch checked={activeState} style={{ backgroundColor: '#2288FF' }} />
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
              <ToggleLabel style={{ cursor: 'pointer' }}>{t('ANYONE_WITH_LINK_CAN_VIEW')}</ToggleLabel>
            </Popconfirm>
          ) : (
            <ToggleLabel>{t('ANYONE_WITH_LINK_CAN_VIEW')}</ToggleLabel>
          )}
        </ToggleRow>
      )}

      <Footer>
        <Button
          onClick={props.onClose}
          style={{
            height: 36,
            borderRadius: 4,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: '#4B5675',
          }}
        >
          {t('CANCEL')}
        </Button>
        <Button
          type='primary'
          onClick={props.onClose}
          style={{
            height: 36,
            borderRadius: 4,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {t('DONE')}
        </Button>
      </Footer>
    </Modal>
  );
};
