import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';
import {
  BriefV2,
  BriefV2TaskStatus,
  BriefV2ChatResponse,
  BriefV2Detail,
  PublicBriefStartResponse,
} from '@/types/briefV2.interface';

const PUBLIC_BRIEF_STORAGE_KEY = 'aivus_briefs';

export const getPublicBriefToken = (briefId: string): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const stored = localStorage.getItem(PUBLIC_BRIEF_STORAGE_KEY);
    if (!stored) {
      return null;
    }
    const briefs: Record<string, string> = JSON.parse(stored);
    return briefs[briefId] ?? null;
  } catch {
    return null;
  }
};

export const savePublicBriefToken = (briefId: string, token: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const stored = localStorage.getItem(PUBLIC_BRIEF_STORAGE_KEY);
    const briefs: Record<string, string> = stored ? JSON.parse(stored) : {};
    briefs[briefId] = token;
    localStorage.setItem(PUBLIC_BRIEF_STORAGE_KEY, JSON.stringify(briefs));
  } catch {
    // noop
  }
};

export const removePublicBriefToken = (briefId: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const stored = localStorage.getItem(PUBLIC_BRIEF_STORAGE_KEY);
    if (!stored) {
      return;
    }
    const briefs: Record<string, string> = JSON.parse(stored);
    delete briefs[briefId];
    localStorage.setItem(PUBLIC_BRIEF_STORAGE_KEY, JSON.stringify(briefs));
  } catch {
    // noop
  }
};

const SUPPORTED_LANGUAGES = ['en', 'ru', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko'];

export const getBrowserLanguage = (): string => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const languages = navigator.languages || [navigator.language || 'en'];

  for (const lang of languages) {
    const code = lang.split('-')[0].toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(code)) {
      return code;
    }
  }

  return 'en';
};

const publicBaseQuery = fetchBaseQuery({ baseUrl: '' });

export const publicBriefApi = createApi({
  reducerPath: 'publicBriefApi',
  baseQuery: publicBaseQuery,
  endpoints: (builder) => ({
    startPublicBrief: builder.mutation<PublicBriefStartResponse, { message: string; documentLanguage?: string }>({
      query: (body) => ({
        url: ApiRoute.PUBLIC_BRIEF_AI_START,
        method: 'POST',
        body,
      }),
    }),
    getPublicBriefStatus: builder.query<BriefV2TaskStatus, { briefId: string; taskId: string; token: string }>({
      query: (args) => ({
        url: `${ApiRoute.PUBLIC_BRIEF_AI_STATUS(args.briefId)}?taskId=${args.taskId}`,
        method: 'GET',
        headers: { 'X-Brief-Token': args.token },
      }),
    }),
    sendPublicBriefChat: builder.mutation<
      BriefV2ChatResponse,
      { briefId: string; message: string; token: string; documentLanguage?: string }
    >({
      query: (args) => ({
        url: ApiRoute.PUBLIC_BRIEF_AI_CHAT(args.briefId),
        method: 'POST',
        body: { message: args.message, documentLanguage: args.documentLanguage },
        headers: { 'X-Brief-Token': args.token },
      }),
    }),
    getPublicBriefDetail: builder.query<BriefV2Detail, { briefId: string; token: string }>({
      query: (args) => ({
        url: ApiRoute.PUBLIC_BRIEF_AI_DETAIL(args.briefId),
        method: 'GET',
        headers: { 'X-Brief-Token': args.token },
      }),
    }),
    claimPublicBrief: builder.mutation<BriefV2, { briefId: string; token: string }>({
      query: (args) => ({
        url: ApiRoute.PUBLIC_BRIEF_AI_CLAIM(args.briefId),
        method: 'POST',
        headers: { 'X-Brief-Token': args.token },
      }),
    }),
  }),
});

export const {
  useStartPublicBriefMutation,
  useLazyGetPublicBriefStatusQuery,
  useSendPublicBriefChatMutation,
  useGetPublicBriefDetailQuery,
  useLazyGetPublicBriefDetailQuery,
  useClaimPublicBriefMutation,
} = publicBriefApi;
