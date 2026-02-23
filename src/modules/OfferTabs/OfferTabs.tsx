'use client';

import React, { useState, useRef } from 'react';
import { Popover, Tooltip } from 'antd';
import { FileAddOutlined, CopyOutlined, EllipsisOutlined, DeleteOutlined, SnippetsOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { t } from '@/lib/i18n';
import { Offer } from '@/types/offer.interface';
import {
  useGetOffersByProjectIdQuery,
  useCreateOfferMutation,
  useCopyOfferMutation,
  useDeleteOfferMutation,
  useUpdateOfferMutation,
  useUpdateOfferStatusMutation,
 offersApi } from '@/services/client/offersApi';
import { useGetTemplatesQuery, useApplyTemplateMutation } from '@/services/client/templatesApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectProjectId } from '@/store/slices/project';
import { selectOfferMetaData } from '@/store/slices/offer/selectors';
import { setMetaData } from '@/store/slices/offer/slice';
import {
  TabsContainer,
  ActiveTab,
  InactiveTab,
  StatusBadge,
  MoreButton,
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
  const dispatch = useAppDispatch();
  const projectId = useAppSelector(selectProjectId);
  const offerMetaData = useAppSelector(selectOfferMetaData);

  const { data: offers = [] } = useGetOffersByProjectIdQuery(projectId!, {
    skip: !projectId || projectId === 'new-brief',
  });
  const [createOffer] = useCreateOfferMutation();
  const [copyOffer] = useCopyOfferMutation();
  const [deleteOffer] = useDeleteOfferMutation();
  const [updateOffer] = useUpdateOfferMutation();
  const [updateOfferStatus] = useUpdateOfferStatusMutation();
  const { data: templates = [] } = useGetTemplatesQuery();
  const [applyTemplate] = useApplyTemplateMutation();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [statusPopoverId, setStatusPopoverId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const activeOfferId = searchParams.get('offer') || offers[0]?.id;

  // Don't render tabs if no offers yet
  if (offers.length === 0) {
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

  const handleNewFromTemplate = async (templateId: string) => {
    if (!projectId) return;
    setDropdownOpen(false);
    try {
      const newOffer = await applyTemplate({ templateId, projectId }).unwrap();
      // Cross-invalidate offersApi since templatesApi can't do it via tags
      dispatch(offersApi.util.invalidateTags(['Offer']));
      handleTabClick(newOffer.id);
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

  const handleStatusChange = async (offerId: string, newStatus: 'DRAFT' | 'PUBLISHED') => {
    setStatusPopoverId(null);
    try {
      await updateOfferStatus({ id: offerId, status: newStatus }).unwrap();
      if (offerId === activeOfferId && offerMetaData) {
        dispatch(setMetaData({ ...offerMetaData, status: newStatus }));
      }
    } catch {
      // Error handled by RTK Query
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
                  <Popover
                    open={statusPopoverId === offer.id}
                    onOpenChange={(open) => setStatusPopoverId(open ? offer.id : null)}
                    trigger="click"
                    placement="bottom"
                    content={
                      <DropdownContainer style={{ minWidth: 140 }}>
                        <DropdownOption
                          onClick={() => handleStatusChange(offer.id, 'DRAFT')}
                          style={offer.status === 'DRAFT' ? { background: '#f4fbff' } : undefined}
                        >
                          <StatusBadge $status="DRAFT">{t('STATUS_DRAFT')}</StatusBadge>
                        </DropdownOption>
                        <DropdownOption
                          onClick={() => handleStatusChange(offer.id, 'PUBLISHED')}
                          style={offer.status === 'PUBLISHED' ? { background: '#f4fbff' } : undefined}
                        >
                          <StatusBadge $status="PUBLISHED">{t('STATUS_PUBLISHED')}</StatusBadge>
                        </DropdownOption>
                      </DropdownContainer>
                    }
                  >
                    <StatusBadge
                      $status={offer.status}
                      onClick={(e) => e.stopPropagation()}
                      style={{ cursor: 'pointer' }}
                    >
                      {offer.status === 'PUBLISHED' ? t('STATUS_PUBLISHED') : t('STATUS_DRAFT')}
                    </StatusBadge>
                  </Popover>
                  {offers.length > 1 && (
                    <Popover
                      open={menuOpenId === offer.id}
                      onOpenChange={(open) => setMenuOpenId(open ? offer.id : null)}
                      trigger="click"
                      placement="bottomRight"
                      content={
                        <DropdownContainer style={{ minWidth: 140 }}>
                          <DropdownOption
                            onClick={() => {
                              setMenuOpenId(null);
                              handleDelete(offer.id);
                            }}
                            style={{ color: '#d63c22' }}
                          >
                            <DeleteOutlined />
                            {t('DELETE')}
                          </DropdownOption>
                        </DropdownContainer>
                      }
                    >
                      <MoreButton onClick={(e) => e.stopPropagation()}>
                        <EllipsisOutlined />
                      </MoreButton>
                    </Popover>
                  )}
                </>
              )}
            </TabComponent>
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
            {templates.length > 0 && (
              <>
                <DropdownDivider />
                <DropdownLabel>{t('FROM_TEMPLATE')}</DropdownLabel>
                {templates.map((tmpl) => (
                  <DropdownOption key={tmpl.id} onClick={() => handleNewFromTemplate(tmpl.id)}>
                    <SnippetsOutlined />
                    {tmpl.name}
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
