import { styled } from 'styled-components';

export const ProfileFormWrapper = styled.div`
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

export const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
`;

export const AvatarWrapper = styled.div`
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover .avatar-overlay {
    opacity: 1;
  }
`;

export const AvatarOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: #ffffff;
  font-size: 24px;
`;

export const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const AvatarPlaceholder = styled.div`
  font-size: 36px;
  color: #bfbfbf;
`;

export const FormSection = styled.div`
  margin-bottom: 24px;
`;

export const FieldLabel = styled.label`
  display: block;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--main-dark);
  margin-bottom: 6px;
`;
