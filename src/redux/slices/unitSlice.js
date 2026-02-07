import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async Thunks
export const fetchUnits = createAsyncThunk(
  "units/fetchUnits",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/units");
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const addUnit = createAsyncThunk(
  "units/addUnit",
  async (unitData, { rejectWithValue }) => {
    try {
      const response = await api.post("/units", unitData);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data.unit || response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const updateUnit = createAsyncThunk(
  "units/updateUnit",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/units/${id}`, data);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data.unit || response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUnit = createAsyncThunk(
  "units/deleteUnit",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/units/${id}`);
      return id;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

const unitSlice = createSlice({
  name: "units",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnits.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(addUnit.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateUnit.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.unit_id === action.payload.unit_id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteUnit.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.unit_id !== action.payload
        );
      });
  },
});

export const selectAllUnits = (state) => state.units.items;
export const selectUnitStatus = (state) => state.units.status;
export const selectUnitError = (state) => state.units.error;

export default unitSlice.reducer;
