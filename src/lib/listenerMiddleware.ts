import { createListenerMiddleware } from '@reduxjs/toolkit';
import { AppStartListening } from '@/store/store';
import { offerListener } from '@/store/slices/offer/listener';

const listenerMiddleware = createListenerMiddleware();
const startAppListening = listenerMiddleware.startListening as AppStartListening;

offerListener(startAppListening);

export { listenerMiddleware };
