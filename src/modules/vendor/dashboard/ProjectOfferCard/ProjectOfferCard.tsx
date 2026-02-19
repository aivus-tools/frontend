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
import {
  CardContainer,
  CardHeader,
  ProjectInfo,
  ProjectTitle,
  ProjectMeta,
  MetaDot,
  HeaderActions,
  OffersTable,
  OfferTableHeader,
  OfferRow,
  OfferName,
  OfferNameText,
  OfferStatusBadge,
  OfferValue,
  StatusDropdown,
  StatusDropdownOption,
  KebabButton,
  EmptyOffers,
} from './styled';

interface ProjectOfferCardProps {
  item: ProjectListItem;
  offers: Offer[];
  onClick: () => void;
  isArchived?: boolean;
  className?: string;
}

export const ProjectOfferCard: React.FC<ProjectOfferCardProps> = ({
  item,
  offers,
  onClick,
  isArchived = false,
  className,
}) => {
  const router = useRouter();
  const { modal } = App.useApp();
  const [statusPopoverId, setStatusPopoverId] = useState<string | null>(null);
  const [updateOfferStatus] = useUpdateOfferStatusMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [restoreProject] = useRestoreProjectMutation();

  const handleStatusChange = async (e: React.MouseEvent, offerId: string, newStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    e.stopPropagation();
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
          await deleteProject(item.id);
        },
      });
    }
    if (key === 'restore') {
      restoreProject(item.id);
    }
  };

  return (
    <CardContainer className={className} onClick={onClick} $status={item.status}>
      <CardHeader>
        <ProjectInfo>
          <ProjectTitle>{item.title}</ProjectTitle>
          <ProjectMeta>
            {item.clientName && item.clientName !== '-' && (
              <>
                <span>{item.clientName}</span>
                <MetaDot />
              </>
            )}
            <span>{item.createdAt}</span>
          </ProjectMeta>
        </ProjectInfo>
        <HeaderActions>
          <Dropdown
            menu={{ items: menuItems, onClick: handleMenuClick }}
            trigger={['click']}
            placement="bottomRight"
          >
            <KebabButton onClick={(e) => e.stopPropagation()}>
              <MoreOutlined />
            </KebabButton>
          </Dropdown>
        </HeaderActions>
      </CardHeader>

      {offers.length > 0 ? (
        <OffersTable>
          <OfferTableHeader>
            <span>{t('OFFER')}</span>
            <span style={{ textAlign: 'right' }}>{t('DASHBOARD_STATUS')}</span>
            <span style={{ textAlign: 'right' }}>{t('COST')}</span>
            <span style={{ textAlign: 'right' }}>{t('PROFIT')}</span>
          </OfferTableHeader>
          {offers.map((offer) => (
            <OfferRow
              key={offer.id}
              onClick={(e) => {
                e.stopPropagation();
                router.push(AppRoute.DASHBOARD_PROJECT_ESTIMATION(item.id) + '?offer=' + offer.id);
              }}
            >
              <OfferName>
                <OfferNameText>{offer.projectName}</OfferNameText>
              </OfferName>
              <div style={{ textAlign: 'right' }}>
                <Popover
                  open={statusPopoverId === offer.id}
                  onOpenChange={(open) => setStatusPopoverId(open ? offer.id : null)}
                  trigger="click"
                  placement="bottom"
                  content={
                    <StatusDropdown>
                      <StatusDropdownOption onClick={(e) => handleStatusChange(e, offer.id, 'DRAFT')}>
                        <OfferStatusBadge $status="DRAFT">{t('STATUS_DRAFT')}</OfferStatusBadge>
                      </StatusDropdownOption>
                      <StatusDropdownOption onClick={(e) => handleStatusChange(e, offer.id, 'PUBLISHED')}>
                        <OfferStatusBadge $status="PUBLISHED">{t('STATUS_PUBLISHED')}</OfferStatusBadge>
                      </StatusDropdownOption>
                      <StatusDropdownOption onClick={(e) => handleStatusChange(e, offer.id, 'ARCHIVED')}>
                        <OfferStatusBadge $status="ARCHIVED">{t('STATUS_ARCHIVED')}</OfferStatusBadge>
                      </StatusDropdownOption>
                    </StatusDropdown>
                  }
                >
                  <OfferStatusBadge
                    $status={offer.status}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {offer.status === 'PUBLISHED' ? t('STATUS_PUBLISHED') : offer.status === 'ARCHIVED' ? t('STATUS_ARCHIVED') : t('STATUS_DRAFT')}
                  </OfferStatusBadge>
                </Popover>
              </div>
              <OfferValue>
                {offer.cost != null && offer.cost > 0 ? `$ ${formatPrice(offer.cost)}` : '-'}
              </OfferValue>
              <OfferValue $highlight>
                {offer.profit != null && offer.profit > 0 ? `$ ${formatPrice(offer.profit)}` : '-'}
              </OfferValue>
            </OfferRow>
          ))}
        </OffersTable>
      ) : (
        <EmptyOffers>{t('NO_OFFERS_YET')}</EmptyOffers>
      )}
    </CardContainer>
  );
};
