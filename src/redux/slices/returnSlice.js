import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Async thunks
export const fetchReturns = createAsyncThunk(
  'returns/fetchReturns',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/return-orders');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch returns');
    }
  }
);

export const createReturn = createAsyncThunk(
  'returns/createReturn',
  async (returnData, { rejectWithValue }) => {
    try {
      const response = await api.post('/return-orders', returnData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create return');
    }
  }
);

export const deleteReturn = createAsyncThunk(
  'returns/deleteReturn',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/return-orders/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete return');
    }
  }
);

export const updateReturn = createAsyncThunk(
  'returns/updateReturn',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/return-orders/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update return');
    }
  }
);

const returnSlice = createSlice({
  name: 'returns',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    clearReturnError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Returns
      .addCase(fetchReturns.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReturns.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchReturns.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Create Return
      .addCase(createReturn.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createReturn.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.unshift(action.payload);
      })
      .addCase(createReturn.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Delete Return
      .addCase(deleteReturn.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteReturn.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter((item) => item.return_id !== action.payload);
      })
      .addCase(deleteReturn.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Update Return
      .addCase(updateReturn.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateReturn.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.items.findIndex(item => item.return_id === action.payload.return_id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateReturn.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearReturnError } = returnSlice.actions;

// Selectors
export const selectAllReturns = (state) => state.returns.items;
export const selectReturnStatus = (state) => state.returns.status;
export const selectReturnError = (state) => state.returns.error;

export default returnSlice.reducer;
