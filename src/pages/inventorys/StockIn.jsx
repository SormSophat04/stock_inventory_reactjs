import React, { useState, useEffect, useMemo } from "react";
import {
  FiLogIn,
  FiPlus,
  FiSave,
  FiTrash2,
  FiRefreshCw,
  FiAlertTriangle,
  FiCalendar,
  FiFileText,
  FiBox,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { createStockIn, selectStockStatus, selectStockError, clearStockError } from "../../redux/slices/stockSlice";
import { selectAllProducts, fetchProducts, selectProductStatus } from "../../redux/slices/productSlice";
import { selectAllSuppliers, fetchSuppliers, selectSupplierStatus } from "../../redux/slices/supplierSlice";
import { selectAllWarehouses, fetchWarehouses, selectWarehouseStatus } from "../../redux/slices/warehouseSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * Stock In / Purchase Entry Form
 * Used for adding inventory from suppliers.
 */
export default function StockIn() {
  const dispatch = useDispatch();

  // Redux Selectors
  const products = useSelector(selectAllProducts);
  const suppliers = useSelector(selectAllSuppliers);
  const warehouses = useSelector(selectAllWarehouses);
  const status = useSelector(selectStockStatus);
  const productStatus = useSelector(selectProductStatus);
  const supplierStatus = useSelector(selectSupplierStatus);
  const warehouseStatus = useSelector(selectWarehouseStatus);
  const error = useSelector(selectStockError);

  const isLoading = status === 'loading' || productStatus === 'loading' || supplierStatus === 'loading' || warehouseStatus === 'loading';

  const [items, setItems] = useState([
    { product_id: "", quantity: 1, price: 0 },
  ]);

  // Combined state for purchase details
  const [stockData, setStockData] = useState({
    supplier_id: "",
    warehouse_id: "",
    purchase_date: new Date().toISOString().slice(0, 10),
    invoice: "",
    note: "",
  });

  // Fetch Master Data
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchSuppliers());
    dispatch(fetchWarehouses());

    // Cleanup errors on unmount
    return () => {
      dispatch(clearStockError());
    };
  }, [dispatch]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }, [items]);

  const handleAddRow = () => {
    setItems((prevItems) => [
      ...prevItems,
      { product_id: "", quantity: 1, price: 0 },
    ]);
  };

  const handleRemoveRow = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleItemChange = (index, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item, i) => {
        if (i !== index) return item;
        const updatedValue = ["quantity", "price"].includes(field)
          ? parseFloat(value) || 0
          : value;
        return { ...item, [field]: updatedValue };
      })
    );
  };

  const handleStockDataChange = (field, value) => {
    setStockData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (items.length === 0 || !items[0].product_id) {
      alert("Please add at least one product.");
      return;
    }

    const payload = {
      ...stockData,
      items: items.map((item) => ({
        product_id: parseInt(item.product_id),
        quantity: item.quantity,
        unit_price: item.price,
      })),
    };

    try {
      await dispatch(createStockIn(payload)).unwrap();
      alert("Stock-in saved successfully!");
      handleClear();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleClear = () => {
    setItems([{ product_id: "", quantity: 1, price: 0 }]);
    setStockData({
      supplier_id: "",
      warehouse_id: "",
      purchase_date: new Date().toISOString().slice(0, 10),
      invoice: "",
      note: "",
    });
    dispatch(clearStockError());
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      {(isLoading && items.length <= 1) ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
             <LoadingSpinner message="Loading Master Data..." />
          </div>
      ) : (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 bg-green-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-green-100 text-green-700 rounded-lg">
                <FiLogIn size={24} />
              </span>
              Stock-In Entry
            </h1>
            <p className="mt-1 text-gray-500 text-sm">
              Record new inventory purchases from suppliers.
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
          {/* Main Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Supplier <span className="text-red-500">*</span></label>
              <select
                value={stockData.supplier_id}
                onChange={(e) => handleStockDataChange("supplier_id", e.target.value)}
                required
                className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Warehouse <span className="text-red-500">*</span></label>
              <select
                value={stockData.warehouse_id}
                onChange={(e) => handleStockDataChange("warehouse_id", e.target.value)}
                required
                className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Purchase Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiCalendar />
                </div>
                <input
                  type="date"
                  value={stockData.purchase_date}
                  onChange={(e) => handleStockDataChange("purchase_date", e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Invoice No</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiFileText />
                </div>
                <input
                  type="text"
                  value={stockData.invoice}
                  onChange={(e) => handleStockDataChange("invoice", e.target.value)}
                  placeholder="INV-001"
                  required
                  className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-2">
               <label className="text-sm font-semibold text-gray-700">Note</label>
               <input
                  type="text"
                  value={stockData.note}
                  onChange={(e) => handleStockDataChange("note", e.target.value)}
                  placeholder="Optional reference note..."
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                />
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiBox className="text-green-600" />
                Products
              </h3>
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-semibold transition-colors"
              >
                <FiPlus size={16} /> Add Product
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-2/5">Product</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Subtotal</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-3 px-4">
                        <select
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                          required
                          className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-sm"
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
                          className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-sm"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, "price", e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-sm"
                        />
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-700">
                        {formatCurrency(item.quantity * item.price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(index)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Remove row"
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
          </div>

          {/* Footer & Actions */}
          <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
             <div className="text-right sm:text-left">
                <span className="text-base font-medium text-gray-500 block">Grand Total</span>
                <span className="text-3xl font-bold text-gray-900 tracking-tight">{formatCurrency(total)}</span>
              </div>
              
              <div className="flex items-center gap-4">
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
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                   {status === 'loading' ? 'Saving...' : <><FiSave size={18} /> Save Record</>}
                </button>
              </div>
          </div>

        </form>
      </div>
      )}
    </div>
  );
}
