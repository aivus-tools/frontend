'use client';

import { styled } from 'styled-components';

export const Title = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: #4b5675;
  margin: 0 0 24px 0;
`;

export const LinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
`;

export const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px 0;
`;

export const ToggleLabel = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: #4b5675;
`;

export const Divider = styled.div`
  border-top: 1px dashed #d9d9d9;
  margin: 16px 0;
`;

export const SharedLabel = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 10px;
  color: #99a1b7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

export const OwnerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
`;

export const OwnerName = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: #4b5675;
`;

export const OwnerBadge = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 10px;
  color: #99a1b7;
`;

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;
