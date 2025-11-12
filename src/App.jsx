import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import Product from "./pages/master_data/Product";
import Category from "./pages/master_data/Category";
import Brand from "./pages/master_data/Brand";
import Supplier from "./pages/master_data/Supplier";
import Customer from "./pages/master_data/Customer";
import Unit from "./pages/master_data/Unit";
import WareHouse from "./pages/master_data/WareHouse";
import StockIn from "./pages/inventorys/StockIn";
import StockTransferPage from "./pages/inventorys/StockTransfer";
import StockAdjustmentPage from "./pages/inventorys/StockAdjustment";
import StockCountPage from "./pages/inventorys/StockCount";
import LowStockAlert from "./pages/inventorys/LowStockAlerts";
import PurchaseOrdersPage from "./pages/transactions/PurchaseOrders";
import PurchaseInvoicesPage from "./pages/transactions/PurchaseInvoices";
import SaleInvoices from "./pages/transactions/SaleInvoices";
import ReturnOrders from "./pages/transactions/ReturnOrders";
import PaymentMethods from "./pages/transactions/PaymentMethod";
import SaleOrders from "./pages/transactions/SaleOrder";
import StockOutPage from "./pages/inventorys/StockOut";
import Dashboard from "./pages/dashboard/Dashboard";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        {/* Master Data */}
        <Route path="/products" element={<Product />} />
        <Route path="/categories" element={<Category />} />
        <Route path="/brands" element={<Brand />} />
        <Route path="/suppliers" element={<Supplier />} />
        <Route path="/customers" element={<Customer />} />
        <Route path="/units" element={<Unit />} />
        <Route path="/warehouses" element={<WareHouse />} />

        {/* Inventory */}
        <Route path="/inventory/stock-in" element={<StockIn />} />
        <Route path="/inventory/stock-out" element={<StockOutPage />} />
        <Route path="/inventory/transfer" element={<StockTransferPage />} />
        <Route path="/inventory/adjustment" element={<StockAdjustmentPage />} />
        <Route path="/inventory/count" element={<StockCountPage />} />
        <Route path="/inventory/low-stock" element={<LowStockAlert />} />

        {/* Transactions */}
        <Route
          path="/transactions/purchases"
          element={<PurchaseOrdersPage />}
        />
        <Route
          path="/transactions/purchase-invoices"
          element={<PurchaseInvoicesPage />}
        />
        <Route path="/transactions/sales" element={<SaleOrders />} />
        <Route path="/transactions/sales-invoices" element={<SaleInvoices />} />
        <Route path="/transactions/returns" element={<ReturnOrders />} />
        <Route path="/transactions/payments" element={<PaymentMethods />} />
        {/* <Route path="/transactions/cashier" element={<Cashier />} /> */}
      </Routes>
    </Layout>
  );
}
