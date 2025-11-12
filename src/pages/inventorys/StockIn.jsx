import React, { useState, useEffect, useMemo } from "react";
import { FiLogIn, FiPlus, FiSave, FiTrash2, FiRefreshCw } from "react-icons/fi";

export default function StockIn() {
  const [items, setItems] = useState([
    { product_id: "", product_name: "", quantity: 1, price: 0 },
  ]);

  // State for suppliers and warehouses, to be fetched from an API
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // Combined state for purchase details
  const [purchase, setPurchase] = useState({
    supplier_id: "",
    warehouse_id: "",
    purchase_date: new Date().toISOString().slice(0, 10), // Default to today
    invoice_no: "INV-2025-0011",
  });

  // Simulate fetching data on component mount
  useEffect(() => {
    // Fetch suppliers
    setSuppliers([
      { id: 1, name: "ABC Supplies" },
      { id: 2, name: "Global Traders" },
      { id: 3, name: "Tech Parts Inc." },
    ]);

    // Fetch warehouses
    setWarehouses([
      { id: 1, name: "Main Warehouse" },
      { id: 2, name: "Branch A" },
    ]);

    // Fetch products
    setProducts([
      { id: 1, name: "iPhone 15 Pro" },
      { id: 2, name: "Samsung Galaxy S25" },
      { id: 3, name: "MacBook Pro 16-inch" },
    ]);
  }, []);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }, [items]);

  const handleAddRow = () => {
    setItems([
      ...items,
      { product_id: "", product_name: "", quantity: 1, price: 0 },
    ]);
  };

  const handleRemoveRow = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = items.map((item, i) => {
      if (i !== index) return item;

      const updatedItem = { ...item };
      if (field === "product_id") {
        const selectedProduct = products.find((p) => p.id === parseInt(value));
        updatedItem.product_id = parseInt(value) || "";
        updatedItem.product_name = selectedProduct ? selectedProduct.name : "";
      } else {
        const numericValue = ["quantity", "price"].includes(field)
          ? parseFloat(value) || 0
          : value;
        updatedItem[field] = numericValue;
      }
      return updatedItem;
    });
    setItems(newItems);
  };

  const handlePurchaseChange = (field, value) => {
    setPurchase((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Saving Purchase:", { ...purchase, items, total });
    // TODO: Add API call to save the purchase
  };

  const handleClear = () => {
    setItems([{ product_id: "", product_name: "", quantity: 1, price: 0 }]);
    setPurchase((prev) => ({
      ...prev,
      supplier_id: "",
      warehouse_id: "",
      purchase_date: new Date().toISOString().slice(0, 10),
    }));
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="p-4 sm:p-6 font-sans">
      <div className="mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Panel Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <FiLogIn className="text-green-600" />
            Stock-In (Purchase Entry)
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter purchase details from a supplier to add new stock.
          </p>
        </div>
        <form onSubmit={handleSave}>
          {/* Section 1: Purchase Details Form */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label
                  htmlFor="supplier"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Supplier
                </label>
                <select
                  id="supplier"
                  className="block w-full p-2 rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={purchase.supplier_id}
                  onChange={(e) =>
                    handlePurchaseChange("supplier_id", e.target.value)
                  }
                  required
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="warehouse"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Warehouse
                </label>
                <select
                  id="warehouse"
                  className="block w-full p-2 rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={purchase.warehouse_id}
                  onChange={(e) =>
                    handlePurchaseChange("warehouse_id", e.target.value)
                  }
                  required
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="purchase_date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Purchase Date
                </label>
                <input
                  type="date"
                  id="purchase_date"
                  value={purchase.purchase_date}
                  onChange={(e) =>
                    handlePurchaseChange("purchase_date", e.target.value)
                  }
                  className="block w-full p-2 rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="invoice_no"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Invoice No
                </label>
                <input
                  type="text"
                  id="invoice_no"
                  value={purchase.invoice_no}
                  readOnly
                  className="block w-full p-2 rounded-md border border-gray-300 bg-gray-100 shadow-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Product Items Table */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Items</h2>
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus /> Add Item
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase w-2/5">
                      Product
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase">
                      Quantity
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 uppercase">
                      Price
                    </th>
                    <th className="p-3 text-right text-sm font-semibold text-slate-600 uppercase">
                      Subtotal
                    </th>
                    <th className="p-3 text-center text-sm font-semibold text-slate-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-gray-500">
                        No items have been added.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
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
                            value={item.quantity}
                            min="1"
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.price}
                            min="0"
                            step="0.01"
                            onChange={(e) =>
                              handleItemChange(index, "price", e.target.value)
                            }
                            className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-2 text-right text-sm text-slate-700 font-medium">
                          {formatCurrency(item.quantity * item.price)}
                        </td>
                        <td className="p-2 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(index)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                              title="Remove row"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Summary & Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="text-right sm:text-left">
                <span className="text-base font-medium text-slate-600">
                  Grand Total:
                </span>
                <span className="text-3xl font-bold tracking-tight text-slate-900 ml-2">
                  {formatCurrency(total)}
                </span>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <FiRefreshCw /> Clear
                </button>
                <button
                  type="submit"
                  onClick={handleSave}
                  className="inline-flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <FiSave />
                  Save Purchase
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
