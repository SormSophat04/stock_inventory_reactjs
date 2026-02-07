import React from "react";
import { FiRefreshCw, FiX, FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";

// Process Return Modal Component
export const ProcessReturnModal = ({
  isOpen,
  onClose,
  sales,
  onSubmit,
  returnItems,
  setReturnItems,
  selectedSaleForReturn,
  setSelectedSaleForReturn,
  returnReason,
  setReturnReason,
  refundType,
  setRefundType,
}) => {
  if (!isOpen) return null;

  const handleSelectSale = (sale) => {
    setSelectedSaleForReturn(sale);
    // Auto-populate return items from sale items
    const items = sale.items?.map((item) => ({
      key: Date.now() + Math.random(),
      product_id: item.product_id,
      product_name: item.product?.name || "Unknown Product",
      qty: item.quantity,
      max_qty: item.quantity,
      price: item.sell_price,
      subtotal: item.quantity * item.sell_price,
    })) || [];
    setReturnItems(items);
  };

  const updateReturnItem = (key, field, value) => {
    setReturnItems(
      returnItems.map((item) => {
        if (item.key === key) {
          const updated = { ...item, [field]: value };
          if (field === "qty") {
            updated.subtotal = value * item.price;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const removeReturnItem = (key) => {
    setReturnItems(returnItems.filter((item) => item.key !== key));
  };

  const calculateTotal = () => {
    return returnItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSubmit = () => {
    if (!selectedSaleForReturn) {
      alert("Please select a sale to process return");
      return;
    }
    if (returnItems.length === 0) {
      alert("Please add at least one item to return");
      return;
    }
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiRefreshCw className="text-blue-600" />
            Process Return Order
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {!selectedSaleForReturn ? (
            <>
              <h3 className="text-lg font-semibold mb-4">Select Sale to Return</h3>
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {sales.slice(0, 20).map((sale) => (
                  <div
                    key={sale.sale_id}
                    onClick={() => handleSelectSale(sale)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {sale.invoice_no}
                        </p>
                        <p className="text-sm text-gray-600">
                          Customer: {sale.customer?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Date: {sale.sale_date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-800">
                          ${parseFloat(sale.total_amount || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sale.items?.length || 0} items
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Selected Sale Info */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Sale: {selectedSaleForReturn.invoice_no}
                    </p>
                    <p className="text-sm text-gray-600">
                      Customer: {selectedSaleForReturn.customer?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSaleForReturn(null);
                      setReturnItems([]);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Change Sale
                  </button>
                </div>
              </div>

              {/* Return Details Form */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Reason
                  </label>
                  <input
                    type="text"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="e.g., Defective, Wrong item"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refund Type
                  </label>
                  <select
                    value={refundType}
                    onChange={(e) => setRefundType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit Note">Credit Note</option>
                    <option value="Exchange">Exchange</option>
                  </select>
                </div>
              </div>

              {/* Return Items Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Subtotal
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {returnItems.map((item) => (
                      <tr key={item.key} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {item.product_name}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                updateReturnItem(
                                  item.key,
                                  "qty",
                                  Math.max(1, item.qty - 1)
                                )
                              }
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <FiMinus size={14} />
                            </button>
                            <input
                              type="number"
                              value={item.qty}
                              onChange={(e) =>
                                updateReturnItem(
                                  item.key,
                                  "qty",
                                  Math.min(
                                    item.max_qty,
                                    Math.max(1, parseInt(e.target.value) || 1)
                                  )
                                )
                              }
                              className="w-16 text-center px-2 py-1 border border-gray-300 rounded"
                              min="1"
                              max={item.max_qty}
                            />
                            <button
                              onClick={() =>
                                updateReturnItem(
                                  item.key,
                                  "qty",
                                  Math.min(item.max_qty, item.qty + 1)
                                )
                              }
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <FiPlus size={14} />
                            </button>
                          </div>
                          <p className="text-xs text-center text-gray-500 mt-1">
                            Max: {item.max_qty}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-800">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">
                          ${item.subtotal.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeReturnItem(item.key)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="flex justify-end">
                <div className="bg-gray-50 px-6 py-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Refund</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ${calculateTotal().toFixed(2)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {selectedSaleForReturn && (
          <div className="flex justify-end gap-3 p-5 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Process Return
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
