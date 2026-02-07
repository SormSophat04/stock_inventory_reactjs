import api from "./axios";

// Fetch all warehouses
export const fetchWarehouses = async () => {
  try {
    const response = await api.get("/warehouses");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch warehouses"
    );
  }
};

// Fetch all products
export const fetchProducts = async () => {
  try {
    const response = await api.get("/products");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch products"
    );
  }
};

// Fetch all stock adjustments
export const fetchStockAdjustments = async () => {
  try {
    const response = await api.get("/stock-adjustments");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch adjustments"
    );
  }
};

// Create a new stock adjustment
export const createStockAdjustment = async (adjustmentData) => {
  try {
    const response = await api.post("/stock-adjustments", adjustmentData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to create adjustment"
    );
  }
};
