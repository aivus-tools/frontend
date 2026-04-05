'use client';

import React from 'react';
import { styled } from 'styled-components';

const StubWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 120px);
  flex-direction: column;
  gap: 12px;
`;

const StubTitle = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 20px;
  color: #4b5675;
  margin: 0;
`;

const StubText = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  color: #99a1b7;
  margin: 0;
`;

export default function BriefOffersPage() {
  return (
    <StubWrapper>
      <StubTitle>Vendor Offers</StubTitle>
      <StubText>Coming soon</StubText>
    </StubWrapper>
  );
}
