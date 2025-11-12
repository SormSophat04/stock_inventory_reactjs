import React, { useState, useEffect } from "react";
import { FiFileText, FiX, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";

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

// Main SaleOrders Component
export default function SaleOrders() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderItems, setOrderItems] = useState([]);

  // Mock data - in a real app, fetch this from an API
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // State for new order form
  const [customer, setCustomer] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  // State for notifications
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '...' }

  useEffect(() => {
    // Simulate fetching data
    setCustomers([
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
      { id: 3, name: "Walk-in Customer" },
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

  // Effect to clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const [orders, setOrders] = useState([
    {
      key: 1,
      invoice_no: "INV-0001",
      customer: "John Doe",
      warehouse: "Main Warehouse",
      total: 320.0,
      status: "Draft",
      date: "2025-11-08",
    },
  ]);

  // Calculate total
  const calculateTotal = () =>
    orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Add product row
  const addItem = () => {
    setOrderItems([
      ...orderItems,
      {
        key: Date.now(),
        product_id: "",
        quantity: 1,
        price: 0,
        subtotal: 0,
      },
    ]);
  };

  // Remove product row
  const removeItem = (key) => {
    setOrderItems(orderItems.filter((item) => item.key !== key));
  };

  // Update quantity or price
  const updateItem = (index, field, value) => {
    const key = orderItems[index].key;
    const updated = orderItems.map((item) =>
      item.key === key
        ? {
            ...item,
            [field]: value,
            subtotal:
              field === "quantity"
                ? value * item.price
                : field === "price"
                ? item.quantity * value
                : item.subtotal,
          }
        : item
    );
    if (field === "product_id") {
      const product = products.find((p) => p.id === parseInt(value));
      updated[index].price = product ? product.price : 0;
      updated[index].subtotal =
        updated[index].quantity * (product ? product.price : 0);
    }
    setOrderItems(updated);
  };

  // Handle submit
  const handleCreateOrder = () => {
    // Validation
    if (!customer || !warehouse) {
      setNotification({
        type: "error",
        message: "Customer and Warehouse are required.",
      });
      return;
    }

    if (orderItems.length === 0) {
      setNotification({
        type: "error",
        message: "Please add at least one product.",
      });
      return;
    }

    const total = calculateTotal();
    const newOrder = {
      key: Date.now(),
      invoice_no: "INV-" + Math.floor(1000 + Math.random() * 9000),
      customer:
        customers.find((c) => c.id === parseInt(customer))?.name || "N/A",
      warehouse:
        warehouses.find((w) => w.id === parseInt(warehouse))?.name || "N/A",
      total,
      status: "Draft",
      date: new Date().toISOString().split("T")[0],
    };

    setOrders([...orders, newOrder]);
    setIsModalOpen(false);

    // Reset form
    setCustomer("");
    setWarehouse("");
    setPaymentMethod("Cash");
    setOrderItems([]);

    setNotification({
      type: "success",
      message: "Sale order created successfully!",
    });
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
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
            <FiFileText className="text-blue-600" /> Sale Orders
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            + New Sale Order
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Search invoice, customer, date..."
            className="flex-grow w-full sm:w-1/3 bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select className="w-full sm:w-1/4 bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow-lg rounded-xl overflow-x-auto border border-gray-200">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  "Invoice No",
                  "Customer",
                  "Warehouse",
                  "Total ($)",
                  "Status",
                  "Date",
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
              {orders.map((order) => (
                <tr
                  key={order.key}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {order.invoice_no}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-700">
                    {order.customer}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-700">
                    {order.warehouse}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-600">
                    {order.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          <>
            <FiFileText /> Create Sale Order
          </>
        }
      >
        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer
            </label>
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
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
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Transfer">Transfer</option>
              <option value="Credit">Credit</option>
            </select>
          </div>
        </div>

        {/* Product Items */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-lg text-gray-700">Products</h3>
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
              {orderItems.map((item, index) => (
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
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
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
            Total: ${calculateTotal().toFixed(2)}
          </span>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-200">
          <button
            onClick={handleCloseModal}
            className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateOrder}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors"
          >
            Create
          </button>
        </div>
      </Modal>
    </>
  );
}
