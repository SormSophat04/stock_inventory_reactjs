import React, { useState, useEffect } from "react";
import {
  FiPackage,
  FiPlus,
  FiTrash2,
  FiSave,
  FiRefreshCw,
  FiAlertTriangle,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { createStockOut, selectStockStatus, selectStockError, clearStockError } from "../../redux/slices/stockSlice";
import { selectAllProducts, fetchProducts, selectProductStatus } from "../../redux/slices/productSlice";
import { selectAllWarehouses, fetchWarehouses, selectWarehouseStatus } from "../../redux/slices/warehouseSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * Stock Out / Inventory Deduction Form
 * Used for removing items for reasons like Damage, Expiration, or Internal Use.
 */
export default function StockOutPage() {
  const dispatch = useDispatch();

  // Redux Data
  const products = useSelector(selectAllProducts);
  const warehouses = useSelector(selectAllWarehouses);
  const status = useSelector(selectStockStatus);
  const productStatus = useSelector(selectProductStatus);
  const warehouseStatus = useSelector(selectWarehouseStatus);
  const error = useSelector(selectStockError);

  const isLoading = status === 'loading' || productStatus === 'loading' || warehouseStatus === 'loading';

  // Form State
  const [formData, setFormData] = useState({
    warehouse_id: "",
    reason: "",
    note: "",
  });

  const [items, setItems] = useState([
    { product_id: "", product_name: "", quantity: 1 },
  ]);

  // Load Master Data
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchWarehouses());
    return () => {
      dispatch(clearStockError());
    };
  }, [dispatch]);

  // Handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    setItems([...items, { product_id: "", product_name: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const newItems = [...prev];
      if (field === "product_id") {
        const pid = parseInt(value);
        const prod = products.find((p) => p.product_id === pid);
        newItems[index] = {
          ...newItems[index],
          product_id: pid || "",
          product_name: prod ? prod.name : "",
        };
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }
      return newItems;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.warehouse_id || !formData.reason) {
      alert("Please select a warehouse and a reason.");
      return;
    }
    if (items.some((i) => !i.product_id || i.quantity <= 0)) {
      alert("Please ensure all items have a valid product and quantity.");
      return;
    }

    const payload = {
      warehouse_id: parseInt(formData.warehouse_id),
      reason: formData.reason,
      note: formData.note,
      items: items.map((i) => ({
        product_id: parseInt(i.product_id),
        quantity: parseInt(i.quantity),
      })),
    };

    try {
      await dispatch(createStockOut(payload)).unwrap();
      alert("Stock deduction recorded successfully!");
      handleClear();
    } catch (err) {
      // Error handled by Redux state
      console.error("Stock out failed", err);
    }
  };

  const handleClear = () => {
    setFormData({ warehouse_id: "", reason: "", note: "" });
    setItems([{ product_id: "", product_name: "", quantity: 1 }]);
    dispatch(clearStockError());
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      {isLoading && items.length <= 1 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
            <LoadingSpinner message="Loading Master Data..." />
          </div>
      ) : (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-red-100/50 text-red-600 rounded-lg">
                 <FiPackage size={24} />
              </span>
              Inventory Deduction
            </h1>
            <p className="mt-1 text-gray-500 text-sm">
              Record stock removed from inventory due to damage, expiration, or internal use.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <FiAlertTriangle className="shrink-0" size={20} />
            <span className="font-medium">{typeof error === 'string' ? error : JSON.stringify(error)}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-8">
          {/* Main Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Warehouse <span className="text-red-500">*</span></label>
              <select
                name="warehouse_id"
                value={formData.warehouse_id}
                onChange={handleFormChange}
                required
                className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Reason <span className="text-red-500">*</span></label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleFormChange}
                required
                className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
              >
                <option value="">Select Reason</option>
                <option value="Damaged">Damaged</option>
                <option value="Expired">Expired</option>
                <option value="Internal Use">Internal Use</option>
                <option value="Lost">Lost / Stolen</option>
                <option value="Adjustment">Adjustment</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Note</label>
              <input
                type="text"
                name="note"
                value={formData.note}
                onChange={handleFormChange}
                placeholder="Optional description..."
                className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Items to Remove</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                <FiPlus size={16} /> Add Product
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12 text-center">#</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Quantity</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-3 px-4 text-center text-sm text-gray-500">{index + 1}</td>
                      <td className="py-3 px-4">
                        <select
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                          required
                          className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-sm"
                        >
                          <option value="">Select Product...</option>
                          {products.map((p) => (
                            <option key={p.product_id} value={p.product_id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          required
                          className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-sm"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Remove item"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {items.length === 0 && (
              <div className="p-8 text-center text-gray-400 bg-gray-50/30 border border-t-0 border-gray-200 rounded-b-xl border-dashed">
                No items added. Click "Add Product" to start.
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw size={18} /> Reset
            </button>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Processing...' : <><FiSave size={18} /> Confirm Deduction</>}
            </button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
}
