import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async Thunks

// Fetch all purchases
export const fetchPurchases = createAsyncThunk(
  "purchases/fetchPurchases",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/purchases");
      // Handle standardized response structure
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data.purchases || response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Create a new purchase
export const createPurchase = createAsyncThunk(
  "purchases/createPurchase",
  async (purchaseData, { rejectWithValue }) => {
    try {
      const response = await api.post("/purchases", purchaseData);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data.purchase || response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Update a purchase
export const updatePurchase = createAsyncThunk(
  "purchases/updatePurchase",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/purchases/${id}`, data);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data.purchase || response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Update purchase status (Receive/Pay)
export const updatePurchaseStatus = createAsyncThunk(
  "purchases/updatePurchaseStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/purchases/${id}/status`, { status });
      // The backend logically might allow returning the updated purchase
      // We will assume it returns { message: ..., purchase: ... } or we might need to refactor backend to return the object
      if (response.data && response.data.data) {
        return { id, status, data: response.data.data };
      }
       return { id, status, message: response.data.message }; 
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Delete a purchase
export const deletePurchase = createAsyncThunk(
  "purchases/deletePurchase",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/purchases/${id}`);
      return id;
    } catch (error) {
       if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

const purchaseSlice = createSlice({
  name: "purchases",
  initialState: {
    items: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    resetPurchaseStatus: (state) => {
      state.status = "idle";
    },
    clearPurchaseError: (state) => {
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Purchases
      .addCase(fetchPurchases.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      // Create Purchase
      .addCase(createPurchase.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Assuming payload is the new purchase object
        state.items.unshift(action.payload);
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update Purchase
      .addCase(updatePurchase.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updatePurchase.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.items.findIndex((p) => p.purchase_id === action.payload.purchase_id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updatePurchase.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
       // Update Purchase Status
      .addCase(updatePurchaseStatus.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updatePurchaseStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { id, status } = action.payload;
        const index = state.items.findIndex(p => p.purchase_id === id);
        if (index !== -1) {
            state.items[index].payment_status = status; 
             // If payload has data (updated object), use it. But status update might just be partial.
             if(action.payload.data) {
                 state.items[index] = { ...state.items[index], ...action.payload.data };
             }
        }
      })
      .addCase(updatePurchaseStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete Purchase
      .addCase(deletePurchase.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deletePurchase.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = state.items.filter((p) => p.purchase_id !== action.payload);
      })
      .addCase(deletePurchase.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetPurchaseStatus, clearPurchaseError } = purchaseSlice.actions;

export const selectAllPurchases = (state) => state.purchases.items;
export const selectPurchaseStatus = (state) => state.purchases.status;
export const selectPurchaseError = (state) => state.purchases.error;

export default purchaseSlice.reducer;
