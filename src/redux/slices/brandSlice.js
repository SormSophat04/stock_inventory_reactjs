import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async Thunks
export const fetchBrands = createAsyncThunk(
  "brands/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/brands");
      // Handle standardized response structure
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data.brands || response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const addBrand = createAsyncThunk(
  "brands/addBrand",
  async (brandData, { rejectWithValue }) => {
    try {
      const response = await api.post("/brands", brandData);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data.brand || response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const updateBrand = createAsyncThunk(
  "brands/updateBrand",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/brands/${id}`, data);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data.brand || response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBrand = createAsyncThunk(
  "brands/deleteBrand",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/brands/${id}`);
      return id;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

const brandSlice = createSlice({
  name: "brands",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(addBrand.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.brand_id === action.payload.brand_id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.brand_id !== action.payload
        );
      });
  },
});

export const selectAllBrands = (state) => state.brands.items;
export const selectBrandStatus = (state) => state.brands.status;
export const selectBrandError = (state) => state.brands.error;

export default brandSlice.reducer;
