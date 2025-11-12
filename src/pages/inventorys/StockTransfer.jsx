import React, { useState, useEffect } from "react";
import {
  FiPackage,
  FiPlus,
  FiTrash2,
  FiSave,
  FiRefreshCw,
} from "react-icons/fi";

export default function StockTransferPage() {
  const [transfer, setTransfer] = useState({
    from_warehouse_id: "",
    to_warehouse_id: "",
    transfer_date: new Date().toISOString().slice(0, 10), // Default to today
    reference_no: "TRF-2025-0012",
    notes: "",
    items: [],
  });

  // State for warehouses and products, to be fetched from an API
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // Simulate fetching data on component mount
  useEffect(() => {
    // Fetch warehouses
    setWarehouses([
      { id: 1, name: "Main Warehouse" },
      { id: 2, name: "Branch A" },
      { id: 3, name: "Branch B" },
    ]);

    // Fetch products
    setProducts([
      { id: 1, name: "iPhone 15 Pro" },
      { id: 2, name: "Samsung Galaxy S25" },
      { id: 3, name: "MacBook Pro 16-inch" },
    ]);

    // In a real app, you might fetch the next reference number here
    // setTransfer(prev => ({...prev, reference_no: 'TRF-2025-0013'}));
  }, []);

  const handleTransferChange = (field, value) => {
    setTransfer((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    setTransfer((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { product_id: "", product_name: "", quantity: 1, unit: "PCS" },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setTransfer((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setTransfer((prev) => {
      const newItems = prev.items.map((item, i) => {
        if (i !== index) return item;

        const updatedItem = { ...item };
        if (field === "product_id") {
          const selectedProduct = products.find(
            (p) => p.id === parseInt(value)
          );
          updatedItem.product_id = parseInt(value) || "";
          updatedItem.product_name = selectedProduct
            ? selectedProduct.name
            : "";
          updatedItem.unit = selectedProduct ? "PCS" : ""; // Assuming default unit
        } else if (field === "quantity") {
          updatedItem.quantity = parseInt(value, 10) || 0;
        }
        return updatedItem;
      });
      return { ...prev, items: newItems };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Transfer data:", transfer);
    // TODO: Send POST request to /api/stock-transfers
  };

  const handleClear = () => {
    setTransfer({
      from_warehouse_id: "",
      to_warehouse_id: "",
      transfer_date: new Date().toISOString().slice(0, 10),
      reference_no: "TRF-2025-0012", // Or fetch new one
      notes: "",
      items: [],
    });
  };

  // UI: Check for form validity
  const isFormInvalid =
    !transfer.from_warehouse_id ||
    !transfer.to_warehouse_id ||
    transfer.items.length === 0;

  return (
    <div className="p-4 sm:p-6 font-sans">
      <div className=" mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Panel Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <FiPackage className="text-purple-600" />
            Stock Transfer
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the movement of stock between different warehouses.
          </p>
        </div>

        <form onSubmit={handleSave}>
          {/* Section 1: Transfer Details Form */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label
                  htmlFor="from_warehouse"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  From Warehouse
                </label>
                <select
                  id="from_warehouse"
                  className="block w-full p-2 rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={transfer.from_warehouse_id}
                  onChange={(e) =>
                    handleTransferChange("from_warehouse_id", e.target.value)
                  }
                  required
                >
                  <option value="">Select Source</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="to_warehouse"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  To Warehouse
                </label>
                <select
                  id="to_warehouse"
                  className="block w-full p-2 rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={transfer.to_warehouse_id}
                  onChange={(e) =>
                    handleTransferChange("to_warehouse_id", e.target.value)
                  }
                  required
                >
                  <option value="">Select Destination</option>
                  {warehouses
                    .filter(
                      (w) => w.id !== parseInt(transfer.from_warehouse_id)
                    )
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="transfer_date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Transfer Date
                </label>
                <input
                  type="date"
                  id="transfer_date"
                  className="block w-full p-2 rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={transfer.transfer_date}
                  onChange={(e) =>
                    handleTransferChange("transfer_date", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="reference_no"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reference No.
                </label>
                <input
                  type="text"
                  id="reference_no"
                  className="block w-full p-2 rounded-md border border-gray-300 bg-gray-100 shadow-sm focus:outline-none"
                  value={transfer.reference_no}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Section 2: Product Items Table */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Products</h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus /> Add Product
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase w-12">
                      #
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase w-2/5">
                      Product
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase">
                      Quantity
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase">
                      Unit
                    </th>
                    <th className="p-3 text-center text-sm font-semibold text-slate-600 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {transfer.items.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-gray-500">
                        No products have been added for transfer.
                      </td>
                    </tr>
                  ) : (
                    transfer.items.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="p-2 text-center text-slate-500">
                          {index + 1}
                        </td>
                        <td className="p-2">
                          <select
                            value={item.product_id}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "product_id",
                                e.target.value
                              )
                            }
                            className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select Product</option>
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
                              handleItemChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.unit}
                            readOnly
                            className="border p-2 w-full rounded-md bg-slate-100"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                            title="Remove item"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Notes & Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="mb-6">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notes
              </label>
              <textarea
                id="notes"
                className="block w-full p-2 rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Optional notes about the transfer..."
                rows="3"
                value={transfer.notes}
                onChange={(e) => handleTransferChange("notes", e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <FiRefreshCw /> Clear
              </button>
              <button
                type="submit"
                disabled={isFormInvalid}
                className="inline-flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <FiSave />
                Submit Transfer
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
