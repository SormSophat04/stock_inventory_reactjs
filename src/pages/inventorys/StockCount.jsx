import React, { useState, useEffect } from "react";
import {
  FiClipboard,
  FiSave,
  FiRefreshCw,
  FiPlus,
  FiTrash2,
  FiLoader,
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle,
  FiSearch
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  submitStockCount,
  fetchStocks,
  selectAllStocks,
  selectStockStatus,
  selectStockError,
  clearStockError,
} from "../../redux/slices/stockSlice";
import {
  fetchWarehouses,
  selectAllWarehouses,
  selectWarehouseStatus
} from "../../redux/slices/warehouseSlice";
import {
  fetchProducts,
  selectAllProducts,
  selectProductStatus
} from "../../redux/slices/productSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * Stock Count / Audit Page
 * Used for physical inventory reconciliation.
 * Theme: Teal/Cyan
 */
export default function StockCountPage() {
  const dispatch = useDispatch();

  // Redux Selectors
  const warehouses = useSelector(selectAllWarehouses);
  const products = useSelector(selectAllProducts);
  const stockList = useSelector(selectAllStocks);
  const status = useSelector(selectStockStatus);
  const productStatus = useSelector(selectProductStatus);
  const warehouseStatus = useSelector(selectWarehouseStatus);
  const error = useSelector(selectStockError);

  const isLoading = status === 'loading' || productStatus === 'loading' || warehouseStatus === 'loading';

  // --- State ---
  const [count, setCount] = useState({
    warehouse_id: "",
    date: new Date().toISOString().slice(0, 10),
    reference_no: "CNT-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000),
    notes: "",
    items: [],
  });

  const [successMessage, setSuccessMessage] = useState("");

  // --- Effects ---
  useEffect(() => {
    dispatch(fetchWarehouses());
    dispatch(fetchProducts());
    dispatch(fetchStocks()); // Needed to compare system quantity

    return () => {
      dispatch(clearStockError());
    };
  }, [dispatch]);

  const handleHeaderChange = (field, value) => {
    setCount((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setCount((prev) => {
      const newItems = prev.items.map((item, i) => {
        if (i !== index) return item;

        const newProductId = parseInt(value, 10) || "";

        switch (field) {
          case "product_id": {
            // Determine system quantity from stockList for selected warehouse
            let systemQty = 0;
            if (prev.warehouse_id) {
              const found = stockList.find(
                (s) =>
                  parseInt(s.product_id) === newProductId &&
                  parseInt(s.warehouse_id) === parseInt(prev.warehouse_id)
              );
              systemQty = found ? found.quantity : 0;
            }

            return {
              ...item,
              product_id: newProductId,
              system_qty: systemQty,
              counted_qty: 0,
            };
          }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!count.warehouse_id) {
      alert("Please select a warehouse first.");
      return;
    }

    const validItems = count.items.filter(i => i.product_id);

    if (validItems.length === 0) {
      alert("Please add at least one valid product to count.");
      return;
    }

    const finalCount = {
      warehouse_id: parseInt(count.warehouse_id, 10),
      date: count.date,
      reference_no: count.reference_no,
      notes: count.notes,
      items: validItems.map((item) => ({
        product_id: parseInt(item.product_id, 10),
        counted_qty: parseInt(item.counted_qty, 10) || 0,
      })),
    };

    try {
      const resultAction = await dispatch(submitStockCount(finalCount));
      if (submitStockCount.fulfilled.match(resultAction)) {
        const data = resultAction.payload;
        setSuccessMessage(
          data.message || 
          `Stock count processed. ${data.adjustments_created || 0} adjustments created.`
        );
        setTimeout(() => {
           handleClear();
           setSuccessMessage("");
        }, 3000);
      }
    } catch (err) {
      console.error("Failed to submit stock count:", err);
    }
  };

  const handleClear = () => {
    setCount({
      warehouse_id: "",
      date: new Date().toISOString().slice(0, 10),
      reference_no: "CNT-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000),
      notes: "",
      items: [],
    });
    dispatch(clearStockError());
    setSuccessMessage("");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      {isLoading && count.items.length <= 1 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
            <LoadingSpinner message="Loading Data..." />
          </div>
      ) : (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 bg-teal-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-teal-100 text-teal-700 rounded-lg">
                <FiClipboard size={24} />
              </span>
              Stock Audit
            </h1>
            <p className="mt-1 text-gray-500 text-sm">
              Perform physical inventory counts and resolve discrepancies.
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
            <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <FiAlertCircle className="shrink-0" size={20} />
            <span className="font-medium">{typeof error === 'string' ? error : JSON.stringify(error)}</span>
            </div>
        )}

        {successMessage && (
            <div className="mx-8 mt-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <FiCheckCircle className="shrink-0" size={20} />
            <span className="font-medium">{successMessage}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="p-8">
            
          {/* Main Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Warehouse <span className="text-red-500">*</span></label>
              <select
                className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                value={count.warehouse_id}
                onChange={(e) => handleHeaderChange("warehouse_id", e.target.value)}
                required
              >
                <option value="">Select Warehouse to Audit</option>
                {warehouses.map((w) => (
                  <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Audit Date</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiCalendar />
                </div>
                <input
                    type="date"
                    className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                    value={count.date}
                    onChange={(e) => handleHeaderChange("date", e.target.value)}
                    required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Reference No</label>
              <input
                type="text"
                readOnly
                className="w-full h-11 px-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                value={count.reference_no}
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiSearch className="text-teal-600" />
                Count Results
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-sm font-semibold transition-colors"
              >
                <FiPlus size={16} /> Add Product
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12 text-center">#</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-2/5">Product</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">System Qty</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Physical Count</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Difference</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {count.items.length === 0 ? (
                     <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-400 bg-gray-50/30 border-dashed">
                        No items added. Click "Add Product" to start counting.
                      </td>
                    </tr>
                  ) : (
                    count.items.map((item, index) => {
                      const difference = item.counted_qty - item.system_qty;
                      const diffColor = difference > 0 ? "text-green-600 bg-green-50" : difference < 0 ? "text-red-600 bg-red-50" : "text-gray-400 bg-gray-100";
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="py-3 px-4 text-center text-sm text-gray-500">{index + 1}</td>
                          <td className="py-3 px-4">
                            <select
                              value={item.product_id}
                              onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                              required
                              className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
                            >
                              <option value="">Select Product...</option>
                              {products.map((p) => (
                                <option key={p.product_id} value={p.product_id}>{p.name} ({p.sku})</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium">
                                {item.system_qty}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="number"
                              min="0"
                              value={item.counted_qty}
                              onChange={(e) => handleItemChange(index, "counted_qty", e.target.value)}
                              className="w-24 h-10 px-3 text-center bg-white border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm font-bold text-gray-800"
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                             <span className={`inline-flex items-center justify-center h-8 px-3 rounded-lg text-sm font-bold ${diffColor}`}>
                                {difference > 0 ? `+${difference}` : difference}
                             </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Remove item"
                            >
                              <FiTrash2 size={16} />
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

          {/* Footer & Actions */}
          <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
             <div className="w-full md:w-1/2 space-y-2">
               <label className="text-sm font-semibold text-gray-700">Audit Notes</label>
               <textarea
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none resize-none text-sm"
                  placeholder="Optional notes regarding discrepancies..."
                  rows="2"
                  value={count.notes}
                  onChange={(e) => handleHeaderChange("notes", e.target.value)}
                />
            </div>
            
             <div className="flex items-center gap-4 self-end md:self-center">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-white hover:shadow-sm transition-all flex items-center gap-2"
                >
                  <FiRefreshCw size={18} /> Reset
                </button>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                   {status === 'loading' ? <FiLoader className="animate-spin" /> : <FiSave size={18} />}
                   {status === 'loading' ? 'Processing...' : 'Finalize Audit'}
                </button>
              </div>
          </div>
        </form>
      </div>
      )}
    </div>
  );
}
