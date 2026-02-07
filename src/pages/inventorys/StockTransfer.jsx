import React, { useState, useEffect, useMemo } from "react";
import {
  FiPackage,
  FiPlus,
  FiTrash2,
  FiSave,
  FiRefreshCw,
  FiLoader,
  FiArrowRight,
  FiTruck,
  FiCalendar,
  FiAlertTriangle,
  FiFileText,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { transferStock, selectStockStatus, selectStockError, clearStockError } from "../../redux/slices/stockSlice";
import { selectAllWarehouses, fetchWarehouses, selectWarehouseStatus } from "../../redux/slices/warehouseSlice";
import { selectAllProducts, fetchProducts, selectProductStatus } from "../../redux/slices/productSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * Stock Transfer Page
 * Handles moving inventory between warehouses.
 * Theme: Purple/Indigo
 */
export default function StockTransferPage() {
  const dispatch = useDispatch();

  // Redux Selectors
  const warehouses = useSelector(selectAllWarehouses);
  const products = useSelector(selectAllProducts);
  const status = useSelector(selectStockStatus);
  const productStatus = useSelector(selectProductStatus);
  const warehouseStatus = useSelector(selectWarehouseStatus);
  const error = useSelector(selectStockError);

  const isLoading = status === 'loading' || productStatus === 'loading' || warehouseStatus === 'loading';

  const [transfer, setTransfer] = useState({
    from_warehouse_id: "",
    to_warehouse_id: "",
    transfer_date: new Date().toISOString().slice(0, 10),
    note: "",
    items: [{ product_id: "", quantity: 1 }],
  });

  // Fetch Master Data
  useEffect(() => {
    dispatch(fetchWarehouses());
    dispatch(fetchProducts());
    
    return () => {
        dispatch(clearStockError());
    };
  }, [dispatch]);

  // Derived State
  const availableToWarehouses = useMemo(() => {
    if (!transfer.from_warehouse_id) return warehouses;
    // Don't show the warehouse we are transferring FROM in the TO list
    return warehouses.filter(
      (w) => w.warehouse_id !== parseInt(transfer.from_warehouse_id)
    );
  }, [warehouses, transfer.from_warehouse_id]);

  // Handlers
  const handleTransferChange = (field, value) => {
    setTransfer((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    setTransfer((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: "", quantity: 1 }],
    }));
  };

  const handleRemoveItem = (index) => {
    if (transfer.items.length > 1) {
      setTransfer((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    setTransfer((prev) => {
      const newItems = prev.items.map((item, i) => {
        if (i !== index) return item;
        const updatedValue = field === "quantity" ? (parseInt(value) || 0) : value;
        return { ...item, [field]: updatedValue };
      });
      return { ...prev, items: newItems };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const validItems = transfer.items.filter(
      (item) => item.product_id && item.quantity > 0
    );

    if (validItems.length === 0) {
      alert("Please add at least one valid product to the transfer.");
      return;
    }

    if (transfer.from_warehouse_id === transfer.to_warehouse_id) {
       alert("Source and Destination warehouses cannot be the same.");
       return;
    }

    const payload = {
        from_warehouse_id: parseInt(transfer.from_warehouse_id),
        to_warehouse_id: parseInt(transfer.to_warehouse_id),
        transfer_date: transfer.transfer_date,
        note: transfer.note,
        items: validItems.map(item => ({
            product_id: parseInt(item.product_id),
            quantity: parseInt(item.quantity)
        }))
    };

    try {
      await dispatch(transferStock(payload)).unwrap();
      alert("Stock transfer created successfully!");
      handleClear();
    } catch (err) {
      console.error("Save Error:", err);
    }
  };

  const handleClear = () => {
    setTransfer({
      from_warehouse_id: "",
      to_warehouse_id: "",
      transfer_date: new Date().toISOString().slice(0, 10),
      note: "",
      items: [{ product_id: "", quantity: 1 }],
    });
    dispatch(clearStockError());
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      {isLoading && transfer.items.length <= 1 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
            <LoadingSpinner message="Loading Master Data..." />
          </div>
      ) : (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 bg-purple-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                <FiTruck size={24} />
              </span>
              Stock Transfer
            </h1>
            <p className="mt-1 text-gray-500 text-sm">
              Move inventory between your warehouses efficiently.
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
            
          {/* Transfer Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
            
            {/* From */}
            <div className="lg:col-span-4 space-y-2">
              <label className="text-sm font-semibold text-gray-700">From Source <span className="text-red-500">*</span></label>
              <select
                value={transfer.from_warehouse_id}
                onChange={(e) => handleTransferChange("from_warehouse_id", e.target.value)}
                required
                className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
              >
                <option value="">Select Origin Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>
                ))}
              </select>
            </div>

            {/* Arrow Divider */}
            <div className="lg:col-span-1 flex justify-center pt-8 text-gray-400">
               <FiArrowRight size={24} className="hidden lg:block rotate-0" />
               <FiArrowRight size={24} className="block lg:hidden rotate-90" />
            </div>

            {/* To */}
            <div className="lg:col-span-4 space-y-2">
              <label className="text-sm font-semibold text-gray-700">To Destination <span className="text-red-500">*</span></label>
              <select
                value={transfer.to_warehouse_id}
                onChange={(e) => handleTransferChange("to_warehouse_id", e.target.value)}
                required
                className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
              >
                <option value="">Select Destination Warehouse</option>
                {availableToWarehouses.map((w) => (
                  <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="lg:col-span-3 space-y-2">
              <label className="text-sm font-semibold text-gray-700">Date <span className="text-red-500">*</span></label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiCalendar />
                </div>
                <input
                    type="date"
                    value={transfer.transfer_date}
                    onChange={(e) => handleTransferChange("transfer_date", e.target.value)}
                    required
                    className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                />
              </div>
            </div>

             <div className="lg:col-span-12 space-y-2">
               <label className="text-sm font-semibold text-gray-700">Notes (Optional)</label>
               <input
                  type="text"
                  value={transfer.note}
                  onChange={(e) => handleTransferChange("note", e.target.value)}
                  placeholder="e.g. Restocking main branch..."
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                />
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiPackage className="text-purple-600" />
                Products to Move
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold transition-colors"
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
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transfer Quantity</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16 text-center">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {transfer.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-3 px-4 text-center text-sm text-gray-500">{index + 1}</td>
                      <td className="py-3 px-4">
                        <select
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                          required
                          className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-sm"
                        >
                          <option value="">Select Product...</option>
                          {products.map((p) => (
                            <option key={p.product_id} value={p.product_id}>
                                {p.name} ({p.sku || 'N/A'})
                            </option>
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
                          className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-sm"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        {transfer.items.length > 1 && (
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
             {transfer.items.length === 0 && (
              <div className="p-8 text-center text-gray-400 bg-gray-50/30 border border-t-0 border-gray-200 rounded-b-xl border-dashed">
                No items added. Click "Add Product" to start.
              </div>
            )}
          </div>

          {/* Footer & Actions */}
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
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {status === 'loading' ? <FiLoader className="animate-spin" /> : <FiSave size={18} />}
                {status === 'loading' ? "Processing..." : "Confirm Transfer"}
            </button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
}
