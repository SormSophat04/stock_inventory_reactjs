import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

// --- SVG Icon Components ---
import {
  FiRefreshCw,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiEdit,
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
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">{children}</div>
      </motion.div>
    </div>
  );
};

// Main ReturnOrders Component
export default function ReturnOrders() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentReturn, setCurrentReturn] = useState(null);
  const [returnItems, setReturnItems] = useState([]);

  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data for dropdowns
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // Form state
  const [saleRef, setSaleRef] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [reason, setReason] = useState("");
  const [refundType, setRefundType] = useState("Cash");

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Simulate fetching data
    setCustomers([
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
    ]);
    setWarehouses([
      { id: 1, name: "Main Warehouse" },
      { id: 2, name: "Secondary Warehouse" },
    ]);
    setProducts([
      { id: 1, name: "Laptop Pro", price: 1200 },
      { id: 2, name: "Smartphone X", price: 800 },
      { id: 3, name: "Wireless Mouse", price: 50 },
    ]);
  }, []);

  const [returns, setReturns] = useState([
    {
      key: 1,
      return_no: "RET-0001",
      sale_ref: "INV-0012",
      customer: "John Doe",
      warehouse: "Main Warehouse",
      total_refund: 50.0,
      status: "Confirmed",
      date: "2025-11-08",
    },
    {
      key: 2,
      return_no: "RET-0002",
      sale_ref: "INV-0014",
      customer: "Jane Smith",
      warehouse: "Main Warehouse",
      total_refund: 120.0,
      status: "Draft",
      date: "2025-11-09",
    },
  ]);

  // Effect to clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Memoized filtered returns
  const filteredReturns = useMemo(() => {
    return returns.filter((ret) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        ret.return_no.toLowerCase().includes(searchTermLower) ||
        ret.customer.toLowerCase().includes(searchTermLower) ||
        ret.date.toLowerCase().includes(searchTermLower);

      const matchesStatus =
        statusFilter === "all" || ret.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [returns, searchTerm, statusFilter]);

  const addItem = () => {
    setReturnItems([
      ...returnItems,
      { key: Date.now(), product_id: "", qty: 1, price: 0, subtotal: 0 },
    ]);
  };

  const removeItem = (key) => {
    setReturnItems(returnItems.filter((i) => i.key !== key));
  };

  const updateItem = (index, field, value) => {
    const key = returnItems[index].key;
    const updated = returnItems.map((item) =>
      item.key === key
        ? {
            ...item,
            [field]: value,
            subtotal:
              field === "qty"
                ? value * item.price
                : field === "price"
                ? item.qty * value
                : item.subtotal,
          }
        : item
    );
    if (field === "product_id") {
      const product = products.find((p) => p.id === parseInt(value));
      updated[index].price = product ? product.price : 0;
      updated[index].subtotal =
        updated[index].qty * (product ? product.price : 0);
    }
    setReturnItems(updated);
  };

  const calculateTotal = () =>
    returnItems.reduce((sum, i) => sum + i.subtotal, 0);

  const resetForm = () => {
    setSaleRef("");
    setCustomerId("");
    setWarehouseId("");
    setReason("");
    setRefundType("Cash");
    setReturnItems([]);
  };

  const handleCreateReturn = async () => {
    // Validation
    if (!saleRef || !customerId || !warehouseId) {
      setNotification({
        type: "error",
        message: "Sale Reference, Customer, and Warehouse are required.",
      });
      return;
    }

    if (returnItems.length === 0) {
      setNotification({
        type: "error",
        message: "Please add at least one returned item.",
      });
      return;
    }

    const customer = customers.find((c) => c.id === parseInt(customerId));
    const warehouse = warehouses.find((w) => w.id === parseInt(warehouseId));

    const total = calculateTotal();
    const newReturn = {
      key: Date.now(),
      return_no: "RET-" + Math.floor(1000 + Math.random() * 9000),
      sale_ref: saleRef,
      customer: customer ? customer.name : "N/A",
      warehouse: warehouse ? warehouse.name : "N/A",
      total_refund: total,
      status: "Draft",
      date: new Date().toISOString().split("T")[0],
    };

    setReturns([...returns, newReturn]);
    setIsModalOpen(false);
    resetForm();
    setNotification({
      type: "success",
      message: "Return order created successfully!",
    });
  };

  const handleEditClick = (returnOrder) => {
    setCurrentReturn(returnOrder);
    // Pre-fill form state
    const customer = customers.find((c) => c.name === returnOrder.customer);
    const warehouse = warehouses.find((w) => w.name === returnOrder.warehouse);

    setSaleRef(returnOrder.sale_ref);
    setCustomerId(customer ? customer.id : "");
    setWarehouseId(warehouse ? warehouse.id : "");
    // For simplicity, we'll start with an empty item list for editing.
    // A real-world scenario might fetch and pre-fill these items.
    setReturnItems([]);
    setReason(""); // Assuming reason is not stored on the main return object
    setRefundType("Cash"); // Reset or load from returnOrder if available

    setIsEditModalOpen(true);
  };

  const handleUpdateReturn = () => {
    if (!currentReturn) return;

    // Validation
    if (!saleRef || !customerId || !warehouseId) {
      setNotification({
        type: "error",
        message: "Sale Reference, Customer, and Warehouse are required.",
      });
      return;
    }

    const customer = customers.find((c) => c.id === parseInt(customerId));
    const warehouse = warehouses.find((w) => w.id === parseInt(warehouseId));
    const total = calculateTotal();

    const updatedReturns = returns.map((r) =>
      r.key === currentReturn.key
        ? {
            ...r,
            sale_ref: saleRef,
            customer: customer ? customer.name : "N/A",
            warehouse: warehouse ? warehouse.name : "N/A",
            total_refund: total,
            // You might want to update other fields like status or date here as well
          }
        : r
    );

    setReturns(updatedReturns);
    setIsEditModalOpen(false);
    setCurrentReturn(null);
    resetForm();
    setNotification({
      type: "success",
      message: "Return order updated successfully!",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Draft":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeleteReturn = (key) => {
    setReturns(returns.filter((r) => r.key !== key));
    setNotification({
      type: "success",
      message: "Return order deleted.",
    });
  };

  return (
    <>
      <Notification
        notification={notification}
        onClear={() => setNotification(null)}
      />
      <motion.div
        className="p-4 sm:p-6 font-inter"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FiRefreshCw className="text-blue-600 w-7 h-7" /> Return Orders
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            + New Return
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Search return no, customer, date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow w-full sm:w-1/3 bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-1/4 bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white shadow-lg rounded-xl overflow-x-auto border border-gray-200">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  "Return No",
                  "Sale Ref",
                  "Customer",
                  "Warehouse",
                  "Total Refund ($)",
                  "Status",
                  "Date",
                  "Actions",
                ].map((title) => (
                  <th
                    key={title}
                    className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReturns.map((ret) => (
                <tr
                  key={ret.key}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {ret.return_no}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-600">
                    {ret.sale_ref}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    {ret.customer}
                  </td>
                  <td className="p-4 whitespace-nowrad text-sm text-gray-700">
                    {ret.warehouse}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${ret.total_refund.toFixed(2)}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                        ret.status
                      )}`}
                    >
                      {ret.status}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-600">
                    {ret.date}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEditClick(ret)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteReturn(ret.key)}
                        className="text-red-600 hover:text-red-800 transition-colors"
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

        {/* Modal */}
        <Modal // Create Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            <>
              <FiRefreshCw className="w-6 h-6" /> Create Return Order
            </>
          }
        >
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sale Reference
              </label>
              <input
                type="text"
                placeholder="INV-0012"
                value={saleRef}
                onChange={(e) => setSaleRef(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>
                  Select a customer
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Return Reason
              </label>
              <input
                type="text"
                placeholder="e.g. Damaged product, wrong item"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Type
              </label>
              <select
                value={refundType}
                onChange={(e) => setRefundType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Cash">Cash</option>
                <option value="Credit Note">Credit Note</option>
                <option value="Exchange">Exchange</option>
              </select>
            </div>
          </div>

          {/* Product Items */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg text-gray-700">
              Returned Items
            </h3>
            <button
              onClick={addItem}
              className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors"
            >
              + Add Product
            </button>
          </div>

          {/* Items Table */}
          <div className="rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 w-1/5 text-left text-xs font-semibold text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="p-3 w-1/5 text-left text-xs font-semibold text-gray-500 uppercase">
                    Qty
                  </th>
                  <th className="p-3 w-1/5 text-left text-xs font-semibold text-gray-500 uppercase">
                    Unit Price ($)
                  </th>
                  <th className="p-3 w-1/5 text-left text-xs font-semibold text-gray-500 uppercase">
                    Subtotal ($)
                  </th>
                  <th className="p-3 w-auto text-left text-xs font-semibold text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {returnItems.map((item, index) => (
                  <tr key={item.key}>
                    <td className="p-2">
                      <select
                        value={item.product_id}
                        onChange={(e) =>
                          updateItem(index, "product_id", e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        min={1}
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "qty",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2 text-sm text-gray-800 font-medium">
                      {item.subtotal.toFixed(2)}
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => removeItem(item.key)}
                        className="bg-red-100 text-red-600 px-2.5 py-1.5 rounded-md text-xs font-semibold hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="text-right mt-5">
            <span className="font-bold text-2xl text-gray-800">
              Total Refund: ${calculateTotal().toFixed(2)}
            </span>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateReturn}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={
            <>
              <FiEdit className="w-6 h-6" /> Edit Return Order
            </>
          }
        >
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sale Reference
              </label>
              <input
                type="text"
                placeholder="INV-0012"
                value={saleRef}
                onChange={(e) => setSaleRef(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>
                  Select a customer
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          </div>

          {/* Items Table (simplified for edit) */}
          <h3 className="font-semibold text-lg text-gray-700 mb-3">
            Update Returned Items (if any)
          </h3>
          <div className="rounded-lg border border-gray-200 overflow-x-auto">
            {/* A full implementation would show and allow editing of existing items */}
            <div className="p-4 text-center text-gray-500">
              Editing of individual return items is not yet implemented.
              <br />
              You can re-add items below to calculate a new total.
            </div>
          </div>

          {/* Total */}
          <div className="text-right mt-5">
            <span className="font-bold text-2xl text-gray-800">
              New Total Refund: ${calculateTotal().toFixed(2)}
            </span>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-200">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateReturn}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </Modal>
      </motion.div>
    </>
  );
}
