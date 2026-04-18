import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';
import {
  BriefAttachment,
  BriefFeedbackResponse,
  BriefFinalDocument,
  BriefFinalPackage,
  BriefV3ChatResponse,
  BriefV3Detail,
  BriefV3ListItem,
  BriefV3StartResponse,
  BriefV3TaskStatus,
  FeedbackRating,
  LLMMessageTraceResponse,
} from '@/types/briefAi.interface';

export const briefAiApi = createApi({
  reducerPath: 'briefAiApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  tagTypes: ['BriefV3'],
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
      { briefId: string; message: string; attachmentIds?: string[] }
    >({
      query: (args) => ({
        url: ApiRoute.BRIEF_AI_START(args.briefId),
        method: 'POST',
        body: {
          message: args.message,
          attachmentIds: args.attachmentIds ?? [],
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

    finalizeBriefAi: builder.mutation<{ taskId: string }, string>({
      query: (briefId) => ({
        url: ApiRoute.BRIEF_AI_FINALIZE(briefId),
        method: 'POST',
      }),
      invalidatesTags: ['BriefV3'],
    }),

    getBriefAiFinalDocuments: builder.query<BriefFinalPackage, string>({
      query: (briefId) => ({
        url: ApiRoute.BRIEF_AI_FINAL_DOCUMENTS(briefId),
        method: 'GET',
      }),
      providesTags: ['BriefV3'],
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
  useSendBriefAiFeedbackMutation,
  useLazyGetBriefAiMessageTraceQuery,
  useFinalizeBriefAiMutation,
  useLazyGetBriefAiFinalDocumentsQuery,
  useGetBriefAiFinalDocumentsQuery,
  useUpdateBriefAiFinalDocumentMutation,
  useGetBriefAiListQuery,
  useDeleteBriefAiMutation,
  useRenameBriefAiMutation,
} = briefAiApi;
