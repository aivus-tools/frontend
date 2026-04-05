import { styled, keyframes } from 'styled-components';

export const ChatPanel = styled.div`
  width: 420px;
  min-width: 420px;
  display: flex;
  flex-direction: column;
  background: #f8f9fb;
  border-left: 1px solid #eef0f4;
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

export const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  max-width: 85%;
  padding: 10px 14px;
  border-radius: ${(x) => (x.$isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px')};
  background: ${(x) => (x.$isUser ? '#2288FF' : '#ffffff')};
  color: ${(x) => (x.$isUser ? '#ffffff' : '#4b5675')};
  box-shadow: ${(x) => (x.$isUser ? 'none' : '0 1px 4px rgba(0, 0, 0, 0.06)')};
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const MessageMeta = styled.div<{ $isUser: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
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
  padding: 12px 20px 16px;
  background: #ffffff;
  border-top: 1px solid #eef0f4;
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

export const ChatInputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

export const LimitBadge = styled.div`
  padding: 8px 16px;
  background: #fef3cd;
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #856404;
  text-align: center;
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
