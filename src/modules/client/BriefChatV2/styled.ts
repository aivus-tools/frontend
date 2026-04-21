import { styled, keyframes } from 'styled-components';

export const ChatPanel = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;
`;

export const ChatHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #eef0f4;
  background: #ffffff;
`;

export const ChatTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #4b5675;
  margin: 0;
`;

export const ChatPhase = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  color: #99a1b7;
  font-weight: 500;
`;

export const ProgressBar = styled.div`
  height: 4px;
  background: #eef0f4;
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${(x) => x.$percent}%;
  background: ${(x) => (x.$percent >= 100 ? '#22c55e' : '#2288ff')};
  border-radius: 2px;
  transition: width 0.5s ease;
`;

export const ProgressText = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  color: #99a1b7;
  font-weight: 500;
`;

export const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
`;

export const MessageRow = styled.div<{ $isUser: boolean }>`
  display: flex;
  justify-content: ${(x) => (x.$isUser ? 'flex-end' : 'flex-start')};
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const MessageBubble = styled.div<{ $isUser: boolean }>`
  max-width: 100%;
  padding: 12px 16px;
  border-radius: ${(x) => (x.$isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px')};
  background: ${(x) => (x.$isUser ? '#2288FF' : '#f3f5f9')};
  color: ${(x) => (x.$isUser ? '#ffffff' : '#1f2937')};
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
  overflow-wrap: anywhere;

  p {
    margin: 0 0 8px 0;
  }
  p:last-child {
    margin-bottom: 0;
  }
  ul,
  ol {
    margin: 4px 0 8px 0;
    padding-left: 20px;
  }
  li {
    margin: 2px 0;
  }
  h1,
  h2,
  h3,
  h4 {
    margin: 10px 0 6px 0;
    font-weight: 700;
  }
  h1 {
    font-size: 16px;
  }
  h2 {
    font-size: 15px;
  }
  h3 {
    font-size: 14px;
  }
  code {
    background: ${(x) => (x.$isUser ? 'rgba(255,255,255,0.2)' : '#e5e7eb')};
    padding: 1px 4px;
    border-radius: 3px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px;
  }
  pre {
    background: ${(x) => (x.$isUser ? 'rgba(0,0,0,0.15)' : '#e5e7eb')};
    padding: 8px 10px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 6px 0;
  }
  pre code {
    background: transparent;
    padding: 0;
  }
  a {
    color: ${(x) => (x.$isUser ? '#ffffff' : '#2288ff')};
    text-decoration: underline;
  }
  strong {
    font-weight: 700;
  }
  blockquote {
    border-left: 3px solid ${(x) => (x.$isUser ? 'rgba(255,255,255,0.4)' : '#d0d5dd')};
    padding-left: 10px;
    margin: 6px 0;
    color: ${(x) => (x.$isUser ? 'rgba(255,255,255,0.9)' : '#6b7280')};
  }
`;

export const MessageMeta = styled.div<{ $isUser: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
  justify-content: ${(x) => (x.$isUser ? 'flex-end' : 'flex-start')};
`;

export const MessageTime = styled.span<{ $isUser: boolean }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  color: ${(x) => (x.$isUser ? 'rgba(255,255,255,0.5)' : '#99a1b7')};
`;

export const SectionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 3px;
  background: #e8f0fe;
  font-family: 'Montserrat', sans-serif;
  font-size: 9px;
  font-weight: 600;
  color: #2288ff;
  text-transform: uppercase;
`;

export const FeedbackRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
`;

export const FeedbackButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: ${(x) => (x.$active ? '#e8f0fe' : 'transparent')};
  color: ${(x) => (x.$active ? '#2288FF' : '#99a1b7')};
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s ease;

  &:hover {
    background: #eef0f4;
    color: #4b5675;
  }
`;

export const CommentModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const CommentRatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CommentRatingButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid ${(x) => (x.$active ? '#2288FF' : '#e5e7eb')};
  border-radius: 6px;
  background: ${(x) => (x.$active ? '#e8f0fe' : '#ffffff')};
  color: ${(x) => (x.$active ? '#2288FF' : '#99a1b7')};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s ease;

  &:hover {
    border-color: #2288ff;
    color: #2288ff;
  }
`;

export const CommentContext = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  color: #99a1b7;
`;

const dotPulse = keyframes`
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
`;

export const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  background: #ffffff;
  border-radius: 14px 14px 14px 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  width: fit-content;
`;

export const TypingDot = styled.span<{ $delay: number }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #99a1b7;
  animation: ${dotPulse} 1.4s ease-in-out infinite;
  animation-delay: ${(x) => x.$delay}ms;
`;

export const InputArea = styled.div`
  position: relative;
  padding: 16px 28px 20px;
  background: #ffffff;
  border-top: 1px solid #eef0f4;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ChatInputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 8px;

  > :first-child {
    flex: 1;
    min-width: 0;
  }

  > button {
    align-self: stretch;
    min-height: 56px;
  }
`;

export const ChatFooterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  color: #99a1b7;
  flex-wrap: wrap;
`;

export const LimitBadge = styled.div`
  padding: 4px 10px;
  background: #fef3cd;
  border-radius: 6px;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  color: #856404;
`;

export const CostBadge = styled.div<{ $staff?: boolean }>`
  padding: 4px 10px;
  background: ${(x) => (x.$staff ? '#eef2ff' : '#f3f4f6')};
  color: ${(x) => (x.$staff ? '#4338ca' : '#4b5675')};
  border-radius: 6px;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 600;
`;

export const DropOverlay = styled.div`
  position: absolute;
  inset: 8px;
  pointer-events: none;
  background: rgba(34, 136, 255, 0.08);
  border: 2px dashed #2288ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2288ff;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 600;
  z-index: 20;
`;

export const AttachmentChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const AttachmentChip = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #f3f5f9;
  border: 1px solid #eef0f4;
  border-radius: 999px;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #4b5675;
  text-decoration: none;
  max-width: min(420px, 100%);
  min-width: 0;

  & > .anticon {
    flex-shrink: 0;
  }

  & > span.name {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & > span:last-child {
    flex-shrink: 0;
    white-space: nowrap;
  }

  &:hover {
    background: #e8ecf2;
    color: #2288ff;
  }
`;

export const GeneratingOverlay = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px;
`;

export const GeneratingTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #4b5675;
  margin: 0;
`;

export const GeneratingSubtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: #99a1b7;
  margin: 0;
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #eef0f4;
  border-top-color: #2288ff;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;
