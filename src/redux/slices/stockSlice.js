import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async Thunks

// Fetch all stocks
export const fetchStocks = createAsyncThunk(
  "stocks/fetchStocks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/stocks");
      return response.data.data || response.data; // Handle API response structure
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stocks"
      );
    }
  }
);

// Create Stock-In (Bulk)
export const createStockIn = createAsyncThunk(
  "stocks/createStockIn",
  async (stockData, { rejectWithValue }) => {
    try {
      // Expecting stockData to be an object containing { items: [...], ...commonDetails }
      // Or if the backend expects an array, adjust accordingly.
      // Based on plan, we will send a payload that the backend 'storeBulk' handles.
      const response = await api.post("/stocks/bulk", stockData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          (error.response?.data?.errors
            ? Object.values(error.response.data.errors).flat().join(", ")
            : "Failed to create stock-in")
      );
    }
  }
);
// Create Stock-Out (Bulk Deduction)
export const createStockOut = createAsyncThunk(
  "stocks/createStockOut",
  async (stockData, { rejectWithValue }) => {
    try {
      const response = await api.post("/stocks/bulk-out", stockData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          (error.response?.data?.errors
            ? Object.values(error.response.data.errors).flat().join(", ")
            : "Failed to deduct stock")
      );
    }
  }
);

export const transferStock = createAsyncThunk(
  "stocks/transferStock",
  async (transferData, { rejectWithValue }) => {
    try {
      const response = await api.post("/stock-transfers", transferData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          (error.response?.data?.errors
            ? Object.values(error.response.data.errors).flat().join(", ")
            : "Failed to transfer stock")
      );
    }
  }
);

export const adjustStock = createAsyncThunk(
  "stocks/adjustStock",
  async (adjustmentData, { rejectWithValue }) => {
    try {
      const response = await api.post("/stock-adjustments", adjustmentData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          (error.response?.data?.errors
            ? Object.values(error.response.data.errors).flat().join(", ")
            : "Failed to adjust stock")
      );
    }
  }
);

export const submitStockCount = createAsyncThunk(
  "stocks/submitStockCount",
  async (countData, { rejectWithValue }) => {
    try {
      const response = await api.post("/stock-counts", countData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          (error.response?.data?.errors
            ? Object.values(error.response.data.errors).flat().join(", ")
            : "Failed to submit stock count")
      );
    }
  }
);

export const fetchLowStockAlerts = createAsyncThunk(
  "stocks/fetchLowStockAlerts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/low-stock-alerts");
      // Standard response is { data: [...], message: "..." }
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch low stock alerts"
      );
    }
  }
);

const stockSlice = createSlice({
  name: "stocks",
  initialState: {
    stocks: [],
    lowStockAlerts: [], // Add state for alerts
    status: "idle",
    error: null,
  },
  reducers: {
    clearStockError: (state) => {
      state.error = null;
    },
    resetStockStatus: (state) => {
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stocks
      .addCase(fetchStocks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchStocks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stocks = action.payload;
      })
      .addCase(fetchStocks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Create Stock In
      .addCase(createStockIn.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createStockIn.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Optionally add the new stocks to the list if the backend returns them
        // For bulk, it might return a list of created stocks
        if (Array.isArray(action.payload.stocks)) {
            state.stocks.push(...action.payload.stocks);
        }
      })
      .addCase(createStockIn.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch Low Stock Alerts
      .addCase(fetchLowStockAlerts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchLowStockAlerts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lowStockAlerts = action.payload;
      })
      .addCase(fetchLowStockAlerts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearStockError, resetStockStatus } = stockSlice.actions;

export const selectAllStocks = (state) => state.stocks.stocks;
export const selectLowStockAlerts = (state) => state.stocks.lowStockAlerts;
export const selectStockStatus = (state) => state.stocks.status;
export const selectStockError = (state) => state.stocks.error;

export default stockSlice.reducer;
