import { styled } from 'styled-components';

export const SettingsFormWrapper = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 24px;
`;

export const PageTitle = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--main-dark);
  margin-bottom: 32px;
`;

export const SectionTitle = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--main-dark);
  margin-bottom: 16px;
  margin-top: 32px;

  &:first-of-type {
    margin-top: 0;
  }
`;

export const SectionDivider = styled.div`
  border-top: 1px solid #f0f0f0;
  margin: 24px 0;
`;

export const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
`;

export const SettingLabel = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--main-dark);
`;

export const FieldLabel = styled.label`
  display: block;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--main-dark);
  margin-bottom: 6px;
`;

export const FormSection = styled.div`
  margin-bottom: 16px;
`;
