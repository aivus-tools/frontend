import React from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import Cookies from 'js-cookie';
// import { API } from '@/app/helpers/api';
// import { useDispatch, useSelector } from 'react-redux';
// import { AppState, setUser } from '@/app/store/store';
// import { fetchUser } from '@/app/store/userSlice';
// import { AppDispatch } from '@/app/store/store';
// import { ROLES } from '@/app/interfaces/user.interface';

// const protectedRoutes = ['/users', '/offer'];

const withAuth = (Component: React.ComponentType) => {
	const ComponentWithAuth: React.FC = (props) => {
		// const [isAuthenticated, setIsAuthenticated] = useState(false);
		// const router = useRouter();
		// const pathname = usePathname();
		//
		// const dispatch = useDispatch<AppDispatch>();
		// const user = useSelector((state: AppState) => state.user.user);

		// useEffect(() => {
		// 	if (!user) {
		// 		dispatch(fetchUser());
		// 	}
		// }, [dispatch, user]);

		// useEffect(() => {
		// 	const checkAuth = async () => {
		// 		try {
		// 			const token = Cookies.get('token');
		// 			if (!token) {
		// 				throw new Error('No token found');
		// 			}
		//
		// 			if (!user) {
		// 				await dispatch(fetchUser());
		// 			} else {
		// 				if (user.role === ROLES.CLIENT && protectedRoutes.some(route => pathname.startsWith(route))) {
		// 					await router.push('/404');
		// 				} else {
		// 					setIsAuthenticated(true);
		// 				}
		// 			}
		// 		} catch (error) {
		// 			console.error('Authentication check failed:', error);
		// 			await router.push('/login');
		// 		} finally {
		// 			// setIsLoading(false);
		// 		}
		// 	};
		//
		// 	checkAuth();
		// }, [dispatch, router, pathname]);
		//
		// useEffect(() => {
		// 	if (user) {
		// 		// if (user.role === ROLES.CLIENT && protectedRoutes.some(route => pathname.startsWith(route))) {
		// 		// 	router.push('/404');
		// 		// } else {
		// 		// 	setIsAuthenticated(true);
		// 		// }
		// 	}
		// }, [user, pathname, router]);

		// if (!isAuthenticated) {
		// 	return <div>Loading...</div>;
		// }

		return <Component {...props} />;
	};

	ComponentWithAuth.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;

	return ComponentWithAuth;
};

export default withAuth;
