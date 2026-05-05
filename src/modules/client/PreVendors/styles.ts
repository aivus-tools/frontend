import { styled } from 'styled-components';

export const Section = styled.section`
  background: #ffffff;
  border-radius: 16px;
  padding: 24px 28px;
  margin: 16px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: 'Inter', sans-serif;

  @media (max-width: 1023px) {
    padding: 20px 20px;
    margin: 12px 16px 24px;
  }

  @media (max-width: 767px) {
    padding: 16px 12px;
    margin: 8px 8px 16px;
    border-radius: 12px;
    gap: 12px;
  }
`;

export const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

export const HeaderLogo = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

export const HeaderTitle = styled.h2`
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  color: #2a282f;
  margin: 0;
  text-align: right;

  @media (max-width: 767px) {
    font-size: 16px;
    line-height: 22px;
    text-align: left;
  }
`;

export const HeaderTextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #4b5675;
  width: 100%;
`;

export const HeaderHeading = styled.p`
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: #2a282f;
  margin: 0;
`;

export const HeaderDescription = styled.p`
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 13px;
  line-height: 1.5;
  color: #4b5675;
  margin: 0;

  a {
    color: #4b5675;
    text-decoration: underline;

    &:hover {
      color: #2288ff;
    }
  }
`;

export const SimpleHeader = styled.h2`
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  color: #2a282f;
  margin: 0;

  @media (max-width: 767px) {
    font-size: 16px;
    line-height: 22px;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;

  @media (max-width: 1279px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const Card = styled.article`
  background: #f3f5f8;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: 'Inter', sans-serif;
  min-width: 0;

  @media (max-width: 767px) {
    padding: 10px;
    gap: 12px;
  }
`;

export const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
`;

export const CardLogo = styled.div`
  width: 40px;
  height: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    object-position: left center;
  }
`;

export const CardLogoFallback = styled.div`
  width: 40px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 4px;
  background: #e5e7ec;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #99a1b7;
  font-size: 10px;
  font-weight: 600;
`;

export const CardTopText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
`;

export const CardRank = styled.p`
  font-weight: 600;
  font-size: 14px;
  line-height: 1.2;
  color: #2a282f;
  margin: 0;
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CardCategory = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 1.2;
  color: #a8a6ac;
  margin: 0;
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CardTopSpacer = styled.div`
  flex: 1 1 auto;
`;

export const PortfolioButton = styled.a`
  background: #2b2930;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 12px;
  line-height: 1;
  letter-spacing: -0.3px;
  padding: 6px 8px;
  border-radius: 6px;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: #1f1d24;
    color: #ffffff;
  }
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

export const CardTitle = styled.p`
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  font-size: 24px;
  line-height: 30px;
  color: #2a282f;
  margin: 0;
  word-break: break-word;

  @media (max-width: 767px) {
    font-size: 20px;
    line-height: 26px;
  }
`;

export const CardDescription = styled.p`
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 13px;
  line-height: 1.4;
  color: #4b5675;
  margin: 0;
  letter-spacing: -0.2px;
  min-height: calc(13px * 1.4 * 4);

  @media (max-width: 767px) {
    font-size: 12px;
    min-height: calc(12px * 1.4 * 4);
  }
`;

export const CardFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

export const SendBriefButton = styled.a<{ $disabled?: boolean }>`
  background: ${(x) => (x.$disabled ? '#c5c4c8' : '#7949ff')};
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 13px;
  line-height: 1;
  letter-spacing: -0.3px;
  padding: 10px;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
  width: 100%;
  display: block;
  cursor: ${(x) => (x.$disabled ? 'not-allowed' : 'pointer')};
  pointer-events: ${(x) => (x.$disabled ? 'none' : 'auto')};

  &:hover {
    background: ${(x) => (x.$disabled ? '#c5c4c8' : '#6536e0')};
    color: #ffffff;
  }
`;

export const CardAddress = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 12px;
  line-height: 1.2;
  color: #1a1a1a;

  svg {
    flex-shrink: 0;
  }
`;

export const PickVendorButtonRu = styled.button`
  background: #d9212b;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  font-size: 13px;
  line-height: 1;
  letter-spacing: 0.15px;
  height: 32px;

  &:hover:not(:disabled) {
    background: #b91923;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
