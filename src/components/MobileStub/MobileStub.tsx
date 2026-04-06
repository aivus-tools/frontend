'use client';

import React from 'react';

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  display: 'none',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#ffffff',
  padding: '24px',
  textAlign: 'center',
};

const logoStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  color: '#121b3e',
  marginBottom: 32,
  letterSpacing: '-0.02em',
};

const titleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  color: '#121b3e',
  marginBottom: 8,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 400,
  color: '#6b7280',
  maxWidth: 360,
  lineHeight: 1.5,
};

export const MobileStub = () => {
  return (
    <>
      <style>{`
        @media (max-width: 1023px) {
          .aivus-mobile-stub { display: flex !important; }
          .aivus-desktop-content { display: none !important; }
        }
        @media print {
          .aivus-mobile-stub { display: none !important; }
          .aivus-desktop-content { display: block !important; }
        }
      `}</style>
      <div className='aivus-mobile-stub' style={overlayStyle}>
        <div style={logoStyle}>Aivus</div>
        <div style={titleStyle}>Aivus works best on desktop</div>
        <div style={subtitleStyle}>Please open this page on a device with a larger screen to access all features</div>
      </div>
    </>
  );
};
