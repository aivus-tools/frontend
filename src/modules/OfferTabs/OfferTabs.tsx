'use client';

import React, { useState, useRef } from 'react';
import { Popconfirm, Popover, Tooltip } from 'antd';
import { FileAddOutlined, CopyOutlined, CloseOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { t } from '@/lib/i18n';
import { Offer } from '@/types/offer.interface';
import {
  useGetOffersByProjectIdQuery,
  useCreateOfferMutation,
  useCopyOfferMutation,
  useDeleteOfferMutation,
  useUpdateOfferMutation,
} from '@/services/client/offersApi';
import { useAppSelector } from '@/store/hooks';
import { selectProjectId } from '@/store/slices/project';
import {
  TabsContainer,
  ActiveTab,
  InactiveTab,
  StatusBadge,
  CloseButton,
  TabWrapper,
  NewOfferTab,
  RenameInput,
  DropdownContainer,
  DropdownOption,
  DropdownDivider,
  DropdownLabel,
} from './styled';

const MAX_OFFERS = 10;

export const OfferTabs: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = useAppSelector(selectProjectId);

  const { data: offers = [] } = useGetOffersByProjectIdQuery(projectId!, {
    skip: !projectId || projectId === 'new-brief',
  });
  const [createOffer] = useCreateOfferMutation();
  const [copyOffer] = useCopyOfferMutation();
  const [deleteOffer] = useDeleteOfferMutation();
  const [updateOffer] = useUpdateOfferMutation();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const activeOfferId = searchParams.get('offer') || offers[0]?.id;

  // Don't render tabs if 0 or 1 offers
  if (offers.length <= 1) {
    return null;
  }

  const handleTabClick = (offerId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('offer', offerId);
    router.push(`?${params.toString()}`);
  };

  const handleNewBlank = async () => {
    if (!projectId) return;
    setDropdownOpen(false);
    try {
      const newOffer = await createOffer({
        projectName: `Offer ${offers.length + 1}`,
        projectId,
        status: 'DRAFT',
        details: {},
        deadline: new Date().toISOString(),
        source: 'PLATFORM',
        isLocked: false,
      }).unwrap();
      handleTabClick(newOffer.id);
    } catch {
      // Error handled by RTK Query
    }
  };

  const handleCopyFrom = async (offerId: string) => {
    setDropdownOpen(false);
    try {
      const copiedOffer = await copyOffer(offerId).unwrap();
      handleTabClick(copiedOffer.id);
    } catch {
      // Error handled by RTK Query
    }
  };

  const handleDelete = async (offerId: string) => {
    try {
      // Compute remaining before the delete to avoid stale cache issues
      const remaining = offers.filter((o) => o.id !== offerId);
      await deleteOffer(offerId).unwrap();
      // If deleted the active tab, switch to first remaining
      if (offerId === activeOfferId && remaining.length > 0) {
        handleTabClick(remaining[0].id);
      }
    } catch {
      // Error handled by RTK Query
    }
  };

  const handleDoubleClick = (offer: Offer) => {
    setRenamingId(offer.id);
    setRenameValue(offer.projectName);
  };

  const handleRenameSubmit = async () => {
    if (renamingId && renameValue.trim()) {
      await updateOffer({ id: renamingId, projectName: renameValue.trim() });
    }
    setRenamingId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setRenamingId(null);
    }
  };

  const isMaxOffers = offers.length >= MAX_OFFERS;

  return (
    <TabsContainer>
      {offers.map((offer) => {
        const isActive = offer.id === activeOfferId;
        const TabComponent = isActive ? ActiveTab : InactiveTab;

        return (
          <TabWrapper key={offer.id}>
            <TabComponent
              onClick={() => handleTabClick(offer.id)}
              onDoubleClick={() => handleDoubleClick(offer)}
            >
              {renamingId === offer.id ? (
                <RenameInput
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={handleRenameKeyDown}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span>{offer.projectName}</span>
                  <StatusBadge $status={offer.status}>
                    {offer.status === 'PUBLISHED' ? t('STATUS_PUBLISHED') : t('STATUS_DRAFT')}
                  </StatusBadge>
                </>
              )}
            </TabComponent>
            {!isActive && offers.length > 1 && (
              <Popconfirm
                title={t('DELETE_OFFER_CONFIRM')}
                onConfirm={() => handleDelete(offer.id)}
                okText={t('YES')}
                cancelText={t('NO')}
              >
                <CloseButton onClick={(e) => e.stopPropagation()}>
                  <CloseOutlined />
                </CloseButton>
              </Popconfirm>
            )}
          </TabWrapper>
        );
      })}

      <Popover
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        trigger="click"
        placement="bottomLeft"
        content={
          <DropdownContainer>
            <DropdownOption onClick={handleNewBlank}>
              <FileAddOutlined />
              {t('BLANK_ESTIMATE')}
            </DropdownOption>
            {offers.length > 0 && (
              <>
                <DropdownDivider />
                <DropdownLabel>{t('COPY_FROM_EXISTING')}</DropdownLabel>
                {offers.map((offer) => (
                  <DropdownOption key={offer.id} onClick={() => handleCopyFrom(offer.id)}>
                    <CopyOutlined />
                    {t('COPY_FROM', offer.projectName)}
                  </DropdownOption>
                ))}
              </>
            )}
          </DropdownContainer>
        }
      >
        <Tooltip title={isMaxOffers ? t('MAX_OFFERS_REACHED') : undefined}>
          <NewOfferTab disabled={isMaxOffers}>
            {t('NEW_OFFER')}
          </NewOfferTab>
        </Tooltip>
      </Popover>
    </TabsContainer>
  );
};
