import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiCreditCard,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
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
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
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
        <div className="p-6 overflow-y-auto">{children}</div>
      </motion.div>
    </div>
  );
};

// Custom Switch Component
const Switch = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`${
      checked ? "bg-blue-600" : "bg-gray-200"
    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
  >
    <span
      className={`${
        checked ? "translate-x-6" : "translate-x-1"
      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
    />
  </button>
);

// Main PaymentMethods Component
export default function PaymentMethods() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([
    {
      key: 1,
      name: "Cash",
      type: "Cash",
      account_info: "—",
      used_for: "Sales & Purchases",
      status: true,
    },
    {
      key: 2,
      name: "ABA Bank",
      type: "Bank Transfer",
      account_info: "ABA-001234567",
      used_for: "Sales Only",
      status: false,
    },
  ]);
  const [notification, setNotification] = useState(null);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [accountInfo, setAccountInfo] = useState("");
  const [usedFor, setUsedFor] = useState("Sales & Purchases");
  const [status, setStatus] = useState(true);

  // Effect to clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const resetForm = () => {
    setName("");
    setType("");
    setAccountInfo("");
    setUsedFor("Sales & Purchases");
    setStatus(true);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    if (!name || !type) {
      setNotification({
        type: "error",
        message: "Name and Type are required.",
      });
      return;
    }

    const newMethod = {
      key: Date.now(),
      name,
      type,
      account_info: accountInfo || "—",
      used_for: usedFor,
      status,
    };
    setPaymentMethods([...paymentMethods, newMethod]);
    setIsModalOpen(false);
    setNotification({
      type: "success",
      message: "Payment method created successfully!",
    });
  };

  const toggleStatus = (key) => {
    setPaymentMethods(
      paymentMethods.map((m) =>
        m.key === key ? { ...m, status: !m.status } : m
      )
    );
  };

  const handleDelete = (key) => {
    setPaymentMethods(paymentMethods.filter((m) => m.key !== key));
    setNotification({
      type: "success",
      message: "Method deleted.",
    });
  };

  return (
    <>
      <Notification
        notification={notification}
        onClear={() => setNotification(null)}
      />
      <motion.div
        className="p-4 sm:p-6  font-inter"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FiCreditCard className="text-blue-600 w-7 h-7" /> Payment Methods
          </h1>
          <button
            onClick={openModal}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            + New Method
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by name or type..."
            className="flex-grow w-full sm:w-1/3 bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select className="w-full sm:w-1/4 bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white shadow-lg rounded-xl overflow-x-auto border border-gray-200">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  "Name",
                  "Type",
                  "Account Info",
                  "Used For",
                  "Status",
                  "Action",
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
              {paymentMethods.map((method) => (
                <tr
                  key={method.key}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {method.name}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-700">
                    {method.type}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-700">
                    {method.account_info}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-700">
                    {method.used_for}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <Switch
                      checked={method.status}
                      onChange={() => toggleStatus(method.key)}
                    />
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(method.key)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal: Add Payment Method */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            <>
              <FiCreditCard className="w-6 h-6" /> Add Payment Method
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method Name
              </label>
              <input
                type="text"
                placeholder="e.g. Cash, ABA Bank"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select type
                </option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="e-Wallet">e-Wallet</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Info
              </label>
              <input
                type="text"
                placeholder="Account number or wallet ID"
                value={accountInfo}
                onChange={(e) => setAccountInfo(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Used For
              </label>
              <select
                value={usedFor}
                onChange={(e) => setUsedFor(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Sales Only">Sales Only</option>
                <option value="Purchases Only">Purchases Only</option>
                <option value="Sales & Purchases">Sales & Purchases</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="flex items-center gap-3">
                <Switch checked={status} onChange={() => setStatus(!status)} />
                <span className="text-sm text-gray-600">
                  {status ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
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
              onClick={handleCreate}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
          </div>
        </Modal>
      </motion.div>
    </>
  );
}
