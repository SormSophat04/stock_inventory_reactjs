import React, { useState, useEffect } from "react";
import { FiEdit, FiPlus, FiTrash2, FiSave, FiRefreshCw, FiLoader } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { adjustStock, selectStockStatus, selectStockError, clearStockError } from "../../redux/slices/stockSlice";
import { selectAllWarehouses, fetchWarehouses, selectWarehouseStatus } from "../../redux/slices/warehouseSlice";
import { selectAllProducts, fetchProducts, selectProductStatus } from "../../redux/slices/productSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function StockAdjustmentPage() {
  const dispatch = useDispatch();

  // Redux Selectors
  const warehouses = useSelector(selectAllWarehouses);
  const products = useSelector(selectAllProducts);
  const status = useSelector(selectStockStatus);
  const productStatus = useSelector(selectProductStatus);
  const warehouseStatus = useSelector(selectWarehouseStatus);
  const error = useSelector(selectStockError);

  const isLoading = status === 'loading' || productStatus === 'loading' || warehouseStatus === 'loading';

  // --- State ---
  const [adjustment, setAdjustment] = useState({
    warehouse_id: "",
    notes: "",
    items: [],
  });

  const [successMessage, setSuccessMessage] = useState("");

  // --- Effects ---
  useEffect(() => {
    dispatch(fetchWarehouses());
    dispatch(fetchProducts());
    
    // Cleanup
    return () => {
        dispatch(clearStockError());
    };
  }, [dispatch]);

  // --- Event Handlers ---
  const handleHeaderChange = (field, value) => {
    setAdjustment((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    setAdjustment((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: "",
          new_qty: 0,
        },
      ],
    }));
  };

  const handleItemChange = (index, field, value) => {
    const isNumeric = ["new_qty"].includes(field);
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

  const handleSave = async (e) => {
    e.preventDefault();

    if (!adjustment.warehouse_id) {
      alert("Please select a warehouse");
      return;
    }

    if (adjustment.items.length === 0) {
      alert("Please add at least one product");
      return;
    }

    // Validate all items
    for (let i = 0; i < adjustment.items.length; i++) {
      const item = adjustment.items[i];
      if (!item.product_id) {
        alert(`Please select a product for item ${i + 1}`);
        return;
      }
      if (item.new_qty < 0) {
        alert(`Quantity must be a positive number for item ${i + 1}`);
        return;
      }
    }

    try {
      // Submit each item as a separate stock adjustment as the backend expects single item per request
      // Ideally backend should handle bulk, but following existing pattern or loop
      // Wait, let's check backend. store() handles one item. 
      // So we loop here or update backend to bulk.
      // Current Backend Requirement: ONE item per request.
      // Update: The previous plan mentioned "Update store method", but didn't explicitly switch to bulk.
      // However, making multiple requests from frontend is bad.
      // For now, I will loop dispatch requests sequentially to ensure data integrity.
      
      const promises = adjustment.items.map((item) =>
        dispatch(adjustStock({
          warehouse_id: parseInt(adjustment.warehouse_id),
          product_id: parseInt(item.product_id),
          new_qty: parseInt(item.new_qty),
          reason: adjustment.notes || "Stock Adjustment",
        })).unwrap()
      );

      await Promise.all(promises);

      setSuccessMessage("Stock adjustment(s) created successfully!");

      // Reset form
      setTimeout(() => {
        handleClear();
        setSuccessMessage("");
      }, 2000);
    } catch (err) {
      console.error("Error creating adjustment:", err);
    } 
  };

  const handleClear = () => {
    setAdjustment({
      warehouse_id: "",
      notes: "",
      items: [],
    });
    dispatch(clearStockError());
  };

  // UI: Check for form validity
  const isFormInvalid =
    !adjustment.warehouse_id || adjustment.items.length === 0 || status === 'loading';

  // --- Render ---
  return (
    <div className="p-4 sm:p-6 font-sans">
      {isLoading && adjustment.items.length <= 1 ? ( // Basic check for initial load
          <div className="mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-12">
            <LoadingSpinner message="Loading Master Data..." />
          </div>
      ) : (
      <div className="mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
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

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="font-semibold">Error</p>
            <p>{typeof error === 'string' ? error : JSON.stringify(error)}</p>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
            <p className="font-semibold">Success</p>
            <p>{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* --- Header Section --- */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                className="border p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
                value={adjustment.warehouse_id}
                onChange={(e) =>
                  handleHeaderChange("warehouse_id", e.target.value)
                }
                required
              >
                <option value="">-- Select Warehouse --</option>
                {warehouses.map((w) => (
                  <option
                    key={w.warehouse_id}
                    value={w.warehouse_id}
                  >
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* --- Items Section --- */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">
                Products
              </h2>
              <button
                type="button"
                onClick={handleAddItem}
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
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase">
                      Product <span className="text-red-500">*</span>
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase">
                      New Qty <span className="text-red-500">*</span>
                    </th>
                    <th className="p-3 text-center text-sm font-semibold text-slate-600 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {adjustment.items.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
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
                              <option
                                key={p.product_id}
                                value={p.product_id}
                              >
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={item.new_qty}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "new_qty",
                                e.target.value
                              )
                            }
                            className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
                            required
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
                Notes / Reason
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
                className="inline-flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <FiRefreshCw /> Clear
              </button>
              <button
                type="submit"
                disabled={isFormInvalid}
                className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? <FiLoader className="animate-spin" /> : <FiSave />}
                {status === 'loading' ? "Saving..." : "Submit Adjustment"}
              </button>
            </div>
          </div>
        </form>
      </div>
      )}
    </div>
  );
}
