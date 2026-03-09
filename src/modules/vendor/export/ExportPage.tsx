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
            margin: 12mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .export-section {
            page-break-inside: avoid;
          }
        }
        @media screen {
          .export-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
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
        <CoverPage data={data} />
        <TopSheet data={data} />
        <AssumptionsPage data={data} />
        <BudgetDetail data={data} />
      </div>
    </>
  );
};
