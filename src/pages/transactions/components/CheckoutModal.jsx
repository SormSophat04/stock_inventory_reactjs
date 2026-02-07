import React from "react";
import { FiX, FiCheck, FiUser, FiHome, FiCreditCard, FiDollarSign } from "react-icons/fi";

export const CheckoutModal = ({
  isOpen,
  onClose,
  totalAmount,
  customers,
  warehouses,
  selectedCustomer,
  setSelectedCustomer,
  selectedWarehouse,
  setSelectedWarehouse,
  paymentMethod,
  setPaymentMethod,
  onConfirm,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
            <p className="text-gray-500 text-sm mt-1">Complete your sale transaction</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Total Amount Display */}
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                 <FiDollarSign size={24} />
               </div>
               <div>
                 <p className="text-sm text-gray-500 font-medium">Total Payable</p>
                 <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
               </div>
             </div>
             <span className="px-3 py-1 bg-white text-orange-600 text-xs font-bold rounded-full border border-orange-200 uppercase tracking-wide">
               Pending
             </span>
          </div>

          <div className="space-y-4">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiUser className="text-gray-400" /> Customer
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              >
                <option value="" disabled>Select Customer</option>
                {customers.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Warehouse Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                 <FiHome className="text-gray-400" /> Warehouse
              </label>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              >
                <option value="" disabled>Select Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.warehouse_id} value={w.warehouse_id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiCreditCard className="text-gray-400" /> Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['Cash', 'QR Code'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      paymentMethod === method
                        ? 'bg-orange-600 text-white border-orange-600 shadow-md transform scale-[1.02]'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || !selectedWarehouse} // Customer is optional
            className="flex-1 px-4 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
               <>Processing...</>
            ) : (
               <>
                 <FiCheck size={20} /> Confirm Payment
               </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
