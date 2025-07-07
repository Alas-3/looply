// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import employeeReducer from './slices/employeeSlice';
import reportReducer from './slices/reportSlice';
import uiReducer from './slices/uiSlice';

export const makeStore = () => 
  configureStore({
    reducer: {
      auth: authReducer,
      employees: employeeReducer,
      reports: reportReducer,
      ui: uiReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
  });

// Infer types from store
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];