import React, { useEffect, useState, useMemo } from "react";
import { FiAlertTriangle } from "react-icons/fi";

// Mock data for demonstration
const mockAlerts = [
  {
    product_id: 1,
    name: "iPhone 15 Pro",
    category_id: "1",
    category_name: "Electronics",
    brand_id: "1",
    brand_name: "Apple",
    warehouse_id: "1",
    warehouse_name: "Main Warehouse",
    current_stock: 3,
    min_stock_level: 5,
    reorder_qty: 10,
    last_purchase: "2025-10-15",
  },
  {
    product_id: 2,
    name: "Samsung Galaxy S25",
    category_id: "1",
    category_name: "Electronics",
    brand_id: "2",
    brand_name: "Samsung",
    warehouse_id: "2",
    warehouse_name: "Branch A",
    current_stock: 8,
    min_stock_level: 10,
    reorder_qty: 15,
    last_purchase: "2025-10-20",
  },
  {
    product_id: 3,
    name: "Organic Whole Milk",
    category_id: "2",
    category_name: "Groceries",
    brand_id: "3",
    brand_name: "Happy Cow",
    warehouse_id: "1",
    warehouse_name: "Main Warehouse",
    current_stock: 12,
    min_stock_level: 20,
    reorder_qty: 24,
    last_purchase: "2025-11-05",
  },
  {
    product_id: 4,
    name: "MacBook Pro 16-inch",
    category_id: "1",
    category_name: "Electronics",
    brand_id: "1",
    brand_name: "Apple",
    warehouse_id: "1",
    warehouse_name: "Main Warehouse",
    current_stock: 2,
    min_stock_level: 5,
    reorder_qty: 5,
    last_purchase: "2025-09-01",
  },
];

export default function LowStockAlert() {
  const [alerts, setAlerts] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    warehouse: "",
  });

  // Mock filter options
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Simulate fetching data on mount
  useEffect(() => {
    setAlerts(mockAlerts);
    setCategories([
      { id: "1", name: "Electronics" },
      { id: "2", name: "Groceries" },
    ]);
    setBrands([
      { id: "1", name: "Apple" },
      { id: "2", name: "Samsung" },
      { id: "3", name: "Happy Cow" },
    ]);
    setWarehouses([
      { id: "1", name: "Main Warehouse" },
      { id: "2", name: "Branch A" },
    ]);
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      return (
        (filters.category ? alert.category_id === filters.category : true) &&
        (filters.brand ? alert.brand_id === filters.brand : true) &&
        (filters.warehouse ? alert.warehouse_id === filters.warehouse : true)
      );
    });
  }, [alerts, filters]);

  const handleRestock = (productId) => {
    alert(`Create purchase order for product ID: ${productId}`);
  };

  return (
    <div className="p-4 sm:p-6 font-sans">
      <div className="mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Panel Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <FiAlertTriangle className="text-red-500" />
            Low Stock Alerts
          </h1>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="block w-full p-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              onChange={(e) =>
                setFilters({ ...filters, brand: e.target.value })
              }
              className="block w-full p-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              onChange={(e) =>
                setFilters({ ...filters, warehouse: e.target.value })
              }
              className="block w-full p-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Low Stock Table */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warehouse
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min Stock
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reorder Qty
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Purchase
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="text-center py-10 text-slate-500"
                    >
                      🎉 All stock levels are healthy!
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((item) => (
                    <tr
                      key={item.product_id}
                      className={`hover:bg-slate-50 ${
                        item.current_stock <= item.min_stock_level / 2
                          ? "bg-red-50"
                          : "bg-yellow-50"
                      }`}
                    >
                      <td className="p-3 font-medium text-slate-800">
                        {item.name}
                      </td>
                      <td className="p-3 text-slate-600">
                        {item.category_name}
                      </td>
                      <td className="p-3 text-slate-600">{item.brand_name}</td>
                      <td className="p-3 text-center text-slate-600">
                        {item.warehouse_name}
                      </td>
                      <td className="p-3 text-center font-bold text-red-600">
                        {item.current_stock}
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        {item.min_stock_level}
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        {item.reorder_qty || 10}
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        {item.last_purchase || "—"}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleRestock(item.product_id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
