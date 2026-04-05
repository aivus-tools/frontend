import { styled, keyframes } from 'styled-components';

export const EditorWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #ffffff;
  border-right: 1px solid #eef0f4;
`;

export const EditorToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-bottom: 1px solid #eef0f4;
  background: #fafbfc;
  flex-wrap: wrap;
`;

export const ToolbarButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: ${(x) => (x.$active ? '#e8f0fe' : 'transparent')};
  color: ${(x) => (x.$active ? '#2288FF' : '#4b5675')};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.15s ease;

  &:hover {
    background: #eef0f4;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const ToolbarDivider = styled.div`
  width: 1px;
  height: 20px;
  background: #eef0f4;
  margin: 0 4px;
`;

export const EditorContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;

  .tiptap {
    outline: none;
    font-family: 'Montserrat', sans-serif;
    font-size: 14px;
    line-height: 1.7;
    color: #1f2937;
  }

  .tiptap h2 {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 12px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid #eef0f4;
  }

  .tiptap h3 {
    font-size: 15px;
    font-weight: 600;
    color: #374151;
    margin: 16px 0 8px 0;
  }

  .tiptap p {
    margin: 0 0 8px 0;
  }

  .tiptap ul,
  .tiptap ol {
    padding-left: 20px;
    margin: 0 0 8px 0;
  }

  .tiptap li {
    margin-bottom: 4px;
  }

  .tiptap strong {
    font-weight: 600;
    color: #111827;
  }

  .tiptap table {
    border-collapse: collapse;
    width: 100%;
    margin: 8px 0;
  }

  .tiptap th,
  .tiptap td {
    border: 1px solid #e5e7eb;
    padding: 8px 12px;
    text-align: left;
    font-size: 13px;
  }

  .tiptap th {
    background: #f9fafb;
    font-weight: 600;
  }

  .tiptap hr {
    border: none;
    border-top: 1px solid #eef0f4;
    margin: 24px 0;
  }

  .tiptap a {
    color: #2288ff;
    text-decoration: underline;
  }

  .tiptap blockquote {
    border-left: 3px solid #2288ff;
    margin: 8px 0;
    padding: 4px 16px;
    color: #6b7280;
  }
`;

const sectionHighlight = keyframes`
  0% {
    background-color: rgba(34, 136, 255, 0.12);
  }
  100% {
    background-color: transparent;
  }
`;

export const SectionWrapper = styled.div<{ $highlighted?: boolean }>`
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: border-color 0.2s ease;
  animation: ${(x) => (x.$highlighted ? sectionHighlight : 'none')} 2s ease-out forwards;

  &:hover {
    border-color: #eef0f4;
  }
`;

export const SectionLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f3f4f6;
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

export const StatusDot = styled.span<{ $status: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${(x) => {
    if (x.$status === 'complete') {
      return '#22c55e';
    }
    if (x.$status === 'draft') {
      return '#f59e0b';
    }
    return '#d1d5db';
  }};
`;

export const CostBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f9fafb;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  color: #6b7280;
  margin-left: auto;
`;
