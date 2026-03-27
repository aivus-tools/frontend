import { Template, NewTemplate, ApplyTemplateResponse } from '@/types/template.interface';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';

export const templatesApi = createApi({
  reducerPath: 'templatesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  tagTypes: ['Template', 'Offer'],
  endpoints: (builder) => ({
    getTemplates: builder.query<Template[], void>({
      query: () => ApiRoute.TEMPLATE_LIST,
      providesTags: ['Template'],
    }),
    getTemplate: builder.query<Template, string>({
      query: (id) => ApiRoute.TEMPLATE(id),
      providesTags: ['Template'],
    }),
    createTemplate: builder.mutation<Template, NewTemplate>({
      query: (body) => ({
        url: ApiRoute.TEMPLATE_LIST,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Template'],
    }),
    deleteTemplate: builder.mutation<void, string>({
      query: (id) => ({
        url: ApiRoute.TEMPLATE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Template'],
    }),
    updateTemplate: builder.mutation<
      Template,
      { id: string; body: Partial<{ name: string; description: string; details: unknown; metadata: unknown }> }
    >({
      query: ({ id, body }) => ({
        url: ApiRoute.TEMPLATE(id),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Template'],
    }),
    applyTemplate: builder.mutation<ApplyTemplateResponse, { templateId: string; projectId: string }>({
      query: ({ templateId, projectId }) => ({
        url: ApiRoute.TEMPLATE_APPLY(templateId),
        method: 'POST',
        body: { projectId },
      }),
      invalidatesTags: ['Offer'],
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useUpdateTemplateMutation,
  useApplyTemplateMutation,
} = templatesApi;
