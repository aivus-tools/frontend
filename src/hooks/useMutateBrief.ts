import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { useSession } from 'next-auth/react';
import { Brief, Details } from '@/types/brief';
import { ROLES } from '@/lib/constants';

export const briefApi = createApi({
	reducerPath: 'briefApi',
	baseQuery: fetchBaseQuery({ baseUrl: '/service' }),
	endpoints: (builder) => ({
		createBrief: builder.mutation<Brief, Pick<Brief, 'details' | 'clientId' | 'status' | 'team'>>({
			query: (body) => ({
				url: '/briefs',
				method: 'POST',
				body,
			}),
		}),
		updateBrief: builder.mutation<Brief, Brief>({
			query: (brief) => ({
				url: `/briefs/${brief.id}`,
				method: 'PATCH',
				body: brief,
			}),
		}),
	}),
});

export const { useCreateBriefMutation, useUpdateBriefMutation } = briefApi;

export const useMutateBrief = () => {
	const session = useSession();
	const [createBrief, { isLoading: isCreating }] = useCreateBriefMutation();
	const [updateBrief, { isLoading: isUpdating }] = useUpdateBriefMutation();

	return {
		isLoading: isCreating || isUpdating,
		create: async (details: Details) => {
			if (session.data?.user?.id) {
				return await createBrief({
					status: 'DRAFT',
					details,
					clientId: Number(session.data.user.id),
					team: [
						{
							role: ROLES.ADMIN,
							userId: Number(session.data.user.id) as unknown as number,
						},
					],
				}).unwrap();
			}
		},
		update: async (brief: Brief) => {
			await updateBrief(brief).unwrap();
		},
	};
};
