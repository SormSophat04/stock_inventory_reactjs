import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async Thunks
export const fetchSales = createAsyncThunk(
  "sales/fetchSales",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/sales");
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data || [];
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const createSale = createAsyncThunk(
  "sales/createSale",
  async (saleData, { rejectWithValue }) => {
    try {
      const response = await api.post("/sales", saleData);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data.sale || response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const deleteSale = createAsyncThunk(
  "sales/deleteSale",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/sales/${id}`);
      return id;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

const saleSlice = createSlice({
  name: "sales",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {
    clearSaleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSales.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.sale_id !== action.payload
        );
      });
  },
});

export const { clearSaleError } = saleSlice.actions;

export const selectAllSales = (state) => state.sales.items;
export const selectSaleStatus = (state) => state.sales.status;
export const selectSaleError = (state) => state.sales.error;

export default saleSlice.reducer;
