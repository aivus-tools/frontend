'use client';

import React, { useCallback } from 'react';
import { useGetOfferExportDataQuery } from '@/services/client/offersApi';
import { CoverPage } from './CoverPage';
import { TopSheet } from './TopSheet';
import { AssumptionsPage } from './AssumptionsPage';
import { BudgetDetail } from './BudgetDetail';

interface ExportPageProps {
  offerId: string;
}

export const ExportPage: React.FC<ExportPageProps> = props => {
  const { data, isLoading, error } = useGetOfferExportDataQuery(props.offerId);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 16,
        color: '#666',
      }}>
        Loading export data...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 16,
        color: '#cc0000',
      }}>
        Failed to load export data. Please try again.
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .export-toolbar {
            display: none !important;
          }
          @page {
            size: A4 landscape;
            margin: 15mm 18mm 15mm 18mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .export-content {
            padding-top: 0 !important;
          }
          .export-page-section {
            page-break-before: always;
            padding-top: 100px;
          }
          .export-page-section:first-child {
            page-break-before: auto;
            padding-top: 60px;
          }
        }
        @media screen {
          .export-content {
            max-width: 1340px;
            margin: 0 auto;
            padding: 20px 0;
          }
        }
      `}</style>

      <div className="export-toolbar" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        background: '#1a3a5c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <span style={{
          color: 'white',
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 16,
          fontWeight: 600,
        }}>
          Export Preview: {data.project.name}
        </span>
        <button
          onClick={handlePrint}
          style={{
            background: 'white',
            color: '#1a3a5c',
            border: 'none',
            borderRadius: 6,
            padding: '8px 24px',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'Montserrat', sans-serif",
            cursor: 'pointer',
          }}
        >
          Save as PDF
        </button>
      </div>

      <div className="export-content" style={{ paddingTop: 76 }}>
        <div className="export-page-section">
          <CoverPage data={data} />
        </div>
        <div className="export-page-section">
          <TopSheet data={data} />
        </div>
        {!!data.offer.assumptionsExclusions && (
          <div className="export-page-section">
            <AssumptionsPage data={data} />
          </div>
        )}
        <div className="export-page-section">
          <BudgetDetail data={data} />
        </div>
      </div>
    </>
  );
};
