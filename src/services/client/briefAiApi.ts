import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';
import {
  BriefAttachment,
  BriefFeedbackResponse,
  BriefFinalDocument,
  BriefFinalPackage,
  BriefShareInfo,
  BriefShareView,
  BriefV3ChatResponse,
  BriefV3Detail,
  BriefV3ListItem,
  BriefV3StartResponse,
  BriefV3TaskStatus,
  FeedbackRating,
  LLMMessageTraceResponse,
} from '@/types/briefAi.interface';

export const guessAudioExtension = (mimeType: string): string => {
  const base = (mimeType || '').split(';')[0].trim().toLowerCase();
  if (base === 'audio/webm') {
    return 'webm';
  }
  if (base === 'audio/ogg') {
    return 'ogg';
  }
  if (base === 'audio/mp4' || base === 'audio/mp4a-latm' || base === 'audio/x-m4a') {
    return 'm4a';
  }
  if (base === 'audio/aac') {
    return 'aac';
  }
  if (base === 'audio/mpeg') {
    return 'mp3';
  }
  return 'bin';
};

export const briefAiApi = createApi({
  reducerPath: 'briefAiApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  tagTypes: ['BriefV3', 'BriefFinalDocuments', 'BriefShare', 'BriefShareView'],
  endpoints: (builder) => ({
    createBriefAiDraft: builder.mutation<{ briefId: string }, void>({
      query: () => ({
        url: ApiRoute.BRIEF_AI_DRAFT,
        method: 'POST',
      }),
      invalidatesTags: ['BriefV3'],
    }),

    startBriefAi: builder.mutation<
      BriefV3StartResponse,
      { briefId: string; message: string; attachmentIds?: string[]; documentLanguage?: string }
    >({
      query: (args) => ({
        url: ApiRoute.BRIEF_AI_START(args.briefId),
        method: 'POST',
        body: {
          message: args.message,
          attachmentIds: args.attachmentIds ?? [],
          ...(args.documentLanguage ? { documentLanguage: args.documentLanguage } : {}),
        },
      }),
      invalidatesTags: ['BriefV3'],
    }),

    getBriefAiStatus: builder.query<BriefV3TaskStatus, { briefId: string; taskId: string }>({
      query: (args) => ({
        url: `${ApiRoute.BRIEF_AI_STATUS(args.briefId)}?taskId=${args.taskId}`,
        method: 'GET',
      }),
    }),

    sendBriefAiChat: builder.mutation<
      BriefV3ChatResponse,
      { briefId: string; message: string; attachmentIds?: string[] }
    >({
      query: (args) => ({
        url: ApiRoute.BRIEF_AI_CHAT(args.briefId),
        method: 'POST',
        body: { message: args.message, attachmentIds: args.attachmentIds ?? [] },
      }),
      invalidatesTags: ['BriefV3'],
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (!data.updatedDocuments?.length) {
            return;
          }
          dispatch(
            briefAiApi.util.updateQueryData('getBriefAiFinalDocuments', args.briefId, (draft) => {
              for (const updated of data.updatedDocuments) {
                const existing = draft.documents.find((x) => x.id === updated.id);
                if (existing) {
                  existing.html = updated.html;
                  existing.plainText = updated.plainText;
                  existing.updatedAt = updated.updatedAt;
                }
              }
            })
          );
        } catch {
          /* mutation failure — nothing to sync */
        }
      },
    }),

    getBriefAiDetail: builder.query<BriefV3Detail, string>({
      query: (briefId) => ({
        url: ApiRoute.BRIEF_AI_DETAIL(briefId),
        method: 'GET',
      }),
      providesTags: ['BriefV3'],
    }),

    uploadBriefAiAttachment: builder.mutation<BriefAttachment, { briefId: string; file: File }>({
      query: (args) => {
        const formData = new FormData();
        formData.append('file', args.file);
        return {
          url: ApiRoute.BRIEF_AI_ATTACHMENTS(args.briefId),
          method: 'POST',
          body: formData,
        };
      },
    }),

    deleteBriefAiAttachment: builder.mutation<{ deleted: boolean }, { briefId: string; attachmentId: string }>({
      query: (args) => ({
        url: ApiRoute.BRIEF_AI_ATTACHMENT_DELETE(args.briefId, args.attachmentId),
        method: 'DELETE',
      }),
    }),

    transcribeBriefAi: builder.mutation<
      { text: string; language: string; model: string },
      { briefId: string; audio: Blob; mimeType: string; language?: string; durationMs?: number }
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
          url: ApiRoute.BRIEF_AI_TRANSCRIBE(args.briefId),
          method: 'POST',
          body: formData,
        };
      },
    }),

    sendBriefAiFeedback: builder.mutation<
      BriefFeedbackResponse,
      {
        briefId: string;
        messageId: string;
        rating: FeedbackRating;
        comment: string;
      }
    >({
      query: (args) => ({
        url: ApiRoute.BRIEF_AI_FEEDBACK(args.briefId),
        method: 'POST',
        body: {
          messageId: args.messageId,
          rating: args.rating,
          comment: args.comment,
        },
      }),
    }),

    getBriefAiMessageTrace: builder.query<LLMMessageTraceResponse, { briefId: string; messageId: string }>({
      query: (args) => ({
        url: ApiRoute.BRIEF_AI_MESSAGE_TRACE(args.briefId, args.messageId),
        method: 'GET',
      }),
    }),

    finalizeBriefAi: builder.mutation<{ taskId: string }, { briefId: string; documentLanguage?: string } | string>({
      query: (arg) => {
        const briefId = typeof arg === 'string' ? arg : arg.briefId;
        const documentLanguage = typeof arg === 'string' ? undefined : arg.documentLanguage;
        return {
          url: ApiRoute.BRIEF_AI_FINALIZE(briefId),
          method: 'POST',
          body: documentLanguage ? { documentLanguage } : undefined,
        };
      },
      invalidatesTags: ['BriefV3'],
    }),

    getBriefAiFinalDocuments: builder.query<BriefFinalPackage, string>({
      query: (briefId) => ({
        url: ApiRoute.BRIEF_AI_FINAL_DOCUMENTS(briefId),
        method: 'GET',
      }),
      providesTags: (_r, _e, briefId) => [{ type: 'BriefFinalDocuments', id: briefId }],
    }),

    updateBriefAiFinalDocument: builder.mutation<
      BriefFinalDocument,
      { briefId: string; documentId: string; html: string; plainText?: string }
    >({
      query: (args) => ({
        url: ApiRoute.BRIEF_AI_FINAL_DOCUMENT(args.briefId, args.documentId),
        method: 'PATCH',
        body: { html: args.html, plainText: args.plainText },
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          briefAiApi.util.updateQueryData('getBriefAiFinalDocuments', args.briefId, (draft) => {
            const doc = draft.documents.find((x) => x.id === args.documentId);
            if (doc) {
              doc.html = args.html;
              if (args.plainText !== undefined) {
                doc.plainText = args.plainText;
              }
            }
          })
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            briefAiApi.util.updateQueryData('getBriefAiFinalDocuments', args.briefId, (draft) => {
              const doc = draft.documents.find((x) => x.id === args.documentId);
              if (doc) {
                doc.html = data.html;
                doc.plainText = data.plainText;
                doc.updatedAt = data.updatedAt;
              }
            })
          );
        } catch {
          patch.undo();
        }
      },
    }),

    getBriefAiShare: builder.query<BriefShareInfo, string>({
      query: (briefId) => ({
        url: ApiRoute.BRIEF_AI_SHARE(briefId),
        method: 'GET',
      }),
      providesTags: (_r, _e, briefId) => [{ type: 'BriefShare', id: briefId }],
    }),

    createBriefAiShare: builder.mutation<BriefShareInfo, string>({
      query: (briefId) => ({
        url: ApiRoute.BRIEF_AI_SHARE(briefId),
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, briefId) => [{ type: 'BriefShare', id: briefId }],
    }),

    updateBriefAiShare: builder.mutation<BriefShareInfo, { briefId: string; isActive: boolean }>({
      query: (args) => ({
        url: ApiRoute.BRIEF_AI_SHARE(args.briefId),
        method: 'PATCH',
        body: { isActive: args.isActive },
      }),
      invalidatesTags: (_r, _e, args) => [{ type: 'BriefShare', id: args.briefId }],
    }),

    getBriefAiShareView: builder.query<BriefShareView, string>({
      query: (token) => ({
        url: ApiRoute.PUBLIC_BRIEF_SHARE(token),
        method: 'GET',
      }),
      providesTags: (_r, _e, token) => [{ type: 'BriefShareView', id: token }],
    }),

    getBriefAiList: builder.query<BriefV3ListItem[], void>({
      query: () => ({
        url: ApiRoute.BRIEF_AI_LIST,
        method: 'GET',
      }),
      providesTags: ['BriefV3'],
    }),

    deleteBriefAi: builder.mutation<{ deleted: boolean }, string>({
      query: (briefId) => ({
        url: ApiRoute.BRIEF_AI_DETAIL(briefId),
        method: 'DELETE',
      }),
      invalidatesTags: ['BriefV3'],
    }),

    renameBriefAi: builder.mutation<BriefV3ListItem, { briefId: string; title: string }>({
      query: (args) => ({
        url: ApiRoute.BRIEF_AI_DETAIL(args.briefId),
        method: 'PATCH',
        body: { title: args.title },
      }),
      invalidatesTags: ['BriefV3'],
    }),

    updateBriefAiSettings: builder.mutation<
      BriefV3ListItem,
      { briefId: string; title?: string; documentLanguage?: 'en' | 'ru' }
    >({
      query: (args) => {
        const body: Record<string, string> = {};
        if (args.title !== undefined) {
          body.title = args.title;
        }
        if (args.documentLanguage !== undefined) {
          body.documentLanguage = args.documentLanguage;
        }
        return {
          url: ApiRoute.BRIEF_AI_DETAIL(args.briefId),
          method: 'PATCH',
          body,
        };
      },
      invalidatesTags: ['BriefV3'],
    }),
  }),
});

export const {
  useCreateBriefAiDraftMutation,
  useStartBriefAiMutation,
  useLazyGetBriefAiStatusQuery,
  useSendBriefAiChatMutation,
  useGetBriefAiDetailQuery,
  useUploadBriefAiAttachmentMutation,
  useDeleteBriefAiAttachmentMutation,
  useTranscribeBriefAiMutation,
  useSendBriefAiFeedbackMutation,
  useLazyGetBriefAiMessageTraceQuery,
  useFinalizeBriefAiMutation,
  useLazyGetBriefAiFinalDocumentsQuery,
  useGetBriefAiFinalDocumentsQuery,
  useUpdateBriefAiFinalDocumentMutation,
  useGetBriefAiShareQuery,
  useCreateBriefAiShareMutation,
  useUpdateBriefAiShareMutation,
  useGetBriefAiShareViewQuery,
  useGetBriefAiListQuery,
  useDeleteBriefAiMutation,
  useRenameBriefAiMutation,
  useUpdateBriefAiSettingsMutation,
} = briefAiApi;
