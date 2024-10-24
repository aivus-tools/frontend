import { combineReducers } from '@reduxjs/toolkit';
import estimatesReducer from '@/store/reducer'; // Изменено

const rootReducer = combineReducers({
	estimates: estimatesReducer,
});

export default rootReducer;
