import React, { useState, useEffect } from "react";
import {
  FiEdit,
  FiPlus,
  FiTrash2,
  FiSave,
  FiFileText,
  FiRefreshCw,
} from "react-icons/fi";

export default function StockAdjustmentPage() {
  // --- State ---
  const [adjustment, setAdjustment] = useState({
    warehouse_id: "",
    date: new Date().toISOString().slice(0, 10),
    reference_no: "ADJ-2025-0002",
    notes: "",
    items: [],
  });

  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // --- Effects ---
  useEffect(() => {
    // Simulate fetching master data
    setWarehouses([
      { id: 1, name: "Main Warehouse" },
      { id: 2, name: "Branch A" },
    ]);
    setProducts([
      { id: 1, name: "iPhone 15 Pro" },
      { id: 2, name: "Samsung Galaxy S25" },
      { id: 3, name: "MacBook Pro 16-inch" },
    ]);
    // In a real app, you might fetch the next reference number here
  }, []);

  // --- Event Handlers ---
  const handleHeaderChange = (field, value) => {
    setAdjustment((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    setAdjustment((prev) => ({
      ...prev,
      // FIX: Use prev.items to avoid stale state
      items: [
        ...prev.items,
        {
          product_id: "",
          type: "Add",
          quantity: 1,
          unit: "PCS",
        },
      ],
    }));
  };

  // FIX: Rewritten to use functional updates and ensure immutability
  const handleItemChange = (index, field, value) => {
    const isNumeric = ["quantity"].includes(field);
    const processedValue = isNumeric ? parseInt(value, 10) || 0 : value;

    setAdjustment((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: processedValue } : item
      ),
    }));
  };

  const handleRemoveItem = (index) => {
    setAdjustment((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Adjustment data:", adjustment);
    // TODO: Send POST request to /api/stock-adjustments
    alert("Adjustment Submitted! Check the console for the data.");
  };

  const handleClear = () => {
    setAdjustment({
      warehouse_id: "",
      date: new Date().toISOString().slice(0, 10),
      reference_no: "ADJ-2025-0002", // Or fetch new one
      notes: "",
      items: [],
    });
  };

  // UI: Check for form validity
  const isFormInvalid = !adjustment.warehouse_id || adjustment.items.length === 0;

  // --- Render ---
  return (
    <div className="p-4 sm:p-6 font-sans">
      <div className="mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Panel Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <FiEdit className="text-orange-600" />
            Stock Adjustment
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manually add or subtract stock for reasons like damage or loss.
          </p>
        </div>

        {/* FIX: Use <form> tag to enable onSubmit */}
        <form onSubmit={handleSave}>
          {/* --- Header Section --- */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Warehouse
              </label>
              <select
                className="border p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
                value={adjustment.warehouse_id}
                onChange={(e) =>
                  handleHeaderChange("warehouse_id", e.target.value)
                }
                required // Added for HTML5 validation
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
              <label className="block font-semibold text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                className="border p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
                value={adjustment.date}
                onChange={(e) => handleHeaderChange("date", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reference No.
              </label>
              <input
                type="text"
                readOnly
                className="border p-2 w-full rounded-lg bg-slate-100"
                value={adjustment.reference_no}
              />
            </div>
          </div>

          {/* --- Items Section --- */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Products</h2>
              <button
                type="button"
                onClick={handleAddItem}
                // UI: Added gap-2 for icon consistency
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus /> Add Product
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase">
                      #
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase w-2/5">
                      Product
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase">
                      Type
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase">
                      Qty
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase">
                      Unit
                    </th>
                    <th className="p-3 text-center text-sm font-semibold text-slate-600 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* UI: Show empty state message */}
                  {adjustment.items.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-6 text-center text-gray-500"
                      >
                        No products have been added yet.
                      </td>
                    </tr>
                  ) : (
                    adjustment.items.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="p-2 text-center text-slate-500">
                          {index + 1}
                        </td>
                        <td className="p-2">
                          <select
                            value={item.product_id}
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
                            <option value="">Select a product</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <select
                            value={item.type}
                            onChange={(e) =>
                              handleItemChange(index, "type", e.target.value)
                            }
                            className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Add">Add (+)</option>
                            <option value="Subtract">Subtract (-)</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.unit}
                            readOnly
                            className="border p-2 w-full rounded-md bg-slate-100"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                            title="Remove item"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- Notes Section --- */}
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
                className="block w-full p-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Reason for adjustment (e.g., found in warehouse, damaged goods, etc.)"
                rows="3"
                value={adjustment.notes}
                onChange={(e) => handleHeaderChange("notes", e.target.value)}
              />
            </div>

            {/* --- Actions Section --- */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClear}
                // UI: Use gap-2 for icon consistency
                className="inline-flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <FiRefreshCw /> Clear
              </button>
              <button
                type="submit"
                // UI: Add disabled state
                disabled={isFormInvalid}
                className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <FiSave /> Submit Adjustment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}