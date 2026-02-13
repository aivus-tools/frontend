'use client';

import React from 'react';
import { t } from '@/lib/i18n';
import { PrStatus } from '@/components/PrStatus/PrStatus';
import { Percent } from '@/components/Percent/Percent';
import { ProjectListItem } from '@/types/project.interface';
import { Offer } from '@/types/offer.interface';
import { PROJECT_STATUS } from '@/constants/constants';
import { formatPrice } from '@/helpers/helper';
import {
  CardContainer,
  ProjectRow,
  OffersSection,
  OffersLabel,
  OfferRow,
  OfferName,
  OfferStatusBadge,
  OfferCost,
} from './styled';

interface ProjectOfferCardProps {
  item: ProjectListItem;
  offers: Offer[];
  onClick: () => void;
  className?: string;
}

export const ProjectOfferCard: React.FC<ProjectOfferCardProps> = ({
  item,
  offers,
  onClick,
  className,
}) => {
  return (
    <CardContainer className={className} onClick={onClick}>
      <ProjectRow $status={item.status}>
        <div style={{ position: 'relative', paddingLeft: 20 }}>
          <div
            style={{
              position: 'absolute',
              top: -2,
              left: -5,
              width: 4,
              height: 52,
              borderRadius: 2,
              backgroundColor:
                item.status === PROJECT_STATUS.RFP
                  ? 'var(--blue)'
                  : item.status === PROJECT_STATUS.REVIEWING
                  ? 'var(--orange)'
                  : item.status === PROJECT_STATUS.ONGOING
                  ? 'var(--green-darker)'
                  : 'var(--gray-dark)',
            }}
          />
          <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>
            {item.title}
          </div>
          <div style={{ marginTop: 10, color: 'var(--gray)' }}>{item.assignee}</div>
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>{item.clientName}</div>
          <div style={{ marginTop: 10, fontSize: 10, color: 'var(--gray)' }}>
            {item.clientContact}
          </div>
        </div>
        <div>
          <PrStatus status={item.status} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600 }}>$ {item.cost}</div>
          <div style={{ marginTop: 10, fontSize: 10, color: 'var(--gray)' }}>$ {item.expenses}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, color: 'var(--blue)' }}>$ {item.profit}</div>
          <Percent style={{ marginTop: 10 }} mark="average" size="s" type="transparent" count={36} />
        </div>
        <div>
          <div style={{ fontSize: 13 }}>{item.deadline}</div>
          <div style={{ marginTop: 10, fontSize: 10, color: 'var(--gray)' }}>33d left</div>
        </div>
        <div>
          <div style={{ fontSize: 13 }}>{item.createdAt}</div>
          <div style={{ marginTop: 10, fontSize: 10, color: 'var(--gray)' }}>3d running</div>
        </div>
      </ProjectRow>

      {offers.length > 0 && (
        <OffersSection>
          <OffersLabel>{t('OFFERS')} ({offers.length})</OffersLabel>
          {offers.map((offer) => (
            <OfferRow key={offer.id}>
              <OfferName>{offer.projectName}</OfferName>
              <OfferStatusBadge $status={offer.status}>
                {offer.status === 'PUBLISHED' ? t('STATUS_PUBLISHED') : t('STATUS_DRAFT')}
              </OfferStatusBadge>
              <OfferCost>
                {offer.cost != null ? `$ ${formatPrice(offer.cost)}` : ''}
              </OfferCost>
            </OfferRow>
          ))}
        </OffersSection>
      )}
    </CardContainer>
  );
};
