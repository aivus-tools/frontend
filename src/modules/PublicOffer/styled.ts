'use client';

import { styled } from 'styled-components';
import { media } from '@/styles/breakpoints';

export const PageContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background: #ffffff;
`;

export const PublicHeader = styled.header`
  width: 100%;
  height: 70px;
  background: #ffffff;
  box-shadow: 0px 5px 16.5px -11px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 37px;

  ${media.mobile} {
    height: 56px;
    padding: 0 14px;
  }
`;

export const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const MainContent = styled.main`
  max-width: 1130px;
  margin: 0 auto;
  padding: 30px;

  ${media.mobile} {
    max-width: 100%;
    padding: 16px 14px;
  }
`;

// Guest CTA Banner
export const GuestBanner = styled.div`
  width: 100%;
  background: #f4fbff;
  border: 1px solid #2288ff;
  border-radius: 6px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 14px 16px;
  }
`;

export const BannerText = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #4b5675;
`;

export const BannerActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  ${media.mobile} {
    flex-wrap: wrap;
    gap: 8px;
    & > .ant-btn {
      flex: 1 1 auto;
    }
  }
`;

export const LoginLink = styled.a`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: #2288ff;
  text-decoration: underline;
  cursor: pointer;
`;

// Vendor-author Banner
export const AuthorBanner = styled.div`
  width: 100%;
  background: #f4fbdb;
  border: 1px solid #a5c500;
  border-radius: 6px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;

  ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
    padding: 12px 16px;
  }
`;

export const AuthorBannerText = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #a5c500;
`;

export const EditLink = styled.a`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: #2288ff;
  margin-left: auto;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

// Vendor-other Info Bar
export const InfoBar = styled.div`
  width: 100%;
  background: #f9f9f9;
  padding: 8px 37px;
  border-bottom: 1px solid #e5e5e5;

  ${media.mobile} {
    padding: 8px 14px;
  }
`;

export const InfoBarText = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: #99a1b7;
`;

// Client Action Panel
export const ClientPanel = styled.div`
  width: 100%;
  background: #f4fbff;
  border: 1px solid #2288ff;
  border-radius: 6px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;

  ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
    padding: 14px 16px;
    gap: 10px;
  }
`;

export const ClientLabel = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #4b5675;
  white-space: nowrap;
`;

// Error/Empty states
export const FullPageMessage = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #ffffff;
`;

export const ErrorTitle = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 20px;
  color: #4b5675;
  margin-bottom: 16px;
  text-align: center;
`;

export const ErrorSubtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #99a1b7;
  text-align: center;
  max-width: 400px;
`;

// Read-only offer table wrapper
export const OfferTableWrapper = styled.div`
  background: #ffffff;
  border-radius: 6px;

  ${media.mobile} {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;
