'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Input, Button, Switch, Avatar, Popconfirm, Skeleton } from 'antd';
import { CopyOutlined, CheckOutlined, UserOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { useCreateShareMutation, useGetShareByOfferIdQuery, useUpdateShareMutation } from '@/services/client/sharesApi';
import {
  Title,
  LinkRow,
  ToggleRow,
  ToggleLabel,
  Divider,
  SharedLabel,
  OwnerRow,
  OwnerName,
  OwnerBadge,
  Footer,
} from './styled';

interface SharePopupProps {
  open: boolean;
  onClose: () => void;
  offerId: string;
  ownerName?: string;
  ownerAvatar?: string;
}

export const SharePopup: React.FC<SharePopupProps> = ({ open, onClose, offerId, ownerName, ownerAvatar }) => {
  const [copied, setCopied] = useState(false);
  const [createShare, { isLoading: isCreating }] = useCreateShareMutation();
  const [updateShare] = useUpdateShareMutation();
  const { data: existingShare, isLoading: isLoadingShare, error: shareError } = useGetShareByOfferIdQuery(offerId, {
    skip: !open || !offerId,
  });

  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Sync state with fetched share data
  useEffect(() => {
    if (existingShare) {
      setShareToken(existingShare.token);
      setIsActive(existingShare.isActive);
    }
  }, [existingShare]);

  // Auto-create share when modal opens and no existing share
  useEffect(() => {
    if (open && !existingShare && !isLoadingShare && !shareToken && !shareError) {
      createShare({ offerId })
        .unwrap()
        .then((share) => {
          setShareToken(share.token);
          setIsActive(share.isActive);
        })
        .catch(() => {
          setHasError(true);
        });
    }
  }, [open, existingShare, isLoadingShare, shareToken, shareError, offerId, createShare]);

  const shareUrl = shareToken ? `${window.location.origin}/public/${shareToken}` : '';

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
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
    (checked: boolean) => {
      if (!shareToken) return;
      setIsActive(checked);
      updateShare({ token: shareToken, isActive: checked });
    },
    [shareToken, updateShare]
  );

  const handleToggleOff = useCallback(() => {
    handleToggle(false);
  }, [handleToggle]);

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
      <Title>{t('SHARE_THIS_ESTIMATE')}</Title>

      <LinkRow>
        {isLoading ? (
          <Skeleton.Input active style={{ flex: 1, height: 40 }} />
        ) : (
          <Input
            readOnly
            value={isActive ? shareUrl : t('LINK_SHARING_DISABLED')}
            disabled={!isActive}
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
          type="primary"
          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
          onClick={handleCopy}
          disabled={!isActive || isLoading}
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

      <ToggleRow>
        {isActive ? (
          <Switch
            checked={isActive}
            onChange={(checked) => {
              if (!checked) {
                // Will be handled by Popconfirm
              } else {
                handleToggle(true);
              }
            }}
            style={{ backgroundColor: isActive ? '#2288FF' : undefined }}
          />
        ) : (
          <Switch checked={false} onChange={() => handleToggle(true)} />
        )}
        {isActive ? (
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

      <Divider />

      <SharedLabel>{t('SHARED_WITH')}</SharedLabel>
      <OwnerRow>
        <Avatar size={27} src={ownerAvatar} icon={!ownerAvatar ? <UserOutlined /> : undefined} />
        <OwnerName>{ownerName || 'You'}</OwnerName>
        <OwnerBadge>({t('OWNER')})</OwnerBadge>
      </OwnerRow>

      <Footer>
        <Button
          onClick={onClose}
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
          type="primary"
          onClick={onClose}
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
