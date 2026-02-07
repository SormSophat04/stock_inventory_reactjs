import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { 
  FiRefreshCw, 
  FiPlus, 
  FiX, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiEdit3, 
  FiTrash2,
  FiSearch,
  FiFilter,
  FiRotateCcw,
  FiLoader,
  FiFileText,
  FiMapPin,
  FiUser
} from "react-icons/fi";

// Redux
import { 
  fetchReturns, 
  createReturn, 
  deleteReturn,
  updateReturn,
  selectAllReturns,
  selectReturnStatus,
  selectReturnError,
  clearReturnError
} from "../../redux/slices/returnSlice";
import { fetchCustomers, selectAllCustomers, selectCustomerStatus } from "../../redux/slices/customerSlice";
import { fetchWarehouses, selectAllWarehouses, selectWarehouseStatus } from "../../redux/slices/warehouseSlice";
import { fetchProducts, selectAllProducts, selectProductStatus } from "../../redux/slices/productSlice";
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
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
    Confirmed: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
    Pending: "bg-amber-100 text-amber-700 ring-amber-600/20",
    Draft: "bg-slate-100 text-slate-700 ring-slate-600/20",
    Cancelled: "bg-red-100 text-red-700 ring-red-600/20",
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

export default function ReturnOrders() {
  const dispatch = useDispatch();
  
  // Redux
  const returns = useSelector(selectAllReturns);
  const status = useSelector(selectReturnStatus);
  const error = useSelector(selectReturnError);
  const customers = useSelector(selectAllCustomers);
  const warehouses = useSelector(selectAllWarehouses);
  const products = useSelector(selectAllProducts);

  const customerStatus = useSelector(selectCustomerStatus);
  const warehouseStatus = useSelector(selectWarehouseStatus);
  const productStatus = useSelector(selectProductStatus);

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReturn, setEditingReturn] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form State
  const [saleRef, setSaleRef] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [reason, setReason] = useState("");
  const [refundType, setRefundType] = useState("Cash");
  const [returnItems, setReturnItems] = useState([]);
  const [returnStatusField, setReturnStatusField] = useState("Draft");

  // Effects
  useEffect(() => {
    dispatch(fetchReturns());
    dispatch(fetchCustomers());
    dispatch(fetchWarehouses());
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
       setNotification({ type: 'error', message: error });
       dispatch(clearReturnError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Logic
  const resetForm = () => {
    setSaleRef("");
    setCustomerId("");
    setWarehouseId("");
    setReason("");
    setRefundType("Cash");
    setReturnStatusField("Draft");
    setReturnItems([]);
    setEditingReturn(null);
  };

  const addItem = () => {
    setReturnItems([...returnItems, { key: Date.now(), product_id: "", qty: 1, price: 0, subtotal: 0 }]);
  };

  const removeItem = (key) => {
    setReturnItems(returnItems.filter(i => i.key !== key));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...returnItems];
    const item = newItems[index];

    if (field === "product_id") {
      const product = products.find(p => p.product_id === parseInt(value));
      item.product_id = value;
      item.price = product ? (parseFloat(product.sell_price) || 0) : 0;
    } else {
      item[field] = value;
    }

    item.subtotal = item.qty * item.price;
    setReturnItems(newItems);
  };

  const calculateTotal = () => returnItems.reduce((sum, i) => sum + i.subtotal, 0);

  const handleOpenModal = (ret = null) => {
    if (ret) {
      setEditingReturn(ret);
      setSaleRef(ret.sale_ref || ret.sale?.invoice_no || "");
      setCustomerId(ret.customer_id);
      setWarehouseId(ret.warehouse_id);
      setReason(ret.reason);
      setRefundType(ret.refund_type);
      setReturnStatusField(ret.status);
      setReturnItems((ret.items || []).map(i => ({
        key: Math.random(),
        product_id: i.product_id,
        qty: i.quantity,
        price: i.price,
        subtotal: i.quantity * i.price
      })));
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!saleRef || !customerId || !warehouseId) {
      setNotification({ type: "error", message: "Please fill all required fields." });
      return;
    }
    if (returnItems.length === 0) {
      setNotification({ type: "error", message: "Return at least one item." });
      return;
    }

    const payload = {
      sale_ref: saleRef,
      customer_id: parseInt(customerId),
      warehouse_id: parseInt(warehouseId),
      return_date: new Date().toISOString().split("T")[0],
      status: returnStatusField,
      reason: reason,
      refund_type: refundType,
      items: returnItems.map(i => ({
        product_id: parseInt(i.product_id),
        quantity: parseInt(i.qty),
        price: parseFloat(i.price)
      }))
    };

    try {
      if (editingReturn) {
        // Assuming updateReturn exists in slice
        await dispatch(updateReturn({ id: editingReturn.return_id, data: payload })).unwrap();
        setNotification({ type: "success", message: "Return updated successfully." });
      } else {
        await dispatch(createReturn(payload)).unwrap();
        setNotification({ type: "success", message: "Return created successfully." });
      }
      setIsModalOpen(false);
    } catch {
      setNotification({ type: "error", message: "Failed to create return." });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this return?")) return;
    try {
      await dispatch(deleteReturn(id)).unwrap();
      setNotification({ type: "success", message: "Return deleted." });
    } catch {
      setNotification({ type: "error", message: "Failed to delete return." });
    }
  };

  // Filter
  const filteredReturns = useMemo(() => {
    return returns.filter(ret => {
        const matchesSearch = 
            ret.return_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ret.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
  }, [returns, searchTerm, statusFilter]);

  const isLoading = status === 'loading' || customerStatus === 'loading' || warehouseStatus === 'loading' || productStatus === 'loading';

  return (
    <div className="p-6 max-w-[1600px] mx-auto font-sans text-slate-800">
      <AnimatePresence>
        <Notification notification={notification} onClear={() => setNotification(null)} />
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
             <div className="p-3 bg-red-500 rounded-xl text-white shadow-lg shadow-red-200">
                <FiRotateCcw size={24} />
             </div>
             Return Orders
          </h1>
          <p className="mt-2 text-slate-500">Manage customer returns and refunds.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow-xl shadow-slate-200 transition-all transform hover:scale-[1.02]"
        >
          <FiPlus size={20} />
          <span>New Return</span>
        </button>
      </div>

       {/* Stats Cards */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Returns</h3>
            <p className="text-3xl font-bold text-slate-900">{returns.length}</p>
         </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Pending Review</h3>
            <p className="text-3xl font-bold text-amber-500">{returns.filter(r => r.status === 'Draft' || r.status === 'Pending').length}</p>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Refunded</h3>
            <p className="text-3xl font-bold text-emerald-500">{returns.filter(r => r.status === 'Confirmed').length}</p>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Refunded</h3>
            <p className="text-3xl font-bold text-red-500">
                ${returns.reduce((acc, r) => acc + parseFloat(r.total_refund || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                placeholder="Search Return # or Customer..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
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
                    <option value="Draft">Draft</option>
                    <option value="Confirmed">Confirmed</option>
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
                {["Return #", "Sale Ref", "Customer", "Warehouse", "Date", "Status", "Refund ($)", "Action"].map((h) => (
                  <th key={h} className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && returns.length === 0 ? (
                <tr>
                   <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                      <LoadingSpinner message="Loading returns..." />
                  </td>
                </tr>
              ) : filteredReturns.length === 0 ? (
                <tr>
                   <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                      No returns found.
                  </td>
                </tr>
              ) : filteredReturns.map((ret) => (
                  <tr key={ret.return_id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                          {ret.return_no}
                      </td>
                       <td className="px-6 py-4 text-sm text-slate-600">
                           <div className="flex items-center gap-1">
                               <FiFileText className="text-slate-400" />
                               {ret.sale_ref || "N/A"}
                           </div>
                      </td>
                       <td className="px-6 py-4 text-sm text-slate-600">
                           {ret.customer?.name}
                      </td>
                       <td className="px-6 py-4 text-sm text-slate-600">
                           {ret.warehouse?.name}
                      </td>
                       <td className="px-6 py-4 text-sm text-slate-500">
                           {new Date(ret.return_date).toLocaleDateString()}
                      </td>
                       <td className="px-6 py-4">
                           <StatusBadge status={ret.status || "Draft"} />
                      </td>
                       <td className="px-6 py-4 text-sm font-bold text-slate-900">
                           ${parseFloat(ret.total_refund).toFixed(2)}
                      </td>
                       <td className="px-6 py-4">
                           <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handleOpenModal(ret)}
                                    className="p-1.5 text-indigo-600 hover:bg-white bg-indigo-50 rounded-lg transition-colors shadow-sm"
                                    title="Edit"
                                >
                                    <FiEdit3 size={16} />
                                </button>
                                <button 
                                     onClick={() => handleDelete(ret.return_id)}
                                    className="p-1.5 text-red-600 hover:bg-white bg-red-50 rounded-lg transition-colors shadow-sm"
                                    title="Delete"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                           </div>
                      </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <>
            {editingReturn ? <FiEdit3 className="text-indigo-500" /> : <FiRefreshCw className="text-indigo-500" />}
            {editingReturn ? "Edit Return Order" : "Create Return Order"}
          </>
        }
      >
         <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Sale Reference</label>
                    <div className="relative">
                        <FiFileText className="absolute left-3 top-3 text-slate-400" />
                        <input 
                            type="text" 
                            className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            value={saleRef}
                            onChange={e => setSaleRef(e.target.value)}
                            placeholder="INV-XXXX"
                        />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Customer</label>
                    <div className="relative">
                        <FiUser className="absolute left-3 top-3 text-slate-400" />
                        <select 
                            className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none"
                            value={customerId}
                            onChange={e => setCustomerId(e.target.value)}
                        >
                            <option value="" disabled>Select Customer</option>
                            {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.name}</option>)}
                        </select>
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Warehouse</label>
                    <div className="relative">
                        <FiMapPin className="absolute left-3 top-3 text-slate-400" />
                        <select 
                            className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none"
                            value={warehouseId}
                            onChange={e => setWarehouseId(e.target.value)}
                        >
                            <option value="" disabled>Select Warehouse</option>
                            {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>)}
                        </select>
                    </div>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Reason</label>
                    <input 
                        type="text" 
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="e.g. Defective"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Refund Type</label>
                    <select 
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={refundType}
                        onChange={e => setRefundType(e.target.value)}
                    >
                        <option>Cash</option>
                        <option>Credit Note</option>
                        <option>Exchange</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Status</label>
                    <select 
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={returnStatusField}
                        onChange={e => setReturnStatusField(e.target.value)}
                    >
                        <option>Draft</option>
                        <option>Confirmed</option>
                        <option>Cancelled</option>
                    </select>
                 </div>
            </div>

            {/* Items */}
            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 text-lg">Items to Return</h3>
                    <button 
                        onClick={addItem}
                        className="text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200"
                    >
                        + Add Item
                    </button>
                 </div>
                 
                 <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                         <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-5/12">Product</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-2/12">Qty</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-2/12">Refund Price</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-2/12">Subtotal</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-1/12 text-center">Action</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-slate-100 bg-white">
                             {returnItems.map((item, index) => (
                                 <tr key={item.key}>
                                     <td className="px-4 py-2">
                                         <select 
                                            value={item.product_id} 
                                            onChange={e => updateItem(index, "product_id", e.target.value)}
                                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                         >
                                             <option value="" disabled>Select Product...</option>
                                             {products.map(p => (
                                                 <option key={p.product_id} value={p.product_id}>{p.name}</option>
                                             ))}
                                         </select>
                                     </td>
                                     <td className="px-4 py-2">
                                         <input 
                                            type="number" 
                                            min="1"
                                            value={item.qty}
                                            onChange={e => updateItem(index, "qty", e.target.value)}
                                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                         />
                                     </td>
                                     <td className="px-4 py-2">
                                         <input 
                                            type="number" 
                                            min="0"
                                            step="0.01"
                                            value={item.price}
                                            onChange={e => updateItem(index, "price", e.target.value)}
                                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                         />
                                     </td>
                                     <td className="px-4 py-2 text-sm font-semibold text-slate-700">
                                         ${item.subtotal.toFixed(2)}
                                     </td>
                                     <td className="px-4 py-2 text-center">
                                         <button 
                                            onClick={() => removeItem(item.key)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                         >
                                             <FiTrash2 />
                                         </button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                         <tfoot className="bg-slate-50 border-t border-slate-200">
                             <tr>
                                 <td colSpan="3" className="px-4 py-3 text-right font-bold text-slate-600">Total Refund:</td>
                                 <td className="px-4 py-3 font-bold text-red-600 text-lg">${calculateTotal().toFixed(2)}</td>
                                 <td></td>
                             </tr>
                         </tfoot>
                    </table>
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
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-70"
                >
                    {isLoading ? <FiLoader className="animate-spin" /> : <FiCheckCircle />}
                    {editingReturn ? "Update Return" : "Create Return"}
                </button>
            </div>
         </div>
      </Modal>
    </div>
  );
}
