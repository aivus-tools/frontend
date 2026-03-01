'use client';

import { styled } from 'styled-components';

export const MetaFormContainer = styled.div`
  border-radius: 6px;
  box-shadow: 0px 5px 16.5px -11px rgba(0, 0, 0, 0.25);
  margin-bottom: 20px;
  overflow: hidden;
`;

export const MetaFormHeader = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 55px;
  padding: 0 40px 0 2px;
  cursor: pointer;
  user-select: none;
  background: var(--white);
  border-radius: 6px 6px 0 0;
  ${({ $isOpen }) => $isOpen ? 'border-bottom: 0.5px dashed #99a1b7;' : ''}
`;

export const MetaFormHeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

export const MetaFormHeaderTitle = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 100%;
  color: #2288ff;
  text-transform: uppercase;
`;

export const ChevronIcon = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  transform: rotate(${({ $isOpen }) => ($isOpen ? '0deg' : '270deg')});
  transition: transform 0.2s ease;
`;

export const MetaFormBody = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--white);
`;

export const FormRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

export const FormField = styled.div<{ $width?: string; $flex?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  ${({ $width }) => ($width ? `width: ${$width};` : '')}
  ${({ $width, $flex }) => (!$width || $flex ? 'flex: 1;' : '')}
  min-width: 0;
`;

export const FieldLabel = styled.label`
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: #4b5675;
`;

export const FieldInput = styled.input`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #4b5675;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 10px 11px;
  outline: none;
  background: var(--white);
  width: 100%;

  &::placeholder {
    color: #d9d9d9;
    font-weight: 400;
  }

  &:focus {
    border-color: var(--blue);
  }
`;

export const FieldSelect = styled.select`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #4b5675;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 10px 11px;
  outline: none;
  background: var(--white);
  width: 100%;
  cursor: pointer;
  appearance: auto;

  &:focus {
    border-color: var(--blue);
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

export const SectionLabel = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #4b5675;
`;

export const HintText = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 10px;
  line-height: 12px;
  color: #a0a0a0;
`;

export const DynamicRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const InlineLabel = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: #4b5675;
  white-space: nowrap;
`;

export const SmallInput = styled(FieldInput) <{ $width?: string }>`
  width: ${({ $width }) => $width || '50px'};
  flex: none;
  text-align: center;
  padding: 10px 6px;
`;

export const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: var(--gray-light);
  padding: 4px 0;

  &:hover {
    color: var(--main);
  }
`;

export const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--gray-light);
  padding: 4px;
  width: 24px;
  height: 24px;
  flex-shrink: 0;

  &:hover {
    color: var(--red);
  }
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 6px 8px;
  min-height: 42px;
  background: var(--white);
  cursor: text;
  align-items: center;

  &:focus-within {
    border-color: var(--blue);
  }
`;

export const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-blue-subtotal);
  border-radius: 4px;
  padding: 4px 8px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: var(--main);
`;

export const TagRemove = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 14px;
  height: 14px;
  flex-shrink: 0;

  svg {
    width: 14px;
    height: 14px;
    position: relative;
    top: 1px;
    display: block;
  }

  svg path {
    stroke: #99a1b7;
  }

  &:hover svg path {
    stroke: var(--red, #d63c22);
  }
`;

export const TagInput = styled.input`
  border: none;
  outline: none;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #4b5675;
  min-width: 80px;
  flex: 1;
  padding: 2px 0;
  background: transparent;

  &::placeholder {
    color: #d9d9d9;
    font-weight: 400;
  }
`;

export const EditorWrapper = styled.div`
  .tox-tinymce {
    border: 1px solid #d9d9d9 !important;
    border-radius: 6px !important;
  }

  .tox .tox-toolbar__primary {
    background: var(--white) !important;
  }
`;

export const DeliverableNotesInput = styled(FieldInput)`
  flex: 1;
`;

export const ScheduleNotesInput = styled(FieldInput)`
  flex: 1;
`;
