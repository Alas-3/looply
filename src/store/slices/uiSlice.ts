// src/store/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  selectedEmployee: string;
  showAddForm: boolean;
  showAllMembers: boolean;
  showReports: boolean;
}

const initialState: UIState = {
  selectedEmployee: 'all',
  showAddForm: false,
  showAllMembers: false,
  showReports: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedEmployee: (state, action: PayloadAction<string>) => {
      state.selectedEmployee = action.payload;
    },
    toggleAddForm: (state) => {
      state.showAddForm = !state.showAddForm;
    },
    setShowAddForm: (state, action: PayloadAction<boolean>) => {
      state.showAddForm = action.payload;
    },
    toggleShowAllMembers: (state) => {
      state.showAllMembers = !state.showAllMembers;
    },
    toggleShowReports: (state) => {
      state.showReports = !state.showReports;
    },
  },
});

export const {
  setSelectedEmployee,
  toggleAddForm,
  setShowAddForm,
  toggleShowAllMembers,
  toggleShowReports,
} = uiSlice.actions;

export default uiSlice.reducer;