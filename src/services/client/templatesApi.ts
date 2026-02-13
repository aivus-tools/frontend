import { Template, NewTemplate, ApplyTemplateResponse } from '@/types/template.interface';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';

export const templatesApi = createApi({
  reducerPath: 'templatesApi',
  baseQuery: fetchBaseQuery(),
  tagTypes: ['Template'],
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
    applyTemplate: builder.mutation<ApplyTemplateResponse, string>({
      query: (id) => ({
        url: ApiRoute.TEMPLATE_APPLY(id),
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useApplyTemplateMutation,
} = templatesApi;
