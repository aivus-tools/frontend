import { Project, NewProject } from '@/types/project.interface.';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';

export const projectsApi = createApi({
  reducerPath: 'projectsApi',
  baseQuery: fetchBaseQuery(),
  tagTypes: ['Project'],
  endpoints: (builder) => ({
    getAllProjects: builder.query<Project[], void>({
      query: () => ApiRoute.PROJECT_LIST,
      providesTags: ['Project'],
    }),
    createProject: builder.mutation<Project, NewProject>({
      query: (body) => ({
        url: ApiRoute.PROJECT_LIST,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Project'],
    }),
    getProjectById: builder.query<Project, string>({
      query: (id) => ApiRoute.PROJECT(id),
      providesTags: ['Project'],
    }),
    updateProject: builder.mutation<Project, Partial<Project> & Pick<Project, 'id'>>({
      query: (body) => ({
        url: ApiRoute.PROJECT(body.id),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Project'],
    }),
    deleteProject: builder.mutation<void, string>({
      query: (id) => ({
        url: ApiRoute.PROJECT(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),
  }),
});

export const {
  useGetAllProjectsQuery,
  useCreateProjectMutation,
  useGetProjectByIdQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;
