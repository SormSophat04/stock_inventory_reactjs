import React, { useState, useEffect } from "react";
import {
  FiClipboard,
  FiSave,
  FiRefreshCw,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

export default function StockCountPage() {
  const [count, setCount] = useState({
    warehouse_id: "",
    date: new Date().toISOString().slice(0, 10),
    reference_no: "CNT-2025-0001",
    notes: "",
    items: [], // Start with an empty list
  });

  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // Simulate fetching data on component mount
  useEffect(() => {
    setWarehouses([
      { id: 1, name: "Main Warehouse" },
      { id: 2, name: "Branch A" },
      { id: 3, name: "Branch B" },
    ]);

    // FIX: Added 'stock' to mock data to simulate system quantity
    setProducts([
      { id: 1, name: "iPhone 15 Pro", unit: "PCS", stock: 50 },
      { id: 2, name: "MacBook Air", unit: "PCS", stock: 20 },
      { id: 3, name: "Apple Watch SE", unit: "PCS", stock: 75 },
    ]);
  }, []);

  const handleHeaderChange = (field, value) => {
    setCount((prev) => ({ ...prev, [field]: value }));
  };

  // FIX: Consolidated all item logic into one immutable handler
  const handleItemChange = (index, field, value) => {
    setCount((prev) => {
      // Create a new items array using .map
      const newItems = prev.items.map((item, i) => {
        if (i !== index) return item; // Not the item we're changing

        const newProductId = parseInt(value, 10) || "";
        const product = products.find((p) => p.id === newProductId);
        // Handle different fields
        switch (field) {
          case "product_id":
            return {
              ...item,
              product_id: newProductId,
              // LOGIC: Automatically set system_qty and reset counted_qty
              system_qty: product ? product.stock : 0,
              counted_qty: 0, // Reset count when product changes
            };
          case "counted_qty":
            return {
              ...item,
              counted_qty: parseInt(value, 10) || 0,
            };
          default:
            return item;
        }
      });
      return { ...prev, items: newItems };
    });
  };

  const handleAddItem = () => {
    setCount((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: "", system_qty: 0, counted_qty: 0 }],
    }));
  };

  const handleRemoveItem = (index) => {
    setCount((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // We can re-calculate differences on submit to ensure data is fresh
    const finalCount = {
      ...count,
      items: count.items.map((item) => ({
        ...item,
        difference: item.counted_qty - item.system_qty,
      })),
    };
    console.log("Stock Count Data:", finalCount);
    // send POST /api/stock-counts
    alert("Stock Count Submitted! Check the console for the data.");
  };

  const handleClear = () => {
    setCount({
      warehouse_id: "",
      date: new Date().toISOString().slice(0, 10),
      reference_no: "CNT-2025-0001",
      notes: "",
      items: [],
    });
  };

  // UI: Check for form validity
  const isFormInvalid = !count.warehouse_id || count.items.length === 0;

  return (
    <div className="p-4 sm:p-6 font-sans">
      <div className="mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Panel Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <FiClipboard className="text-teal-600" />
            Stock Count
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Perform a physical stock count and record discrepancies.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Count Details Form */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-5">
              Count Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Warehouse
                </label>
                <select
                  className="block w-full p-2 rounded-md border border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  value={count.warehouse_id}
                  onChange={(e) =>
                    handleHeaderChange("warehouse_id", e.target.value)
                  }
                  required
                >
                  <option value="">-- Select Warehouse --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  className="block w-full p-2 rounded-md border border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  value={count.date}
                  onChange={(e) => handleHeaderChange("date", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reference No.
                </label>
                <input
                  type="text"
                  readOnly
                  className="block w-full p-2 rounded-md border border-gray-300 bg-gray-100 shadow-sm focus:outline-none"
                  value={count.reference_no}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Product Items Table */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Products</h2>
              <button
                type="button"
                onClick={handleAddItem}
                // UI: Use gap-2 for consistency
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus /> Add Item
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="bg-slate-100">
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase w-12">
                      #
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase w-2/5">
                      Product
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase">
                      System Qty
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase">
                      Counted Qty
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase">
                      Difference
                    </th>
                    <th className="p-3 text-center text-sm font-semibold text-slate-600 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* UI: Show empty state message */}
                  {count.items.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-gray-500">
                        No products have been added yet.
                      </td>
                    </tr>
                  ) : (
                    count.items.map((item, index) => {
                      // Calculate difference for real-time feedback
                      const difference = item.counted_qty - item.system_qty;

                      return (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="p-2 text-center text-slate-500">
                            {index + 1}
                          </td>
                          <td className="p-2">
                            <select
                              value={item.product_id}
                              // FIX: Use new consolidated handler
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "product_id",
                                  e.target.value
                                )
                              }
                              className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="">Select Product</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2 text-gray-700">
                            {item.system_qty}
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
                              value={item.counted_qty}
                              // FIX: Use new consolidated handler
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "counted_qty",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </td>
                          <td
                            className={`p-2 whitespace-nowrap text-sm font-medium ${
                              difference > 0
                                ? "text-green-600"
                                : difference < 0
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {difference}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                              title="Remove row"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Notes & Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="mb-6">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notes
              </label>
              <textarea
                id="notes"
                className="block w-full p-2 rounded-md border border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                placeholder="Optional notes about the stock count (e.g., reasons for discrepancies)"
                rows="3"
                value={count.notes}
                onChange={(e) => handleHeaderChange("notes", e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClear}
                // UI: Use gap-2 for consistency
                className="inline-flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <FiRefreshCw /> Clear
              </button>
              <button
                type="submit"
                // UI: Add disabled state
                disabled={isFormInvalid}
                className="inline-flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <FiSave />
                Save Count
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
