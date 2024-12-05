import { BrowserRouter as Router } from 'react-router-dom';
import { ModalProvider } from '@/context/ModalContext';
import { Provider } from 'react-redux';
import store from '@/store/store';
import { lazy } from 'react';

const VendorRoutes = lazy(() => import('./pages/vendor'));
const ClientRoutes = lazy(() => import('./pages/client'));

const App = ({ user }: { user: { id: string; type: 'vendor' | 'client' } }) => {
	return (
		<Provider store={store}>
			<Router
				future={{
					v7_startTransition: true,
					v7_relativeSplatPath: true,
				}}
			>
				<ModalProvider>
					{user.type === 'vendor' && <VendorRoutes />}
					{user.type === 'client' && <ClientRoutes />}
				</ModalProvider>
			</Router>
		</Provider>
	);
};

export default App;
