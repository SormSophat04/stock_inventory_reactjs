import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./slices/productSlice";
import categoryReducer from "./slices/categorySlice";
import brandReducer from "./slices/brandSlice";
import supplierReducer from "./slices/supplierSlice";
import unitReducer from "./slices/unitSlice";
import warehouseReducer from "./slices/warehouseSlice";
import customerReducer from "./slices/customerSlice";
import userReducer from "./slices/userSlice";
import saleReducer from "./slices/saleSlice";
import stockReducer from "./slices/stockSlice";
import purchaseReducer from "./slices/purchaseSlice";
import returnReducer from "./slices/returnSlice";
import dashboardReducer from "./slices/dashboardSlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    categories: categoryReducer,
    brands: brandReducer,
    suppliers: supplierReducer,
    units: unitReducer,
    warehouses: warehouseReducer,
    customers: customerReducer,
    users: userReducer,
    sales: saleReducer,
    stocks: stockReducer,
    purchases: purchaseReducer,
    returns: returnReducer,
    dashboard: dashboardReducer,
    // other reducers will be added here
  },
});
