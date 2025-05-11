import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectIsExternal } from '@/store/slices/offer/selectors';
import { setExternal } from '@/store/slices/offer/slice';
import { useEffect } from 'react';

export const useSetExternal = (external?: boolean) => {
	const dispatch = useAppDispatch();
	const isExternal = useAppSelector(selectIsExternal);
	useEffect(() => {
		if (isExternal === external || external === undefined) {
			return;
		}
		dispatch(setExternal(external));
	}, [dispatch, external, isExternal]);
};
