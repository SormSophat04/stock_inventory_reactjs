import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiFileText, 
  FiPlus, 
  FiX, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiLoader,
  FiSearch,
  FiFilter,
  FiEye,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiShoppingBag,
  FiDownload
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import axios from '../../api/axios';
import { fetchSales, selectAllSales, selectSaleStatus, selectSaleError, clearSaleError } from "../../redux/slices/saleSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// --- Components ---

const Notification = ({ notification, onClear }) => {
  if (!notification) return null;
  const { type, message } = notification;
  const isSuccess = type === "success";
  const bgColor = isSuccess ? "bg-emerald-500" : "bg-red-500";
  const Icon = isSuccess ? FiCheckCircle : FiAlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: "-50%" }}
      animate={{ opacity: 1, y: 20, x: "-50%" }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-0 left-1/2 z-[60] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl text-white ${bgColor} backdrop-blur-md bg-opacity-90`}
    >
      <Icon className="text-xl" />
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClear} className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors">
        <FiX />
      </button>
    </motion.div>
  );
};

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">{children}</div>
      </motion.div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Paid: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
    Confirmed: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
    Partial: "bg-amber-100 text-amber-700 ring-amber-600/20",
    Unpaid: "bg-red-100 text-red-700 ring-red-600/20",
    Draft: "bg-slate-100 text-slate-700 ring-slate-600/20",
    Cancelled: "bg-red-50 text-red-600 ring-red-600/10",
  };
  
  const defaultStyle = "bg-slate-100 text-slate-700 ring-slate-600/20";
  const activeStyle = styles[status] || defaultStyle;

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${activeStyle}`}>
      {status}
    </span>
  );
};

// --- Main Page ---

export default function SaleInvoicesHistory() {
  const dispatch = useDispatch();

  // Redux
  const sales = useSelector(selectAllSales);
  const status = useSelector(selectSaleStatus);
  const error = useSelector(selectSaleError);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notification, setNotification] = useState(null);
  
  // View Modal
  const [selectedSale, setSelectedSale] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Effects
  useEffect(() => {
    dispatch(fetchSales());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
       setNotification({ type: 'error', message: error });
       dispatch(clearSaleError());
    }
  }, [error, dispatch]);

  // Handlers
  const handleViewSale = (sale) => {
    setSelectedSale(sale);
    setIsViewModalOpen(true);
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.invoice_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sale.payment_status === statusFilter || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = async () => {
    try {
      setNotification({ type: 'info', message: 'Exporting sales...' });
      const response = await axios.get('/sales/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setNotification({ type: 'success', message: 'Sales exported successfully' });
    } catch (error) {
      console.error('Export error:', error);
      setNotification({ type: 'error', message: 'Failed to export sales' });
    }
  };

  const isLoading = status === 'loading';

  return (
    <div className="p-6 max-w-[1600px] mx-auto font-sans text-slate-800">
      <AnimatePresence>
        <Notification notification={notification} onClear={() => setNotification(null)} />
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
             <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                <FiFileText size={24} />
             </div>
             Sales History
          </h1>
          <p className="mt-2 text-slate-500">View and manage past sales transactions.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow-xl shadow-slate-200 transition-all transform hover:scale-[1.02]"
        >
          <FiDownload size={20} />
          <span>Export Excel</span>
        </button>
      </div>

       {/* Stats Cards */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Sales</h3>
            <p className="text-3xl font-bold text-slate-900">{sales.length}</p>
         </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Confirmed</h3>
            <p className="text-3xl font-bold text-emerald-500">{sales.filter(s => s.status === 'Confirmed').length}</p>
         </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Recent (Today)</h3>
            <p className="text-3xl font-bold text-indigo-500">
              {sales.filter(s => s.sale_date === new Date().toISOString().split('T')[0]).length}
            </p>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-indigo-600">
                ${sales.reduce((acc, s) => acc + parseFloat(s.total_amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
         </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FiSearch />
            </div>
            <input 
                type="text" 
                placeholder="Search Invoice # or Customer..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
            />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
             <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                <FiFilter className="text-slate-400" />
                <select 
                    className="bg-transparent outline-none text-sm font-medium text-slate-600"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Draft">Draft</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
             </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                {["Invoice", "Customer", "Warehouse", "Date", "Status", "Amount", "Action"].map((h) => (
                  <th key={h} className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && sales.length === 0 ? (
                <tr>
                   <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                      <div className="flex justify-center">
                        <LoadingSpinner message="Loading sales history..." />
                      </div>
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                   <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                      No sales found matching criteria.
                  </td>
                </tr>
              ) : filteredSales.map((sale) => (
                  <tr key={sale.sale_invoice_id || sale.sale_id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                          {sale.invoice_no}
                      </td>
                       <td className="px-6 py-4 text-sm text-slate-600">
                           <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                   {sale.customer?.name?.charAt(0) || "W"}
                               </div>
                               {sale.customer?.name || "Walk-in"}
                           </div>
                      </td>
                       <td className="px-6 py-4 text-sm text-slate-600">
                           {sale.warehouse?.name}
                      </td>
                       <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                           {new Date(sale.sale_date).toLocaleDateString()}
                      </td>
                       <td className="px-6 py-4">
                           <StatusBadge status={sale.status || "Draft"} />
                      </td>
                       <td className="px-6 py-4 text-sm font-bold text-slate-900">
                           ${parseFloat(sale.total_amount).toFixed(2)}
                      </td>
                       <td className="px-6 py-4">
                           <button 
                              onClick={() => handleViewSale(sale)}
                              className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                           >
                               <FiEye size={16} />
                           </button>
                      </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal (Receipt Style) */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Sale Receipt"
      >
         {selectedSale && (
            <div className="space-y-6">
                {/* Receipt Header */}
                <div className="flex justify-between items-start border-b border-dashed border-gray-300 pb-4">
                    <div>
                         <h3 className="text-xl font-bold text-slate-900 border-2 border-slate-900 inline-block px-2 py-1 mb-2">INVOICE</h3>
                         <div className="space-y-1 text-sm text-slate-500">
                             <p className="flex items-center gap-2"><FiFileText size={14} /> {selectedSale.invoice_no}</p>
                             <p className="flex items-center gap-2"><FiCalendar size={14} /> {new Date(selectedSale.sale_date).toLocaleDateString()}</p>
                         </div>
                    </div>
                    <div className="text-right text-sm">
                         <h4 className="font-bold text-slate-800">{selectedSale.warehouse?.name}</h4>
                         <p className="text-slate-500">Warehouse Location</p>
                    </div>
                </div>
                
                {/* Customer Info */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Bill To</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 border border-slate-200">
                            <FiUser size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">{selectedSale.customer?.name || "Walk-in Customer"}</p>
                            <p className="text-xs text-slate-500">Valued Customer</p>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div>
                     <table className="w-full text-left">
                        <thead className="bg-slate-100 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-2 rounded-l-lg">Item</th>
                                <th className="px-4 py-2 text-center">Qty</th>
                                <th className="px-4 py-2 text-right">Price</th>
                                <th className="px-4 py-2 text-right rounded-r-lg">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {selectedSale.items?.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.product?.name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 text-center">{item.quantity}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 text-right">${parseFloat(item.sell_price).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-slate-800 text-right">${parseFloat(item.subtotal || (item.quantity * item.sell_price)).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                     </table>
                </div>

                {/* Totals */}
                <div className="border-t-2 border-slate-800 pt-4 flex justify-end">
                    <div className="w-48 space-y-2">
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Subtotal</span>
                            <span>${parseFloat(selectedSale.total_amount).toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-200 pt-2">
                            <span>Total</span>
                            <span>${parseFloat(selectedSale.total_amount).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
         )}
      </Modal>
    </div>
  );
}
