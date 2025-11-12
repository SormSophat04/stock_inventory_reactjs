import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiFileText,
  FiPlusCircle,
  FiCheckCircle,
  FiX,
  FiAlertCircle,
  FiTrash2,
} from "react-icons/fi";

// Notification Component
const Notification = ({ notification, onClear }) => {
  if (!notification) return null;
  const { type, message } = notification;
  const isSuccess = type === "success";
  const bgColor = isSuccess ? "bg-green-600" : "bg-red-600";
  const Icon = isSuccess ? FiCheckCircle : FiAlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`fixed top-5 left-1/2 z-50 flex items-center gap-3 p-4 rounded-lg shadow-xl text-white ${bgColor}`}
    >
      <Icon className="text-2xl" />
      <span className="font-medium">{message}</span>
      <button onClick={onClear} className="ml-2">
        <FiX className="text-xl" />
      </button>
    </motion.div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }} // Changed from max-w-3xl to max-w-5xl
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FiX className="text-2xl" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </motion.div>
    </div>
  );
};

// Main Component
export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([
    {
      purchase_order_id: 1,
      po_number: "PO-1001",
      supplier: { name: "Tech Supplies Inc." },
      warehouse: { name: "Main Warehouse" },
      order_date: "2025-11-05",
      expected_date: "2025-11-15",
      status: "Pending",
      total_cost: 1500.0,
    },
    {
      purchase_order_id: 2,
      po_number: "PO-1002",
      supplier: { name: "Office Goods Co." },
      warehouse: { name: "Secondary Warehouse" },
      order_date: "2025-11-01",
      expected_date: "2025-11-10",
      status: "Received",
      total_cost: 450.0,
    },
    {
      purchase_order_id: 3,
      po_number: "PO-1003",
      supplier: { name: "MegaCorp Ltd." },
      warehouse: { name: "Main Warehouse" },
      order_date: "2025-11-10",
      expected_date: "2025-11-20",
      status: "Pending",
      total_cost: 8200.0,
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Mock data for dropdowns
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  // Form state
  const [poNumber, setPoNumber] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [expectedDate, setExpectedDate] = useState("");

  // Simulate fetching data
  useEffect(() => {
    setSuppliers([
      { id: 1, name: "Tech Supplies Inc." },
      { id: 2, name: "Office Goods Co." },
      { id: 3, name: "MegaCorp Ltd." },
    ]);
    setWarehouses([
      { id: 1, name: "Main Warehouse" },
      { id: 2, name: "Secondary Warehouse" },
    ]);
    setProducts([
      { id: 1, name: "Laptop Pro", cost_price: 900 },
      { id: 2, name: "Smartphone X", cost_price: 600 },
      { id: 3, name: "Wireless Mouse", cost_price: 25 },
    ]);
  }, []);

  // Notification timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const resetForm = () => {
    setPoNumber("");
    setSupplierId("");
    setWarehouseId("");
    setOrderDate(new Date().toISOString().split("T")[0]);
    setExpectedDate("");
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
      const product = products.find((p) => p.id === parseInt(value));
      item.product_id = value;
      item.cost_price = product ? product.cost_price : 0;
    } else {
      item[field] = value;
    }

    item.subtotal = item.quantity * item.cost_price;
    setOrderItems(newItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleReceive = (orderId) => {
    setOrders(
      orders.map((order) =>
        order.purchase_order_id === orderId
          ? { ...order, status: "Received" }
          : order
      )
    );
    setNotification({
      type: "success",
      message: `PO #${orderId} marked as Received!`,
    });
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmitNewOrder = () => {
    if (!poNumber || !supplierId || !warehouseId) {
      setNotification({
        type: "error",
        message: "PO #, Supplier, and Warehouse are required.",
      });
      return;
    }

    if (orderItems.length === 0) {
      setNotification({
        type: "error",
        message: "Please add at least one item to the order.",
      });
      return;
    }
    const supplier = suppliers.find((s) => s.id === parseInt(supplierId));
    const warehouse = warehouses.find((w) => w.id === parseInt(warehouseId));
    const totalCost = calculateTotal();

    const newOrder = {
      purchase_order_id: Date.now(),
      po_number: poNumber,
      supplier: { name: supplier ? supplier.name : "N/A" },
      warehouse: { name: warehouse ? warehouse.name : "N/A" },
      order_date: orderDate,
      expected_date: expectedDate || "—",
      status: "Pending",
      total_cost: totalCost, // Calculated total
    };

    setOrders([newOrder, ...orders]);
    setIsModalOpen(false);
    setNotification({
      type: "success",
      message: "Purchase order created successfully!",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Received":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <>
      <Notification
        notification={notification}
        onClear={() => setNotification(null)}
      />
      <motion.div
        className="p-4 sm:p-6 font-sans"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Card Header */}
          <div className="p-6 sm:p-8 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                  <FiFileText className="text-indigo-600 w-7 h-7" />
                  Purchase Orders
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Manage and track all purchase orders from suppliers.
                </p>
              </div>
              <button
                onClick={handleOpenModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all w-full sm:w-auto"
              >
                <FiPlusCircle size={18} /> New Purchase Order
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 sm:p-8 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search PO #, supplier..."
                className="flex-grow w-full sm:w-1/3 bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select className="w-full sm:w-1/4 bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Received">Received</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {orders.length === 0 ? (
              <div className="text-center text-slate-500 py-10">
                <h3 className="text-lg font-semibold">
                  No Purchase Orders Found
                </h3>
                <p className="mt-1 text-sm">
                  Get started by creating a new purchase order.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "PO Number",
                        "Supplier",
                        "Warehouse",
                        "Order Date",
                        "Expected Date",
                        "Status",
                        "Total",
                        "Actions",
                      ].map((head) => (
                        <th
                          key={head}
                          className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {orders.map((order) => (
                      <tr
                        key={order.purchase_order_id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-3 text-sm font-medium text-indigo-700">
                          {order.po_number}
                        </td>
                        <td className="p-3 text-sm text-slate-600">
                          {order.supplier?.name}
                        </td>
                        <td className="p-3 text-sm text-slate-600">
                          {order.warehouse?.name}
                        </td>
                        <td className="p-3 text-sm text-slate-600">
                          {order.order_date}
                        </td>
                        <td className="p-3 text-sm text-slate-600">
                          {order.expected_date || "—"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-right font-semibold text-slate-700">
                          ${order.total_cost.toFixed(2)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {order.status !== "Received" && (
                              <button
                                onClick={() =>
                                  handleReceive(order.purchase_order_id)
                                }
                                className="inline-flex items-center gap-1.5 py-1 px-3 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all"
                              >
                                <FiCheckCircle size={14} /> Receive
                              </button>
                            )}
                            <button className="inline-flex items-center gap-1.5 py-1 px-3 rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-all">
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Create PO Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <>
            <FiPlusCircle className="w-6 h-6" /> New Purchase Order
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              PO Number
            </label>
            <input
              type="text"
              placeholder="PO-1004"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Supplier Name
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="" disabled>
                Select a supplier
              </option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Warehouse
            </label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="" disabled>
                Select a warehouse
              </option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Order Date
            </label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Expected Date
            </label>
            <input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg text-slate-700">
              Order Items
            </h3>
            <button
              onClick={addItem}
              className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors"
            >
              + Add Item
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 w-2/5 text-left text-xs font-semibold text-slate-500 uppercase">
                    Product
                  </th>
                  <th className="p-3 w-1/5 text-left text-xs font-semibold text-slate-500 uppercase">
                    Qty
                  </th>
                  <th className="p-3 w-1/5 text-left text-xs font-semibold text-slate-500 uppercase">
                    Cost ($)
                  </th>
                  <th className="p-3 w-1/5 text-left text-xs font-semibold text-slate-500 uppercase">
                    Subtotal ($)
                  </th>
                  <th className="p-3 w-auto text-center text-xs font-semibold text-slate-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orderItems.map((item, index) => (
                  <tr key={item.key}>
                    <td className="p-2">
                      <select
                        value={item.product_id}
                        onChange={(e) =>
                          updateItem(index, "product_id", e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="" disabled>
                          Select a product
                        </option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.cost_price}
                        onChange={(e) =>
                          updateItem(index, "cost_price", e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-2 text-sm text-slate-800 font-medium">
                      {item.subtotal.toFixed(2)}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => removeItem(item.key)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-right mt-5 text-2xl font-bold text-slate-800">
          Total: ${calculateTotal().toFixed(2)}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-200">
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitNewOrder}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md hover:bg-green-700 transition-colors"
          >
            Create PO
          </button>
        </div>
      </Modal>
    </>
  );
}
