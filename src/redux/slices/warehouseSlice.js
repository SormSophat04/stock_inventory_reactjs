import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async Thunks
export const fetchWarehouses = createAsyncThunk(
  "warehouses/fetchWarehouses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/warehouses");
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data.warehouses || response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const addWarehouse = createAsyncThunk(
  "warehouses/addWarehouse",
  async (warehouseData, { rejectWithValue }) => {
    try {
      const response = await api.post("/warehouses", warehouseData);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data.warehouse || response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const updateWarehouse = createAsyncThunk(
  "warehouses/updateWarehouse",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/warehouses/${id}`, data);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data.warehouse || response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const deleteWarehouse = createAsyncThunk(
  "warehouses/deleteWarehouse",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/warehouses/${id}`);
      return id;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

const warehouseSlice = createSlice({
  name: "warehouses",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(addWarehouse.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateWarehouse.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.warehouse_id === action.payload.warehouse_id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteWarehouse.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.warehouse_id !== action.payload
        );
      });
  },
});

export const selectAllWarehouses = (state) => state.warehouses.items;
export const selectWarehouseStatus = (state) => state.warehouses.status;
export const selectWarehouseError = (state) => state.warehouses.error;

export default warehouseSlice.reducer;
