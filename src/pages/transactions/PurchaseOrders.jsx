import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiFileText,
  FiPlus,
  FiCheckCircle,
  FiX,
  FiAlertCircle,
  FiTrash2,
  FiLoader,
  FiEdit2,
  FiSearch,
  FiFilter,
  FiShoppingBag,
  FiCalendar,
  FiUser,
  FiMapPin
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
  updatePurchaseStatus,
  selectPurchaseStatus,
  selectPurchaseError,
  selectAllPurchases,
  clearPurchaseError
} from "../../redux/slices/purchaseSlice";
import { fetchSuppliers, selectAllSuppliers, selectSupplierStatus } from "../../redux/slices/supplierSlice";
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
    Received: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
    Paid: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
    Pending: "bg-amber-100 text-amber-700 ring-amber-600/20",
    Unpaid: "bg-amber-100 text-amber-700 ring-amber-600/20",
    Ordered: "bg-blue-100 text-blue-700 ring-blue-600/20",
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

export default function PurchaseOrdersPage() {
  const dispatch = useDispatch();
  
  // Redux State
  const orders = useSelector(selectAllPurchases);
  const suppliers = useSelector(selectAllSuppliers);
  const warehouses = useSelector(selectAllWarehouses);
  const products = useSelector(selectAllProducts);
  const productStatus = useSelector(selectProductStatus);
  const supplierStatus = useSelector(selectSupplierStatus);
  const warehouseStatus = useSelector(selectWarehouseStatus);
  const status = useSelector(selectPurchaseStatus);
  const error = useSelector(selectPurchaseError);

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form State
  const [poNumber, setPoNumber] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [orderItems, setOrderItems] = useState([]);

  // --- Effects ---
  useEffect(() => {
    dispatch(fetchPurchases());
    dispatch(fetchSuppliers());
    dispatch(fetchWarehouses());
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
       let errorMessage = "An error occurred";
       if (typeof error === 'string') {
         errorMessage = error;
       } else if (typeof error === 'object') {
         errorMessage = error.message || JSON.stringify(error);
       }
       setNotification({ type: 'error', message: errorMessage });
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
    setPoNumber(`PO-${Math.floor(1000 + Math.random() * 9000)}`); // Auto-gen suggestion
    setSupplierId("");
    setWarehouseId("");
    setOrderDate(new Date().toISOString().split("T")[0]);
    setOrderItems([]);
  };

  const addItem = () => {
    setOrderItems([
      ...orderItems,
      {
        key: Date.now(),
        product_id: "",
        quantity: 1,
        cost_price: 0,
        subtotal: 0,
      },
    ]);
  };

  const removeItem = (key) => {
    setOrderItems(orderItems.filter((item) => item.key !== key));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...orderItems];
    const item = newItems[index];

    if (field === "product_id") {
      const product = products.find((p) => p.product_id === parseInt(value));
      item.product_id = value;
      item.cost_price = product ? (parseFloat(product.cost_price) || 0) : 0;
    } else {
      item[field] = value;
    }

    item.subtotal = item.quantity * item.cost_price;
    setOrderItems(newItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleReceive = async (orderId) => {
    if (!window.confirm("Mark as Received? This will update stock levels.")) return;
    try {
      await dispatch(updatePurchaseStatus({ id: orderId, status: "Received" })).unwrap();
      setNotification({ type: "success", message: "Order received & stock updated!" });
    } catch {
      setNotification({ type: "error", message: "Failed to mark order as received." });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order? Action cannot be undone.")) return;
    try {
      await dispatch(deletePurchase(orderId)).unwrap();
      setNotification({ type: "success", message: "Order deleted successfully." });
    } catch {
      setNotification({ type: "error", message: "Failed to delete order." });
    }
  };

  const handleOpenModal = (order = null) => {
    if (order) {
      setEditingOrder(order);
      setPoNumber(order.invoice_no);
      setSupplierId(order.supplier_id);
      setWarehouseId(order.warehouse_id);
      setOrderDate(order.purchase_date);
      setOrderItems((order.items || []).map(item => ({
        ...item,
        key: item.purchase_item_id || Math.random(),
        product_id: item.product_id,
        quantity: item.quantity,
        cost_price: item.cost_price,
        subtotal: item.quantity * item.cost_price
      })));
    } else {
      resetForm();
      setEditingOrder(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!poNumber || !supplierId || !warehouseId) {
      setNotification({ type: "error", message: "Please fill in all required fields." });
      return;
    }
    if (orderItems.length === 0) {
      setNotification({ type: "error", message: "Add at least one item." });
      return;
    }
    if (orderItems.some(i => !i.product_id)) {
        setNotification({ type: "error", message: "Select a product for all items." });
        return;
    }

    const payload = {
      invoice_no: poNumber,
      supplier_id: parseInt(supplierId),
      warehouse_id: parseInt(warehouseId),
      purchase_date: orderDate,
      items: orderItems.map((item) => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity),
        cost_price: parseFloat(item.cost_price),
      })),
    };

    try {
      if (editingOrder) {
        await dispatch(updatePurchase({ id: editingOrder.purchase_id, data: payload })).unwrap();
        setNotification({ type: "success", message: "Order updated successfully." });
      } else {
        await dispatch(createPurchase(payload)).unwrap();
        setNotification({ type: "success", message: "Order created successfully." });
      }
      setIsModalOpen(false);
    } catch {
      setNotification({ type: "error", message: "Failed to create order." });
    }
  };

  // Filtering
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.invoice_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isLoading = status === 'loading' || productStatus === 'loading' || supplierStatus === 'loading' || warehouseStatus === 'loading';

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
                <FiShoppingBag size={24} />
             </div>
             Purchase Orders
          </h1>
          <p className="mt-2 text-slate-500">Manage procurement and incoming stock.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow-xl shadow-slate-200 transition-all transform hover:scale-[1.02]"
        >
          <FiPlus size={20} />
          <span>New Order</span>
        </button>
      </div>

      {/* Stats Cards (Mock Data for Visuals) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-slate-900">{orders.length}</p>
         </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Pending</h3>
            <p className="text-3xl font-bold text-amber-500">{orders.filter(o => o.payment_status === 'Pending').length}</p>
         </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Received</h3>
            <p className="text-3xl font-bold text-emerald-500">{orders.filter(o => o.payment_status === 'Received').length}</p>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Value</h3>
            <p className="text-3xl font-bold text-indigo-600">
                ${orders.reduce((acc, o) => acc + parseFloat(o.total_amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                placeholder="Search PO # or Supplier..." 
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
                    <option value="Pending">Pending</option>
                    <option value="Received">Received</option>
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
                {["PO Number", "Supplier", "Warehouse", "Order Date", "Status", "Total", "Action"].map((h) => (
                  <th key={h} className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {isLoading && orders.length === 0 ? (
                    <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                             <LoadingSpinner message="Loading orders..." />
                        </td>
                    </tr>
                ) : filteredOrders.length === 0 ? (
                    <tr>
                         <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                            No orders found matching your criteria.
                        </td>
                    </tr>
                ) : filteredOrders.map((order) => (
                    <tr key={order.purchase_id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                            {order.invoice_no}
                        </td>
                         <td className="px-6 py-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                    {order.supplier?.name?.charAt(0) || "S"}
                                </div>
                                {order.supplier?.name}
                            </div>
                        </td>
                         <td className="px-6 py-4 text-sm text-slate-600">
                             {order.warehouse?.name}
                        </td>
                         <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(order.purchase_date).toLocaleDateString()}
                        </td>
                         <td className="px-6 py-4">
                            <StatusBadge status={order.payment_status || "Pending"} />
                        </td>
                         <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                             ${parseFloat(order.total_amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handleOpenModal(order)}
                                    className="p-1.5 text-indigo-600 hover:bg-white bg-indigo-50 rounded-lg transition-colors shadow-sm"
                                    title="Edit"
                                >
                                    <FiEdit2 size={16} />
                                </button>
                                 {(order.payment_status !== "Received" && order.payment_status !== "Paid") && (
                                     <button 
                                        onClick={() => handleReceive(order.purchase_id)}
                                        className="p-1.5 text-emerald-600 hover:bg-white bg-emerald-50 rounded-lg transition-colors shadow-sm"
                                        title="Mark Received"
                                     >
                                        <FiCheckCircle size={16} />
                                     </button>
                                 )}
                                <button 
                                     onClick={() => handleDeleteOrder(order.purchase_id)}
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
            {editingOrder ? <FiEdit2 className="text-indigo-500" /> : <FiPlus className="text-indigo-500" />}
            {editingOrder ? "Edit Purchase Order" : "Create Purchase Order"}
          </>
        }
      >
         <div className="space-y-8">
            {/* Top Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">PO Number</label>
                    <input 
                        type="text" 
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={poNumber}
                        onChange={e => setPoNumber(e.target.value)}
                        placeholder="PO-XXXX"
                    />
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
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Order Date</label>
                    <div className="relative">
                         <FiCalendar className="absolute left-3 top-3 text-slate-400" />
                         <input 
                            type="date" 
                            className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            value={orderDate}
                            onChange={e => setOrderDate(e.target.value)}
                        />
                    </div>
                 </div>
            </div>

            {/* Items Section */}
            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 text-lg">Order Items</h3>
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
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-2/12">Quantity</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-2/12">Cost ($)</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-2/12">Subtotal</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-1/12 text-center">Action</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-slate-100 bg-white">
                             {orderItems.map((item, index) => (
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
                                            value={item.quantity}
                                            onChange={e => updateItem(index, "quantity", e.target.value)}
                                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                         />
                                     </td>
                                     <td className="px-4 py-2">
                                         <input 
                                            type="number" 
                                            min="0"
                                            step="0.01"
                                            value={item.cost_price}
                                            onChange={e => updateItem(index, "cost_price", e.target.value)}
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
                             {orderItems.length === 0 && (
                                 <tr>
                                     <td colSpan="5" className="px-4 py-8 text-center text-slate-400 italic">
                                         No items added. Click "Add Item" to start.
                                     </td>
                                 </tr>
                             )}
                         </tbody>
                         <tfoot className="bg-slate-50 border-t border-slate-200">
                             <tr>
                                 <td colSpan="3" className="px-4 py-3 text-right font-bold text-slate-600">Total:</td>
                                 <td className="px-4 py-3 font-bold text-indigo-600 text-lg">${calculateTotal().toFixed(2)}</td>
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
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? <FiLoader className="animate-spin" /> : <FiCheckCircle />}
                    {editingOrder ? "Update Order" : "Create Order"}
                </button>
            </div>
         </div>
      </Modal>
    </div>
  );
}
