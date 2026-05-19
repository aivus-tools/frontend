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
  offersApi,
} from '@/services/client/offersApi';
import { useGetTemplatesQuery, useApplyTemplateMutation } from '@/services/client/templatesApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectProjectId } from '@/store/slices/project';
import { selectOfferMetaData } from '@/store/slices/offer/selectors';
import { setMetaData } from '@/store/slices/offer/slice';

import styles from './OfferTabs.module.css';

const MAX_OFFERS = 10;

const statusClassName = (status: string): string => {
  if (status === 'PUBLISHED') {
    return styles.statusPublished;
  }
  if (status === 'ARCHIVED') {
    return styles.statusArchived;
  }
  return styles.statusDraft;
};

export const OfferTabs = () => {
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

  if (offers.length === 0) {
    return null;
  }

  const handleTabClick = (offerId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('offer', offerId);
    router.push(`?${params.toString()}`);
  };

  const handleNewBlank = async () => {
    if (!projectId) {
      return;
    }
    setDropdownOpen(false);
    try {
      const today = new Date().toISOString().split('T')[0];
      const newOffer = await createOffer({
        projectName: `Offer ${offers.length + 1}`,
        projectId,
        status: 'DRAFT',
        details: {},
        deadline: new Date().toISOString(),
        source: 'PLATFORM',
        isLocked: false,
        bidDate: today,
        revision: '',
        term: '6 months',
        territory: ['United States'],
        mediaPlacements: ['All online'],
        coverPageNotes: '',
        deliverables: [],
        scheduleEntries: [
          { phaseType: 'Prep', days: 1, hoursPerDay: 12, notes: '', sortOrder: 0 },
          { phaseType: 'Shoot', days: 1, hoursPerDay: 12, notes: '', sortOrder: 1 },
          { phaseType: 'Wrap / Return', days: 1, hoursPerDay: 12, notes: '', sortOrder: 2 },
        ],
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
    if (!projectId) {
      return;
    }
    setDropdownOpen(false);
    try {
      const newOffer = await applyTemplate({ templateId, projectId }).unwrap();
      dispatch(offersApi.util.invalidateTags(['Offer']));
      handleTabClick(newOffer.id);
    } catch {
      // Error handled by RTK Query
    }
  };

  const handleDelete = async (offerId: string) => {
    try {
      const remaining = offers.filter((x) => x.id !== offerId);
      await deleteOffer(offerId).unwrap();
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

  const handleRenameKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleRenameSubmit();
    } else if (event.key === 'Escape') {
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
    <div className={styles.tabsContainer}>
      {offers.map((offer) => {
        const isActive = offer.id === activeOfferId;
        const tabClassName = `${styles.tab} ${isActive ? styles.activeTab : styles.inactiveTab}`;

        return (
          <div className={styles.tabWrapper} key={offer.id}>
            <button
              type='button'
              className={tabClassName}
              onClick={() => handleTabClick(offer.id)}
              onDoubleClick={() => handleDoubleClick(offer)}
            >
              {renamingId === offer.id ? (
                <input
                  ref={renameInputRef}
                  className={styles.renameInput}
                  value={renameValue}
                  onChange={(event) => setRenameValue(event.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={handleRenameKeyDown}
                  autoFocus
                  onClick={(event) => event.stopPropagation()}
                />
              ) : (
                <>
                  <span>{offer.projectName}</span>
                  <Popover
                    open={statusPopoverId === offer.id}
                    onOpenChange={(open) => setStatusPopoverId(open ? offer.id : null)}
                    trigger='click'
                    placement='bottom'
                    content={
                      <div className={`${styles.dropdownContainer} ${styles.dropdownContainerNarrow}`}>
                        <div
                          className={`${styles.dropdownOption} ${offer.status === 'DRAFT' ? styles.dropdownOptionActive : ''}`}
                          onClick={() => handleStatusChange(offer.id, 'DRAFT')}
                        >
                          <span className={`${styles.statusBadge} ${statusClassName('DRAFT')}`}>
                            {t('STATUS_DRAFT')}
                          </span>
                        </div>
                        <div
                          className={`${styles.dropdownOption} ${offer.status === 'PUBLISHED' ? styles.dropdownOptionActive : ''}`}
                          onClick={() => handleStatusChange(offer.id, 'PUBLISHED')}
                        >
                          <span className={`${styles.statusBadge} ${statusClassName('PUBLISHED')}`}>
                            {t('STATUS_PUBLISHED')}
                          </span>
                        </div>
                      </div>
                    }
                  >
                    <span
                      className={`${styles.statusBadge} ${statusClassName(offer.status)} ${styles.statusBadgeClickable}`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {offer.status === 'PUBLISHED' ? t('STATUS_PUBLISHED') : t('STATUS_DRAFT')}
                    </span>
                  </Popover>
                  {offers.length > 1 && (
                    <Popover
                      open={menuOpenId === offer.id}
                      onOpenChange={(open) => setMenuOpenId(open ? offer.id : null)}
                      trigger='click'
                      placement='bottomRight'
                      content={
                        <div className={`${styles.dropdownContainer} ${styles.dropdownContainerNarrow}`}>
                          <div
                            className={`${styles.dropdownOption} ${styles.dropdownOptionDanger}`}
                            onClick={() => {
                              setMenuOpenId(null);
                              handleDelete(offer.id);
                            }}
                          >
                            <DeleteOutlined />
                            {t('DELETE')}
                          </div>
                        </div>
                      }
                    >
                      <span className={styles.moreButton} onClick={(event) => event.stopPropagation()}>
                        <EllipsisOutlined />
                      </span>
                    </Popover>
                  )}
                </>
              )}
            </button>
          </div>
        );
      })}

      <Popover
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        trigger='click'
        placement='bottomLeft'
        content={
          <div className={styles.dropdownContainer}>
            <div className={styles.dropdownOption} onClick={handleNewBlank}>
              <FileAddOutlined />
              {t('BLANK_ESTIMATE')}
            </div>
            {offers.length > 0 && (
              <>
                <div className={styles.dropdownDivider} />
                <div className={styles.dropdownLabel}>{t('COPY_FROM_EXISTING')}</div>
                {offers.map((offer) => (
                  <div key={offer.id} className={styles.dropdownOption} onClick={() => handleCopyFrom(offer.id)}>
                    <CopyOutlined />
                    {t('COPY_FROM', offer.projectName)}
                  </div>
                ))}
              </>
            )}
            {templates.length > 0 && (
              <>
                <div className={styles.dropdownDivider} />
                <div className={styles.dropdownLabel}>{t('FROM_TEMPLATE')}</div>
                {templates.map((tmpl) => (
                  <div key={tmpl.id} className={styles.dropdownOption} onClick={() => handleNewFromTemplate(tmpl.id)}>
                    <SnippetsOutlined />
                    {tmpl.name}
                  </div>
                ))}
              </>
            )}
          </div>
        }
      >
        <Tooltip title={isMaxOffers ? t('MAX_OFFERS_REACHED') : undefined}>
          <button type='button' className={`${styles.tab} ${styles.newOfferTab}`} disabled={isMaxOffers}>
            {t('NEW_OFFER')}
          </button>
        </Tooltip>
      </Popover>
    </div>
  );
};
