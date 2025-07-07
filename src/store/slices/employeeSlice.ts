// src/store/slices/employeeSlice.ts
import { createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import { companyService } from '@/lib/services/company';
import { storage } from '@/lib/services/storage';
import type { Employee } from '@/lib/types';

interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  loading: false,
  error: null,
};

export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (companyId: string, { rejectWithValue }) => {
    try {
      const employees = await companyService.getEmployees(companyId);
      return employees;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to fetch employees');
    }
  }
);

export const addEmployee = createAsyncThunk(
  'employees/addEmployee',
  async (
    {
      companyId,
      name,
      email,
      position,
    }: { companyId: string; name: string; email: string; position: string },
    { rejectWithValue }
  ) => {
    try {
      const employee = await companyService.addEmployee(companyId, name, email, position);
      return employee;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to add employee');
    }
  }
);

export const removeEmployee = createAsyncThunk(
  'employees/removeEmployee',
  async (employeeId: string, { rejectWithValue }) => {
    try {
      await storage.remove(`employee:${employeeId}`);
      return employeeId;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to remove employee');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.employees.push(action.payload);
      })
      .addCase(removeEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter((emp) => emp.id !== action.payload);
      });
  },
});

export default employeeSlice.reducer;