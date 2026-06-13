'use client';

import React, { useState } from 'react';
import { App, Dropdown, Popover } from 'antd';
import { useRouter } from 'next/navigation';
import { MoreOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { ProjectListItem } from '@/types/project.interface';
import { Offer } from '@/types/offer.interface';
import { AppRoute } from '@/constants/appRoute';
import { formatPrice } from '@/helpers/helper';
import { useUpdateOfferStatusMutation } from '@/services/client/offersApi';
import { useDeleteProjectMutation, useRestoreProjectMutation } from '@/services/client/projectsApi';

import styles from './ProjectOfferCard.module.css';

interface ProjectOfferCardProps {
  item: ProjectListItem;
  offers: Offer[];
  onClick: () => void;
  isArchived?: boolean;
  className?: string;
}

const statusAccent = (status?: string): string => {
  switch (status) {
    case 'RFP':
      return 'var(--blue)';
    case 'REVIEWING':
      return 'var(--orange)';
    case 'ONGOING':
    case 'COMPLETED':
      return 'var(--green-darker)';
    default:
      return 'var(--gray-light)';
  }
};

const statusBg = (status?: string): string => {
  switch (status) {
    case 'RFP':
      return 'var(--bg-blue-subtotal)';
    case 'REVIEWING':
      return 'var(--bg-orange)';
    case 'ONGOING':
    case 'COMPLETED':
      return 'var(--bg-green)';
    default:
      return 'var(--bg-gray-page)';
  }
};

const statusBadgeClass = (status: string): string => {
  if (status === 'PUBLISHED') {
    return `${styles.offerStatusBadge} ${styles.offerStatusPublished}`;
  }
  if (status === 'ARCHIVED') {
    return `${styles.offerStatusBadge} ${styles.offerStatusArchived}`;
  }
  return `${styles.offerStatusBadge} ${styles.offerStatusDraft}`;
};

const offerValueClass = (highlight: boolean, negative: boolean): string => {
  const base = styles.offerValue;
  if (negative) {
    return `${base} ${styles.offerValueNegative}`;
  }
  if (highlight) {
    return `${base} ${styles.offerValueHighlight}`;
  }
  return base;
};

const projectStageBadgeClass = (status: string): string => {
  if (status === 'RFP') {
    return `${styles.leadBadge} ${styles.leadBadgeNew}`;
  }
  return `${styles.leadBadge} ${styles.leadBadgeInProgress}`;
};

const projectStageLabel = (status: string): string | null => {
  if (status === 'RFP') {
    return t('PROJECT_STAGE_NEW_LEAD');
  }
  if (status === 'DRAFT') {
    return t('PROJECT_STAGE_IN_PROGRESS');
  }
  return null;
};

export const ProjectOfferCard = (props: ProjectOfferCardProps) => {
  const router = useRouter();
  const { modal } = App.useApp();
  const [statusPopoverId, setStatusPopoverId] = useState<string | null>(null);
  const [updateOfferStatus] = useUpdateOfferStatusMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [restoreProject] = useRestoreProjectMutation();

  const isArchived = props.isArchived ?? false;

  const handleStatusChange = async (
    event: React.MouseEvent,
    offerId: string,
    newStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  ) => {
    event.stopPropagation();
    setStatusPopoverId(null);
    try {
      await updateOfferStatus({ id: offerId, status: newStatus }).unwrap();
    } catch {
      // Error handled by RTK Query
    }
  };

  const menuItems = isArchived
    ? [{ key: 'restore', label: t('RESTORE_PROJECT') }]
    : [{ key: 'archive', label: t('ARCHIVE_PROJECT'), danger: true }];

  const handleMenuClick = ({ key, domEvent }: { key: string; domEvent: React.MouseEvent | React.KeyboardEvent }) => {
    domEvent.stopPropagation();
    if (key === 'archive') {
      modal.confirm({
        title: t('ARCHIVE_PROJECT'),
        content: t('ARCHIVE_PROJECT_CONFIRM'),
        okText: t('ARCHIVE'),
        okButtonProps: { danger: true },
        onOk: async () => {
          await deleteProject(props.item.id);
        },
      });
    }
    if (key === 'restore') {
      restoreProject(props.item.id);
    }
  };

  const cardStyle = {
    '--card-bg': statusBg(props.item.status),
    '--card-accent': statusAccent(props.item.status),
  } as React.CSSProperties;

  return (
    <div className={`${styles.cardContainer} ${props.className ?? ''}`} onClick={props.onClick} style={cardStyle}>
      <div className={styles.cardHeader}>
        <div className={styles.projectInfo}>
          <div className={styles.projectTitle}>{props.item.title}</div>
          <div className={styles.projectMeta}>
            {props.item.clientName ? (
              <>
                <span>{props.item.clientName}</span>
                <span className={styles.metaDot} />
              </>
            ) : null}
            <span>{props.item.createdAt}</span>
          </div>
        </div>
        {props.item.briefConversationStatus != null ? (
          <div className={styles.leadBadges}>
            {projectStageLabel(props.item.status) != null ? (
              <span className={projectStageBadgeClass(props.item.status)}>{projectStageLabel(props.item.status)}</span>
            ) : null}
            <span
              className={`${styles.leadBadge} ${props.item.hasContactEmail ? styles.leadBadgeEmailYes : styles.leadBadgeEmailNo}`}
            >
              {props.item.hasContactEmail ? t('LEAD_EMAIL_YES') : t('LEAD_EMAIL_NO')}
            </span>
          </div>
        ) : null}

        <div className={styles.headerActions}>
          <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']} placement='bottomRight'>
            <div className={styles.kebabButton} onClick={(event) => event.stopPropagation()}>
              <MoreOutlined />
            </div>
          </Dropdown>
        </div>
      </div>

      {/* Stage 1 (Hide Offers/Estimates): offers section hidden, re-enable at Stage 4. */}
      {false && props.offers.length > 0 ? (
        <div className={styles.offersTable}>
          <div className={styles.offerTableHeader}>
            <span>{t('OFFER')}</span>
            <span className={styles.alignRight}>{t('DASHBOARD_STATUS')}</span>
            <span className={styles.alignRight}>{t('TOTAL_CLIENTS_COST')}</span>
            <span className={styles.alignRight}>{t('EXPENSES')}</span>
            <span className={styles.alignRight}>{t('PROFIT')}</span>
          </div>
          {props.offers.map((offer) => {
            const expenses = offer.cost ?? 0;
            const profit = offer.profit ?? 0;
            const clientCost = expenses + profit;
            const markupPercent = clientCost !== 0 ? (profit / clientCost) * 100 : 0;

            return (
              <div
                key={offer.id}
                className={styles.offerRow}
                onClick={(event) => {
                  event.stopPropagation();
                  router.push(AppRoute.DASHBOARD_PROJECT_ESTIMATION(props.item.id) + '?offer=' + offer.id);
                }}
              >
                <div className={`${styles.offerName} ${styles.cellName}`}>
                  <span className={styles.offerNameText}>{offer.projectName}</span>
                </div>
                <div className={`${styles.alignRight} ${styles.cellStatus}`}>
                  <Popover
                    open={statusPopoverId === offer.id}
                    onOpenChange={(open) => setStatusPopoverId(open ? offer.id : null)}
                    trigger='click'
                    placement='bottom'
                    content={
                      <div className={styles.statusDropdown}>
                        <div
                          className={styles.statusDropdownOption}
                          onClick={(event) => handleStatusChange(event, offer.id, 'DRAFT')}
                        >
                          <span className={statusBadgeClass('DRAFT')}>{t('STATUS_DRAFT')}</span>
                        </div>
                        <div
                          className={styles.statusDropdownOption}
                          onClick={(event) => handleStatusChange(event, offer.id, 'PUBLISHED')}
                        >
                          <span className={statusBadgeClass('PUBLISHED')}>{t('STATUS_PUBLISHED')}</span>
                        </div>
                        <div
                          className={styles.statusDropdownOption}
                          onClick={(event) => handleStatusChange(event, offer.id, 'ARCHIVED')}
                        >
                          <span className={statusBadgeClass('ARCHIVED')}>{t('STATUS_ARCHIVED')}</span>
                        </div>
                      </div>
                    }
                  >
                    <span className={statusBadgeClass(offer.status)} onClick={(event) => event.stopPropagation()}>
                      {offer.status === 'PUBLISHED'
                        ? t('STATUS_PUBLISHED')
                        : offer.status === 'ARCHIVED'
                          ? t('STATUS_ARCHIVED')
                          : t('STATUS_DRAFT')}
                    </span>
                  </Popover>
                </div>
                <div className={`${styles.offerValue} ${styles.cellClient}`} data-label={t('TOTAL_CLIENTS_COST')}>
                  {clientCost > 0 ? `$ ${formatPrice(clientCost)}` : '-'}
                </div>
                <div className={`${styles.offerValue} ${styles.cellExpenses}`} data-label={t('EXPENSES')}>
                  {expenses > 0 ? `$ ${formatPrice(expenses)}` : '-'}
                </div>
                <div
                  className={`${offerValueClass(profit > 0, profit < 0)} ${styles.cellProfit}`}
                  data-label={t('PROFIT')}
                >
                  {profit !== 0 ? (
                    <>
                      {`$ ${formatPrice(profit)}`}
                      <span
                        className={`${styles.percentBadge} ${markupPercent >= 0 ? styles.percentBadgePositive : styles.percentBadgeNegative}`}
                      >
                        {markupPercent >= 0 ? '↑' : '↓'}{' '}
                        {Math.abs(markupPercent).toLocaleString('en-US', {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}
                        %
                      </span>
                    </>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
