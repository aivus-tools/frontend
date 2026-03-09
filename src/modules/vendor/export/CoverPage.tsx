import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { OfferExportData } from '@/types/exportData.interface';

interface CoverPageProps {
  data: OfferExportData;
}

const HEADER_COLOR = '#1a3a5c';
const FONT_FAMILY = "'Montserrat', sans-serif";

const formatDate = (value: string | null): string => {
  if (value == null) {
    return '—';
  }
  const date = new Date(value);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const CoverPage: React.FC<CoverPageProps> = props => {
  const producer = props.data.collaborators.find(x => x.role === 'producer') ?? null;
  const agencyProducer = props.data.collaborators.find(x => x.role === 'agency_producer') ?? null;
  const firstClientManager = props.data.project.clientManagers.length > 0
    ? props.data.project.clientManagers[0]
    : null;

  const shareUrl = props.data.shareToken != null
    ? `${window.location.origin}/public/${props.data.shareToken}`
    : null;

  const clientBrand = [props.data.project.clientName, props.data.project.brandName]
    .filter(x => x != null)
    .join(' / ') || '—';

  return (
    <div
      style={{
        fontFamily: FONT_FAMILY,
        color: '#333',
        maxWidth: 1000,
        margin: '0 auto',
        padding: 32,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 32,
          paddingBottom: 24,
          borderBottom: `3px solid ${HEADER_COLOR}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {props.data.vendor.logoUrl != null && (
            <img
              src={props.data.vendor.logoUrl}
              alt={props.data.vendor.companyName ?? props.data.vendor.name}
              style={{ maxHeight: 80, maxWidth: 200, objectFit: 'contain', marginBottom: 8 }}
            />
          )}
          <span style={{ fontSize: 14, fontWeight: 600, color: '#555' }}>
            {props.data.vendor.companyName ?? props.data.vendor.name}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ textAlign: 'right', fontSize: 12, lineHeight: 1.8 }}>
            <div>
              <span style={{ fontWeight: 600 }}>Bid Number: </span>
              {props.data.offer.uuid.slice(0, 8)}
            </div>
            <div>
              <span style={{ fontWeight: 600 }}>Bid Date: </span>
              {formatDate(props.data.offer.bidDate)}
            </div>
            <div>
              <span style={{ fontWeight: 600 }}>Bid Version: </span>
              {props.data.project.name}
            </div>
            <div>
              <span style={{ fontWeight: 600 }}>AIVUS ID: </span>
              {props.data.offer.id.slice(0, 8)}
            </div>
          </div>
          {shareUrl != null && (
            <QRCodeSVG value={shareUrl} size={80} level="M" />
          )}
        </div>
      </div>

      <div
        style={{
          background: HEADER_COLOR,
          color: '#fff',
          padding: '10px 16px',
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 0.5,
          marginBottom: 0,
        }}
      >
        BID INFORMATION
      </div>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: 24,
          fontSize: 13,
        }}
      >
        <tbody>
          <tr>
            <td style={infoCellStyle}>
              <span style={labelStyle}>Production Company</span>
              <span style={valueStyle}>
                {props.data.vendor.companyName ?? props.data.vendor.name}
              </span>
            </td>
            <td style={infoCellStyle}>
              <span style={labelStyle}>Client / Brand</span>
              <span style={valueStyle}>{clientBrand}</span>
            </td>
          </tr>
          <tr>
            <td style={infoCellStyle}>
              <span style={labelStyle}>Producer</span>
              <span style={valueStyle}>{producer != null ? producer.name : '—'}</span>
            </td>
            <td style={infoCellStyle}>
              <span style={labelStyle}>Client Manager</span>
              <span style={valueStyle}>
                {firstClientManager != null
                  ? `${firstClientManager.name}${firstClientManager.position ? ', ' + firstClientManager.position : ''}`
                  : '—'}
              </span>
            </td>
          </tr>
          <tr>
            <td style={infoCellStyle}>
              <span style={labelStyle}>Agency</span>
              <span style={valueStyle}>{props.data.project.agencyName ?? '—'}</span>
            </td>
            <td style={infoCellStyle}>
              <span style={labelStyle}>Agency Producer</span>
              <span style={valueStyle}>
                {agencyProducer != null ? agencyProducer.name : '—'}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: 24,
          fontSize: 13,
        }}
      >
        <tbody>
          <tr>
            <td style={infoCellStyle}>
              <span style={labelStyle}>Term</span>
              <span style={valueStyle}>{props.data.offer.term ?? '—'}</span>
            </td>
          </tr>
          <tr>
            <td style={infoCellStyle}>
              <span style={labelStyle}>Territory</span>
              <span style={valueStyle}>
                {props.data.offer.territory.length > 0
                  ? props.data.offer.territory.join(', ')
                  : '—'}
              </span>
            </td>
          </tr>
          <tr>
            <td style={infoCellStyle}>
              <span style={labelStyle}>Media Placements</span>
              <span style={valueStyle}>
                {props.data.offer.mediaPlacements.length > 0
                  ? props.data.offer.mediaPlacements.join(', ')
                  : '—'}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {props.data.offer.deliverables.length > 0 && (
        <>
          <div
            style={{
              background: HEADER_COLOR,
              color: '#fff',
              padding: '10px 16px',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 0.5,
              marginBottom: 0,
            }}
          >
            DELIVERABLES
          </div>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: 24,
              fontSize: 13,
            }}
          >
            <thead>
              <tr>
                {['Qty', 'Duration', 'Unit', 'Notes'].map(x => (
                  <th
                    key={x}
                    style={{
                      textAlign: 'left',
                      padding: '10px 8px',
                      borderBottom: `2px solid ${HEADER_COLOR}`,
                      fontWeight: 700,
                      fontSize: 12,
                      textTransform: 'uppercase' as const,
                      letterSpacing: 0.5,
                      color: HEADER_COLOR,
                    }}
                  >
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.data.offer.deliverables.map((x, i) => (
                <tr
                  key={x.id ?? i}
                  style={{ background: i % 2 === 0 ? '#f8f9fa' : '#fff' }}
                >
                  <td style={tableCellStyle}>{x.quantity}</td>
                  <td style={tableCellStyle}>{x.duration}</td>
                  <td style={tableCellStyle}>{x.durationUnit}</td>
                  <td style={tableCellStyle}>{x.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {!!props.data.offer.coverPageNotes && (
        <>
          <div
            style={{
              background: HEADER_COLOR,
              color: '#fff',
              padding: '10px 16px',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 0.5,
              marginBottom: 0,
            }}
          >
            NOTES
          </div>
          <div
            style={{
              padding: '16px 8px',
              fontSize: 13,
              lineHeight: 1.6,
              borderBottom: `1px solid #ddd`,
            }}
            dangerouslySetInnerHTML={{ __html: props.data.offer.coverPageNotes }}
          />
        </>
      )}
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  color: '#888',
  marginBottom: 2,
};

const valueStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: '#333',
};

const infoCellStyle: React.CSSProperties = {
  padding: '10px 8px',
  borderBottom: '1px solid #e0e0e0',
  verticalAlign: 'top',
  width: '50%',
};

const tableCellStyle: React.CSSProperties = {
  padding: '8px',
  borderBottom: '1px solid #e0e0e0',
  verticalAlign: 'top',
};
