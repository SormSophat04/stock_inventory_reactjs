import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiFileText,
  FiPlus,
  FiCheckCircle,
  FiX,
  FiAlertCircle,
  FiLoader,
  FiSearch,
  FiFilter,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiCreditCard
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchPurchases, 
  selectAllPurchases, 
  selectPurchaseStatus, 
  selectPurchaseError,
  clearPurchaseError
} from "../../redux/slices/purchaseSlice";
import { fetchSuppliers, selectAllSuppliers, selectSupplierStatus } from "../../redux/slices/supplierSlice";
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
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </motion.div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Paid: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
    Received: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
    Partial: "bg-amber-100 text-amber-700 ring-amber-600/20",
    Unpaid: "bg-red-100 text-red-700 ring-red-600/20",
    Pending: "bg-yellow-100 text-yellow-700 ring-yellow-600/20",
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

export default function PurchaseInvoicesPage() {
  const dispatch = useDispatch();
  
  // Redux State
  const invoices = useSelector(selectAllPurchases);
  const suppliers = useSelector(selectAllSuppliers);
  const supplierStatus = useSelector(selectSupplierStatus);
  const status = useSelector(selectPurchaseStatus);
  const error = useSelector(selectPurchaseError);

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [totalAmount, setTotalAmount] = useState(0);

  // --- Effects ---
  useEffect(() => {
    dispatch(fetchPurchases());
    dispatch(fetchSuppliers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
       setNotification({ type: 'error', message: error });
       dispatch(clearPurchaseError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- Logic ---

  const resetForm = () => {
    setInvoiceNumber(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
    setSupplierId("");
    setPoNumber("");
    setInvoiceDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("Bank Transfer");
    setPaymentStatus("Unpaid");
    setTotalAmount(0);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmitNewInvoice = async () => {
    if (!invoiceNumber || !supplierId || totalAmount <= 0) {
      setNotification({ type: "error", message: "Invoice #, Supplier, and Amount are required." });
      return;
    }

    setNotification({
      type: "info",
      message: "Please used Purchase Orders for full itemized tracking. This is a UI demo.",
    });
    setIsModalOpen(false);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoice_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isLoading = status === 'loading' || supplierStatus === 'loading';

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
             Purchase Invoices
          </h1>
          <p className="mt-2 text-slate-500">Track and manage financial records for purchases.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow-xl shadow-slate-200 transition-all transform hover:scale-[1.02]"
        >
          <FiPlus size={20} />
          <span>New Invoice</span>
        </button>
      </div>

       {/* Stats Cards */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Invoices</h3>
            <p className="text-3xl font-bold text-slate-900">{invoices.length}</p>
         </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Paid</h3>
            <p className="text-3xl font-bold text-emerald-500">{invoices.filter(o => o.payment_status === 'Paid').length}</p>
         </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Unpaid</h3>
            <p className="text-3xl font-bold text-red-500">{invoices.filter(o => o.payment_status === 'Unpaid').length}</p>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Value</h3>
            <p className="text-3xl font-bold text-indigo-600">
                ${invoices.reduce((acc, o) => acc + parseFloat(o.total_amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                placeholder="Search Invoice # or Supplier..." 
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
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partial">Partial</option>
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
                {["Invoice #", "Supplier", "Ref PO", "Date", "Status", "Amount", "Action"].map((h) => (
                  <th key={h} className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <LoadingSpinner message="Loading invoices..." />
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    No invoices found.
                  </td>
                </tr>
              ) : filteredInvoices.map((inv) => (
                    <tr key={inv.purchase_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                            {inv.invoice_no}
                        </td>
                         <td className="px-6 py-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                    {inv.supplier?.name?.charAt(0) || "S"}
                                </div>
                                {inv.supplier?.name}
                            </div>
                        </td>
                         <td className="px-6 py-4 text-sm text-slate-500">
                            <span className="font-mono text-xs">{inv.invoice_no}</span> 
                            {/* Assuming PO ref is similar or not stored separately in this model */}
                        </td>
                         <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(inv.purchase_date).toLocaleDateString()}
                        </td>
                         <td className="px-6 py-4">
                            <StatusBadge status={inv.payment_status || "Unpaid"} />
                        </td>
                         <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                             ${parseFloat(inv.total_amount).toFixed(2)}
                        </td>
                         <td className="px-6 py-4">
                            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                                View PDF
                            </button>
                        </td>
                    </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       {/* Create Modal */}
       <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <>
            <FiPlus className="text-indigo-500" /> New Purchase Invoice
          </>
        }
      >
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                     <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Invoice Number</label>
                     <div className="relative">
                        <FiFileText className="absolute left-3 top-3 text-slate-400" />
                        <input 
                            type="text" 
                            className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            value={invoiceNumber}
                            onChange={e => setInvoiceNumber(e.target.value)}
                        />
                     </div>
                </div>
                 <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Supplier</label>
                     <div className="relative">
                        <FiUser className="absolute left-3 top-3 text-slate-400" />
                        <select 
                            className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none"
                            value={supplierId}
                            onChange={e => setSupplierId(e.target.value)}
                        >
                            <option value="" disabled>Select Supplier</option>
                            {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>)}
                        </select>
                     </div>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">PO Reference</label>
                    <input 
                         type="text" 
                         className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                         value={poNumber}
                         onChange={e => setPoNumber(e.target.value)}
                         placeholder="PO-XXXX"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Invoice Date</label>
                    <div className="relative">
                         <FiCalendar className="absolute left-3 top-3 text-slate-400" />
                         <input 
                            type="date" 
                            className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            value={invoiceDate}
                            onChange={e => setInvoiceDate(e.target.value)}
                        />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Payment Method</label>
                    <div className="relative">
                         <FiCreditCard className="absolute left-3 top-3 text-slate-400" />
                         <select 
                            className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none"
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value)}
                        >
                             <option>Bank Transfer</option>
                             <option>Cash</option>
                             <option>Credit Card</option>
                             <option>e-Wallet</option>
                        </select>
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Payment Status</label>
                    <select 
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={paymentStatus}
                        onChange={e => setPaymentStatus(e.target.value)}
                    >
                        <option>Unpaid</option>
                        <option>Partial</option>
                        <option>Paid</option>
                    </select>
                 </div>
            </div>
             <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Amount ($)</label>
                <div className="relative">
                     <FiDollarSign className="absolute left-3 top-3 text-slate-400" />
                     <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-lg"
                        value={totalAmount}
                        onChange={e => setTotalAmount(parseFloat(e.target.value) || 0)}
                    />
                </div>
             </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
            >
                Cancel
            </button>
             <button 
                onClick={handleSubmitNewInvoice}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:scale-[1.02]"
            >
                <FiCheckCircle />
                Create Invoice
            </button>
        </div>
      </Modal>
    </div>
  );
}
