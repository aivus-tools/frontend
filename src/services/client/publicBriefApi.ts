import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';
import { guessAudioExtension } from '@/services/client/briefAiApi';
import {
  BriefAttachment,
  BriefFinalDocument,
  BriefFinalPackage,
  BriefV3ChatResponse,
  BriefV3ClaimResponse,
  BriefV3Detail,
  BriefV3StartResponse,
  BriefV3TaskStatus,
} from '@/types/briefAi.interface';
import { BrandedBriefSlugInfo, BriefDraftBySlugResponse, BriefSendResponse } from '@/types/vendorSettings.interface';

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
  tagTypes: ['PublicBriefV3', 'PublicBriefFinalDocuments'],
  endpoints: (builder) => ({
    getPublicBriefBySlug: builder.query<BrandedBriefSlugInfo, string>({
      query: (slug) => ({
        url: ApiRoute.PUBLIC_BRIEF_AI_BY_SLUG(slug),
        method: 'GET',
      }),
    }),

    createPublicBriefDraftBySlug: builder.mutation<BriefDraftBySlugResponse, string>({
      query: (slug) => ({
        url: ApiRoute.PUBLIC_BRIEF_AI_BY_SLUG_DRAFT(slug),
        method: 'POST',
      }),
    }),

    getPublicBriefFinalDocuments: builder.query<BriefFinalPackage, { briefId: string; token: string }>({
      query: (args) => ({
        url: ApiRoute.PUBLIC_BRIEF_AI_FINAL_DOCUMENTS(args.briefId),
        method: 'GET',
        headers: { 'X-Brief-Token': args.token },
      }),
      providesTags: (_r, _e, args) => [{ type: 'PublicBriefFinalDocuments', id: args.briefId }],
    }),

    updatePublicBriefFinalDocument: builder.mutation<
      BriefFinalDocument,
      { briefId: string; documentId: string; html: string; plainText?: string; token: string }
    >({
      query: (args) => ({
        url: ApiRoute.PUBLIC_BRIEF_AI_FINAL_DOCUMENT(args.briefId, args.documentId),
        method: 'PATCH',
        body: { html: args.html, plainText: args.plainText },
        headers: { 'X-Brief-Token': args.token },
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          publicBriefApi.util.updateQueryData(
            'getPublicBriefFinalDocuments',
            { briefId: args.briefId, token: args.token },
            (draft) => {
              const doc = draft.documents.find((x) => x.id === args.documentId);
              if (doc) {
                doc.html = args.html;
                if (args.plainText !== undefined) {
                  doc.plainText = args.plainText;
                }
              }
            }
          )
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            publicBriefApi.util.updateQueryData(
              'getPublicBriefFinalDocuments',
              { briefId: args.briefId, token: args.token },
              (draft) => {
                const doc = draft.documents.find((x) => x.id === args.documentId);
                if (doc) {
                  doc.html = data.html;
                  doc.plainText = data.plainText;
                  doc.updatedAt = data.updatedAt;
                }
              }
            )
          );
        } catch {
          patch.undo();
        }
      },
    }),

    sendPublicBriefToVendor: builder.mutation<
      BriefSendResponse,
      { briefId: string; token: string; email?: string; slug?: string; idempotencyKey?: string }
    >({
      query: (args) => ({
        url: ApiRoute.PUBLIC_BRIEF_AI_SEND(args.briefId),
        method: 'POST',
        body: {
          ...(args.email ? { email: args.email } : {}),
          ...(args.slug ? { slug: args.slug } : {}),
          ...(args.idempotencyKey ? { idempotencyKey: args.idempotencyKey } : {}),
        },
        headers: { 'X-Brief-Token': args.token },
      }),
    }),

    sendClientBriefToVendor: builder.mutation<
      BriefSendResponse,
      { briefId: string; slug: string; idempotencyKey?: string }
    >({
      query: (args) => ({
        url: ApiRoute.CLIENT_BRIEF_AI_SEND(args.briefId),
        method: 'POST',
        body: {
          slug: args.slug,
          ...(args.idempotencyKey ? { idempotencyKey: args.idempotencyKey } : {}),
        },
      }),
    }),

    createPublicBriefDraft: builder.mutation<{ briefId: string; token: string }, void>({
      query: () => ({
        url: ApiRoute.PUBLIC_BRIEF_AI_DRAFT,
        method: 'POST',
      }),
    }),

    startPublicBrief: builder.mutation<
      BriefV3StartResponse,
      {
        briefId: string;
        token: string;
        message: string;
        attachmentIds?: string[];
        documentLanguage?: string;
      }
    >({
      query: (args) => ({
        url: ApiRoute.PUBLIC_BRIEF_AI_START(args.briefId),
        method: 'POST',
        body: {
          message: args.message,
          attachmentIds: args.attachmentIds ?? [],
          documentLanguage: args.documentLanguage,
        },
        headers: { 'X-Brief-Token': args.token },
      }),
      invalidatesTags: (_r, _e, args) => [{ type: 'PublicBriefV3', id: args.briefId }],
    }),

    getPublicBriefStatus: builder.query<BriefV3TaskStatus, { briefId: string; taskId: string; token: string }>({
      query: (args) => ({
        url: `${ApiRoute.PUBLIC_BRIEF_AI_STATUS(args.briefId)}?taskId=${args.taskId}`,
        method: 'GET',
        headers: { 'X-Brief-Token': args.token },
      }),
    }),

    sendPublicBriefChat: builder.mutation<
      BriefV3ChatResponse,
      {
        briefId: string;
        message: string;
        token: string;
        attachmentIds?: string[];
        documentHtml?: string | null;
      }
    >({
      query: (args) => ({
        url: ApiRoute.PUBLIC_BRIEF_AI_CHAT(args.briefId),
        method: 'POST',
        body: {
          message: args.message,
          attachmentIds: args.attachmentIds ?? [],
          ...(args.documentHtml != null ? { documentHtml: args.documentHtml } : {}),
        },
        headers: { 'X-Brief-Token': args.token },
      }),
      invalidatesTags: (_r, _e, args) => [{ type: 'PublicBriefV3', id: args.briefId }],
    }),

    uploadPublicBriefAttachment: builder.mutation<BriefAttachment, { briefId: string; token: string; file: File }>({
      query: (args) => {
        const formData = new FormData();
        formData.append('file', args.file);
        return {
          url: ApiRoute.PUBLIC_BRIEF_AI_ATTACHMENTS(args.briefId),
          method: 'POST',
          body: formData,
          headers: { 'X-Brief-Token': args.token },
        };
      },
    }),

    deletePublicBriefAttachment: builder.mutation<
      { deleted: boolean },
      { briefId: string; attachmentId: string; token: string }
    >({
      query: (args) => ({
        url: ApiRoute.PUBLIC_BRIEF_AI_ATTACHMENT_DELETE(args.briefId, args.attachmentId),
        method: 'DELETE',
        headers: { 'X-Brief-Token': args.token },
      }),
    }),

    transcribePublicBrief: builder.mutation<
      { text: string; language: string; model: string },
      { briefId: string; token: string; audio: Blob; mimeType: string; language?: string; durationMs?: number }
    >({
      query: (args) => {
        const formData = new FormData();
        const filename = `voice.${guessAudioExtension(args.mimeType)}`;
        formData.append('audio', args.audio, filename);
        if (args.language) {
          formData.append('language', args.language);
        }
        if (args.durationMs !== undefined) {
          formData.append('durationMs', String(Math.round(args.durationMs)));
        }
        return {
          url: ApiRoute.PUBLIC_BRIEF_AI_TRANSCRIBE(args.briefId),
          method: 'POST',
          body: formData,
          headers: { 'X-Brief-Token': args.token },
        };
      },
    }),

    getPublicBriefDetail: builder.query<BriefV3Detail, { briefId: string; token: string }>({
      query: (args) => ({
        url: ApiRoute.PUBLIC_BRIEF_AI_DETAIL(args.briefId),
        method: 'GET',
        headers: { 'X-Brief-Token': args.token },
      }),
      providesTags: (_r, _e, args) => [{ type: 'PublicBriefV3', id: args.briefId }],
    }),

    claimPublicBrief: builder.mutation<BriefV3ClaimResponse, { briefId: string; token: string }>({
      query: (args) => ({
        url: ApiRoute.CLIENT_BRIEF_AI_CLAIM(args.briefId),
        method: 'POST',
        headers: { 'X-Brief-Token': args.token },
      }),
    }),
  }),
});

export const {
  useGetPublicBriefBySlugQuery,
  useLazyGetPublicBriefBySlugQuery,
  useCreatePublicBriefDraftBySlugMutation,
  useGetPublicBriefFinalDocumentsQuery,
  useLazyGetPublicBriefFinalDocumentsQuery,
  useUpdatePublicBriefFinalDocumentMutation,
  useSendPublicBriefToVendorMutation,
  useSendClientBriefToVendorMutation,
  useCreatePublicBriefDraftMutation,
  useStartPublicBriefMutation,
  useLazyGetPublicBriefStatusQuery,
  useSendPublicBriefChatMutation,
  useUploadPublicBriefAttachmentMutation,
  useDeletePublicBriefAttachmentMutation,
  useTranscribePublicBriefMutation,
  useGetPublicBriefDetailQuery,
  useClaimPublicBriefMutation,
} = publicBriefApi;
