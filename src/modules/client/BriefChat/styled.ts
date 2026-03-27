import { styled, keyframes } from 'styled-components';

/* ───── Layout ───── */

export const ChatPageWrapper = styled.div`
  display: flex;
  height: calc(100vh - 70px);
  background: #f8f9fb;
`;

export const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const ChatHeader = styled.div`
  padding: 20px 32px 16px;
  border-bottom: 1px solid #eef0f4;
  background: #ffffff;
`;

export const ChatTitle = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 20px;
  color: #4b5675;
  margin: 0 0 4px 0;
`;

export const ChatSubtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  font-size: 13px;
  color: #99a1b7;
  margin: 0;
`;

/* ───── Messages ───── */

export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
`;

export const MessageRow = styled.div<{ $isUser: boolean }>`
  display: flex;
  justify-content: ${({ $isUser }) => ($isUser ? 'flex-end' : 'flex-start')};
  animation: fadeSlideIn 0.3s ease-out;

  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const MessageBubble = styled.div<{ $isUser: boolean }>`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: ${({ $isUser }) => ($isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px')};
  background: ${({ $isUser }) => ($isUser ? '#2288FF' : '#ffffff')};
  color: ${({ $isUser }) => ($isUser ? '#ffffff' : '#4b5675')};
  box-shadow: ${({ $isUser }) =>
    $isUser ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.08)'};
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const MessageTimestamp = styled.span<{ $isUser: boolean }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  color: ${({ $isUser }) => ($isUser ? 'rgba(255,255,255,0.6)' : '#99a1b7')};
  margin-top: 4px;
  display: block;
`;

/* ───── Typing indicator ───── */

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
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 16px 16px 16px 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  width: fit-content;
  animation: fadeSlideIn 0.3s ease-out;

  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const TypingDot = styled.span<{ $delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #99a1b7;
  animation: ${dotPulse} 1.4s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}ms;
`;

/* ───── Input area ───── */

export const InputArea = styled.div`
  padding: 16px 32px 24px;
  background: #ffffff;
  border-top: 1px solid #eef0f4;
  display: flex;
  gap: 12px;
  align-items: flex-end;
`;

export const ChatInputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

/* ───── Guidance sidebar ───── */

export const GuidancePanel = styled.div`
  width: 300px;
  min-width: 300px;
  background: #ffffff;
  border-left: 1px solid #eef0f4;
  padding: 24px;
  overflow-y: auto;
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

export const GuidanceStep = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 4px;
  background: ${({ $active }) => ($active ? '#F4FBFF' : 'transparent')};
  transition: background 0.15s ease;
`;

export const StepNumber = styled.div<{ $active?: boolean; $completed?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 11px;
  flex-shrink: 0;
  background: ${({ $active, $completed }) =>
    $completed ? '#4CAF50' : $active ? '#2288FF' : '#eef0f4'};
  color: ${({ $active, $completed }) =>
    $completed || $active ? '#ffffff' : '#99a1b7'};
  transition: all 0.2s ease;
`;

export const StepLabel = styled.span<{ $active?: boolean }>`
  font-family: 'Montserrat', sans-serif;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  font-size: 12px;
  color: ${({ $active }) => ($active ? '#4b5675' : '#99a1b7')};
`;

/* ───── Complete overlay ───── */

export const CompleteBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
  border-radius: 12px;
  margin: 8px 0;
  animation: fadeSlideIn 0.4s ease-out;

  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const CompleteBannerText = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #2e7d32;
`;
