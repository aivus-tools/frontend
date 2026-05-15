import { styled } from 'styled-components';
import { media } from '@/styles/breakpoints';

export const FormPageWrapper = styled.div`
  display: flex;
  min-height: calc(100dvh - var(--aivus-header-h));
  background: #f8f9fb;

  ${media.mobile} {
    flex-direction: column;
  }
`;

export const FormArea = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: calc(100dvh - var(--aivus-header-h));
  padding: 24px 32px 80px;

  ${media.mobile} {
    padding: 16px 14px 96px;
    max-height: none;
  }
`;

export const FormHeader = styled.div`
  margin-bottom: 24px;
`;

export const FormTitle = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 20px;
  color: #4b5675;
  margin: 0 0 4px 0;
`;

export const FormSubtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  font-size: 13px;
  color: #99a1b7;
  margin: 0;
`;

export const SectionCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
  margin-bottom: 20px;

  ${media.mobile} {
    padding: 16px;
    margin-bottom: 14px;
  }
`;

export const SectionTitle = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 12px;
  color: #2288ff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 20px 0;
`;

export const FieldRow = styled.div`
  display: flex;
  gap: 16px;

  & > * {
    flex: 1;
  }

  ${media.mobile} {
    flex-direction: column;
    gap: 12px;
  }
`;

export const FormFooter = styled.div`
  position: sticky;
  bottom: 0;
  background: #ffffff;
  border-top: 1px solid #eef0f4;
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;

  ${media.mobile} {
    padding: 12px 14px calc(12px + env(safe-area-inset-bottom, 0px));
    gap: 8px;
  }
`;

export const FooterLeft = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #99a1b7;
`;

export const FooterRight = styled.div`
  display: flex;
  gap: 12px;
`;

export const AddMoreButton = styled.button`
  border: 1px dashed #d9d9d9;
  background: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: #2288ff;
  transition: all 0.15s ease;

  &:hover {
    border-color: #2288ff;
    background: #f4fbff;
  }
`;

/* ───── Guidance Panel (shared style) ───── */

export const GuidancePanel = styled.div`
  width: 300px;
  min-width: 300px;
  background: #ffffff;
  border-left: 1px solid #eef0f4;
  padding: 24px;
  overflow-y: auto;
  max-height: calc(100dvh - var(--aivus-header-h));

  ${media.mobile} {
    width: 100%;
    min-width: 0;
    border-left: 0;
    border-top: 1px solid #eef0f4;
    max-height: none;
    padding: 16px 14px;
  }
`;

export const GuidanceTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 12px;
  color: #2288ff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 16px 0;
`;

export const GuidanceText = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  font-size: 13px;
  color: #4b5675;
  line-height: 1.6;
  margin: 0 0 12px 0;
`;
