import React, { useEffect, useState, useMemo } from "react";
import {
  FiAlertTriangle,
  FiRefreshCw,
  FiShoppingCart,
  FiFilter,
  FiCheckCircle,
  FiSearch
} from "react-icons/fi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLowStockAlerts,
  selectLowStockAlerts,
  selectStockStatus,
  selectStockError,
} from "../../redux/slices/stockSlice";
import {
  fetchCategories,
  selectAllCategories,
} from "../../redux/slices/categorySlice";
import {
  fetchBrands,
  selectAllBrands,
} from "../../redux/slices/brandSlice";
import {
  fetchWarehouses,
  selectAllWarehouses,
} from "../../redux/slices/warehouseSlice";

/**
 * Low Stock Alerts Page
 * Displays items falling below min_stock_level.
 * Theme: Orange/Amber (Warning)
 */
export default function LowStockAlert() {
  const dispatch = useDispatch();

  // Redux Data
  const alerts = useSelector(selectLowStockAlerts);
  const categories = useSelector(selectAllCategories);
  const brands = useSelector(selectAllBrands);
  const warehouses = useSelector(selectAllWarehouses);
  
  const status = useSelector(selectStockStatus);
  const error = useSelector(selectStockError);

  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    warehouse: "",
    search: "",
  });

  useEffect(() => {
    dispatch(fetchLowStockAlerts());
    dispatch(fetchCategories());
    dispatch(fetchBrands());
    dispatch(fetchWarehouses());
  }, [dispatch]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesCategory = filters.category ? parseInt(alert.category_id) === parseInt(filters.category) : true;
      const matchesBrand = filters.brand ? parseInt(alert.brand_id) === parseInt(filters.brand) : true;
      const matchesWarehouse = filters.warehouse ? parseInt(alert.warehouse_id) === parseInt(filters.warehouse) : true;
      const matchesSearch = filters.search
        ? alert.name.toLowerCase().includes(filters.search.toLowerCase()) || 
          alert.sku?.toLowerCase().includes(filters.search.toLowerCase())
        : true;

      return matchesCategory && matchesBrand && matchesWarehouse && matchesSearch;
    });
  }, [alerts, filters]);

  const handleRestock = (productId) => {
    // In a real app, this might navigate to /inventory/stock-in with pre-filled data
    alert(`Initiating restock for Product ID: ${productId}`);
  };

  const handleRefresh = () => {
    dispatch(fetchLowStockAlerts());
  };

  const loading = status === 'loading';

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 bg-amber-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                <FiAlertTriangle size={24} />
              </span>
              Low Stock Alerts
            </h1>
            <p className="mt-1 text-gray-500 text-sm">
              Manage inventory items that have fallen below their minimum stock levels.
            </p>
          </div>
          <button
             onClick={handleRefresh}
             className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
          >
             <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
             <FiAlertTriangle className="shrink-0" />
             <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span>
          </div>
        )}

        {/* Filters */}
        <div className="p-8 pb-0 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiSearch />
                </div>
                <input
                    type="text"
                    placeholder="Search product or SKU..."
                    className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                />
            </div>
            
            <select
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm"
            >
                <option value="">All Categories</option>
                {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>{c.name}</option>
                ))}
            </select>

            <select
                onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm"
            >
                <option value="">All Brands</option>
                {brands.map((b) => (
                <option key={b.brand_id} value={b.brand_id}>{b.name}</option>
                ))}
            </select>

             <select
                onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}
                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm"
            >
                <option value="">All Warehouses</option>
                {warehouses.map((w) => (
                <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>
                ))}
            </select>
        </div>

        {/* Table */}
        <div className="p-8">
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-200">
                        <tr>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Warehouse</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Current</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Min Level</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {status === 'loading' ? (
                            <tr>
                                <td colSpan="7" className="py-20 text-center">
                                    <LoadingSpinner message="Loading Stock Alerts..." />
                                </td>
                            </tr>
                        ) : filteredAlerts.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <div className="p-4 bg-green-50 rounded-full text-green-500 mb-3">
                                            <FiCheckCircle size={32} />
                                        </div>
                                        <p className="text-lg font-medium text-gray-900">All Stock Levels Healthy</p>
                                        <p className="text-sm">No items are currently below minimum stock levels.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredAlerts.map((item) => {
                                const isCritical = item.current_stock <= (item.min_stock_level / 2);
                                
                                return (
                                    <tr key={`${item.product_id}-${item.warehouse_id}`} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-gray-900">{item.name}</div>
                                            <div className="text-xs text-gray-500">{item.sku || 'No SKU'}</div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 text-sm">{item.category_name}</td>
                                        <td className="py-3 px-4 text-center text-gray-600 text-sm">{item.warehouse_name}</td>
                                        <td className="py-3 px-4 text-center">
                                            {isCritical ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Critical
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                    Low
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`font-bold ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
                                                {item.current_stock}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center text-sm text-gray-500">
                                            {item.min_stock_level}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={() => handleRestock(item.product_id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold transition-colors border border-amber-200"
                                            >
                                                <FiShoppingCart size={14} /> Restock
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
      </div>
    </div>
  );
}
