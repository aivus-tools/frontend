import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { OfferExportData } from '@/types/exportData.interface';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

interface CoverPageProps {
  data: OfferExportData;
}

const ACCENT_COLOR = '#7CDFF1';
const TEXT_COLOR = '#4B5675';
const FONT_FAMILY = "'Montserrat', sans-serif";

const formatDate = (value: string | null): string => {
  if (value == null) {
    return '';
  }
  const date = new Date(value);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
};

export const CoverPage = (props: CoverPageProps) => {
  const producer = props.data.collaborators.find((x) => x.role === 'producer') ?? null;
  const agencyProducer = props.data.collaborators.find((x) => x.role === 'agency_producer') ?? null;
  const firstClientManager = props.data.project.clientManagers.length > 0 ? props.data.project.clientManagers[0] : null;

  const shareUrl = props.data.shareToken != null ? `${window.location.origin}/public/${props.data.shareToken}` : null;

  const clientBrand =
    [props.data.project.clientName, props.data.project.brandName].filter((x) => x != null).join(' / ') || '';

  return (
    <div
      style={{
        fontFamily: FONT_FAMILY,
        color: TEXT_COLOR,
        maxWidth: 1210,
        margin: '0 auto',
        padding: '0 32px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
          paddingBottom: 12,
          borderBottom: `3px solid ${ACCENT_COLOR}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: '0 0 50%' }}>
          {props.data.vendor.logoUrl != null && (
            <img
              src={props.data.vendor.logoUrl}
              alt={props.data.vendor.companyName ?? props.data.vendor.name}
              style={{ maxHeight: 100, maxWidth: 260, objectFit: 'contain' }}
            />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flex: '0 0 50%' }}>
          <div style={{ flex: 1, fontSize: 14, lineHeight: 2 }}>
            <InfoRow label='Job Name:' value={props.data.project.name} />
            <InfoRow label='Bid Date:' value={formatDate(props.data.offer.bidDate)} />
            <InfoRow label='Bid Version:' value={props.data.offer.revision ?? 'Initial Bidding'} />
            <InfoRow label='AIVUS ID:' value={props.data.offer.uuid} />
          </div>
          {shareUrl != null && <QRCodeSVG value={shareUrl} size={100} level='M' />}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, marginBottom: 12, fontSize: 14 }}>
        <div style={{ flex: '0 0 50%' }}>
          <div>
            <InfoRow label='Production:' value={props.data.vendor.companyName ?? props.data.vendor.name} />
            <InfoRow label='Producer:' value={producer != null ? producer.name : ''} />
          </div>
          <div style={{ marginTop: 12 }}>
            <InfoRow label='Term:' value={props.data.offer.term ?? ''} />
            <InfoRow
              label='Territory:'
              value={props.data.offer.territory.length > 0 ? props.data.offer.territory.join(', ') : ''}
            />
            <InfoRow
              label='Media / Placements:'
              value={props.data.offer.mediaPlacements.length > 0 ? props.data.offer.mediaPlacements.join(', ') : ''}
            />
          </div>
        </div>
        <div style={{ flex: '0 0 50%' }}>
          <div>
            <InfoRow label='Client / Brand:' value={clientBrand} />
            <InfoRow
              label='Client Manager:'
              value={
                firstClientManager != null
                  ? `${firstClientManager.name}${firstClientManager.position ? ', ' + firstClientManager.position : ''}`
                  : ''
              }
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <InfoRow label='Agency:' value={props.data.project.agencyName ?? ''} />
            <InfoRow label='Agency Producer:' value={agencyProducer != null ? agencyProducer.name : ''} />
          </div>
        </div>
      </div>

      {props.data.offer.deliverables.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={sectionTitleStyle}>Deliverables:</div>
          <div>
            {props.data.offer.deliverables.map((x, i) => {
              const parts = [`${x.quantity} x :${x.duration} ${x.durationUnit}.`, x.notes ? `\u2013 ${x.notes}` : null]
                .filter((x) => x != null)
                .join(' ');

              return (
                <div
                  key={x.id ?? i}
                  style={{
                    padding: '4px 10px',
                    fontSize: 14,
                    lineHeight: '17px',
                    color: TEXT_COLOR,
                  }}
                >
                  {parts}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!!props.data.offer.coverPageNotes && (
        <div style={{ marginBottom: 12 }}>
          <div style={sectionTitleStyle}>Notes:</div>
          <div
            style={{
              padding: '4px 10px',
              fontSize: 14,
              lineHeight: 1.6,
              color: TEXT_COLOR,
            }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(props.data.offer.coverPageNotes) }}
          />
        </div>
      )}
    </div>
  );
};

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow = (props: InfoRowProps) => {
  return (
    <div style={{ display: 'flex', gap: 4, lineHeight: '29px' }}>
      <span style={{ fontWeight: 400, color: TEXT_COLOR, minWidth: 150, fontSize: 14 }}>{props.label}</span>
      <span style={{ fontWeight: 600, color: TEXT_COLOR, fontSize: 14 }}>{props.value}</span>
    </div>
  );
};

const sectionTitleStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 14,
  color: TEXT_COLOR,
  padding: '8px 0',
  fontFamily: "'Montserrat', sans-serif",
};
