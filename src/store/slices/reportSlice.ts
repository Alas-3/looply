// src/store/slices/reportSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { eodService } from '@/lib/services/eod';
import type { EODReport, DashboardStats, WorkShift } from '@/lib/types';

interface ReportState {
  reports: EODReport[];
  todayReport: EODReport | null;
  previousReports: EODReport[];
  stats: DashboardStats | null;
  loading: boolean;
  saving: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: ReportState = {
  reports: [],
  todayReport: null,
  previousReports: [],
  stats: null,
  loading: false,
  saving: false,
  submitting: false,
  error: null,
};

export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (companyId: string, { rejectWithValue }) => {
    try {
      const reports = await eodService.getReports(companyId);
      return reports;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to fetch reports');
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'reports/fetchDashboardStats',
  async (companyId: string, { rejectWithValue }) => {
    try {
      const stats = await eodService.getDashboardStats(companyId);
      return stats;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to fetch dashboard stats');
    }
  }
);

export const saveDraft = createAsyncThunk(
  'reports/saveDraft',
  async (
    {
      employeeId,
      companyId,
      date,
      summary,
      shifts,
    }: {
      employeeId: string;
      companyId: string;
      date: string;
      summary: string;
      shifts: WorkShift[];
    },
    { rejectWithValue }
  ) => {
    try {
      const report = await eodService.saveDraft(employeeId, companyId, date, summary, shifts);
      return report;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to save draft');
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setTodayReport: (state, action: PayloadAction<EODReport | null>) => {
      state.todayReport = action.payload;
    },
    setPreviousReports: (state, action: PayloadAction<EODReport[]>) => {
      state.previousReports = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(saveDraft.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveDraft.fulfilled, (state, action) => {
        state.saving = false;
        state.todayReport = action.payload;
        
        // Update report in reports array if it exists
        const index = state.reports.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        } else {
          state.reports.push(action.payload);
        }
      })
      .addCase(saveDraft.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTodayReport, setPreviousReports } = reportSlice.actions;
export default reportSlice.reducer;