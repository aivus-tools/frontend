'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useSession } from 'next-auth/react';
import { selectVendorId, setVendorId } from '@/store/slices/vendor';

export const useSetVendor = () => {
	const session = useSession();
	const sessionVendorId = session.data?.user?.id;
	const storedVendorId = useAppSelector(selectVendorId);
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (sessionVendorId && sessionVendorId !== storedVendorId) {
			dispatch(setVendorId(sessionVendorId));
		}
	}, [dispatch, sessionVendorId, storedVendorId]);
};
