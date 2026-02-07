import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async Thunks
export const fetchSuppliers = createAsyncThunk(
  "suppliers/fetchSuppliers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/suppliers");
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data.suppliers || response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const addSupplier = createAsyncThunk(
  "suppliers/addSupplier",
  async (supplierData, { rejectWithValue }) => {
    try {
      const response = await api.post("/suppliers", supplierData);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data.supplier || response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const updateSupplier = createAsyncThunk(
  "suppliers/updateSupplier",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/suppliers/${id}`, data);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data.supplier || response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  "suppliers/deleteSupplier",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/suppliers/${id}`);
      return id;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

const supplierSlice = createSlice({
  name: "suppliers",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(addSupplier.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.supplier_id === action.payload.supplier_id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.supplier_id !== action.payload
        );
      });
  },
});

export const selectAllSuppliers = (state) => state.suppliers.items;
export const selectSupplierStatus = (state) => state.suppliers.status;
export const selectSupplierError = (state) => state.suppliers.error;

export default supplierSlice.reducer;
