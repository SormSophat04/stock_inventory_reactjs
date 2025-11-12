import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiFileText,
  FiPlusCircle,
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
export default function SaleInvoices() {
  const [invoices, setInvoices] = useState([
    {
      sale_invoice_id: 1,
      invoice_no: "INV-0012",
      customer: "John Doe",
      warehouse: "Main Warehouse",
      total: 520.0,
      payment_status: "Paid",
      date: "2025-11-08",
    },
    {
      sale_invoice_id: 2,
      invoice_no: "INV-0013",
      customer: "Jane Smith",
      warehouse: "Secondary Warehouse",
      total: 120.5,
      payment_status: "Unpaid",
      date: "2025-11-10",
    },
    {
      sale_invoice_id: 3,
      invoice_no: "INV-0014",
      customer: "Acme Corp",
      warehouse: "Main Warehouse",
      total: 2300.0,
      payment_status: "Partial",
      date: "2025-11-11",
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Form state
  const [invoiceNo, setInvoiceNo] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [totalAmount, setTotalAmount] = useState(0);

  // Simulate fetching data on component mount
  useEffect(() => {
    setCustomers([
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
      { id: 3, name: "Acme Corp" },
    ]);
    setWarehouses([
      { id: 1, name: "Main Warehouse" },
      { id: 2, name: "Secondary Warehouse" },
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
    setInvoiceNo("");
    setCustomerId("");
    setWarehouseId("");
    setInvoiceDate(new Date().toISOString().split("T")[0]);
    setPaymentStatus("Unpaid");
    setTotalAmount(0);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmitNewInvoice = () => {
    if (!invoiceNo || !customerId || !warehouseId || totalAmount <= 0) {
      setNotification({
        type: "error",
        message:
          "Invoice #, Customer, Warehouse, and valid Total are required.",
      });
      return;
    }

    const customer = customers.find((c) => c.id === parseInt(customerId));
    const warehouse = warehouses.find((w) => w.id === parseInt(warehouseId));

    const newInvoice = {
      sale_invoice_id: Date.now(),
      invoice_no: invoiceNo,
      customer: customer ? customer.name : "N/A",
      warehouse: warehouse ? warehouse.name : "N/A",
      date: invoiceDate,
      payment_status: paymentStatus,
      total: totalAmount,
    };

    setInvoices([newInvoice, ...invoices]);
    setIsModalOpen(false);
    setNotification({
      type: "success",
      message: "Sale invoice created successfully!",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Partial":
        return "bg-yellow-100 text-yellow-800";
      case "Unpaid":
        return "bg-red-100 text-red-800";
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
                  Sale Invoices
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Manage and track all customer invoices.
                </p>
              </div>
              <button
                onClick={handleOpenModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all w-full sm:w-auto"
              >
                <FiPlusCircle size={18} /> New Invoice
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 sm:p-8 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search invoice #, customer..."
                className="flex-grow w-full sm:w-1/3 bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select className="w-full sm:w-1/4 bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {invoices.length === 0 ? (
              <div className="text-center text-slate-500 py-10">
                <h3 className="text-lg font-semibold">
                  No Sale Invoices Found
                </h3>
                <p className="mt-1 text-sm">
                  Get started by creating a new sale invoice.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "Invoice #",
                        "Customer",
                        "Warehouse",
                        "Date",
                        "Payment Status",
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
                    {invoices.map((inv) => (
                      <tr
                        key={inv.sale_invoice_id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-3 text-sm font-medium text-indigo-700">
                          {inv.invoice_no}
                        </td>
                        <td className="p-3 text-sm text-slate-600">
                          {inv.customer}
                        </td>
                        <td className="p-3 text-sm text-slate-600">
                          {inv.warehouse}
                        </td>
                        <td className="p-3 text-sm text-slate-600">
                          {inv.date}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                              inv.payment_status
                            )}`}
                          >
                            {inv.payment_status}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-right font-semibold text-slate-700">
                          ${inv.total.toFixed(2)}
                        </td>
                        <td className="p-3">
                          <button className="inline-flex items-center gap-1.5 py-1 px-3 rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-all">
                            View
                          </button>
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

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <>
            <FiPlusCircle className="w-6 h-6" /> New Sale Invoice
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Invoice #
            </label>
            <input
              type="text"
              placeholder="INV-0015"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Customer Name
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              Invoice Date
            </label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Unpaid</option>
              <option>Partial</option>
              <option>Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Total Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={totalAmount}
              onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
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
            onClick={handleSubmitNewInvoice}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md hover:bg-green-700 transition-colors"
          >
            Create Invoice
          </button>
        </div>
      </Modal>
    </>
  );
}
