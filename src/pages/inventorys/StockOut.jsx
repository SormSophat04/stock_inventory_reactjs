import React, { useState, useEffect, useMemo } from "react";
import {
  FiShoppingCart,
  FiPlus,
  FiTrash2,
  FiSave,
  FiRefreshCw,
} from "react-icons/fi";

/**
 * A modern, responsive form for recording stock-out (sales/dispatch) transactions.
 * It features dynamic item rows, total calculation, and clean UI.
 */
export default function StockOutPage() {
  const [items, setItems] = useState([
    { product_id: "", product_name: "", quantity: 1, price: 0 },
  ]);

  // State for customers and warehouses, to be fetched from an API
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // Combined state for sale details
  const [sale, setSale] = useState({
    customer_id: "",
    warehouse_id: "",
    invoice_no: "INV-2025-0015",
    payment_method: "Cash",
    payment_status: "Paid",
    sale_date: new Date().toISOString().slice(0, 10), // Default to today
  });

  // Simulate fetching data on component mount
  useEffect(() => {
    // In a real app, you'd fetch this from an API
    // e.g., fetch('/api/customers').then(res => res.json()).then(setCustomers)
    setCustomers([
      { id: 1, name: "CyberMart Solutions" },
      { id: 2, name: "Quantum Innovations" },
      { id: 3, name: "Apex Global" },
      { id: 4, name: "Nexus Retail" },
    ]);

    setWarehouses([
      { id: 1, name: "Main Warehouse - A" },
      { id: 2, name: "Secondary Warehouse - B" },
    ]);

    // Fetch products
    setProducts([
      { id: 1, name: "iPhone 15 Pro" },
      { id: 2, name: "Samsung Galaxy S25" },
      { id: 3, name: "MacBook Pro 16-inch" },
    ]);
    // You might also fetch the next sequential invoice number
    // e.g., fetch('/api/sales/next-invoice-no')...
  }, []);

  // Calculate the grand total whenever the items list changes
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }, [items]);

  /**
   * Adds a new, empty item row to the list.
   */
  const handleAddRow = () => {
    setItems([
      ...items,
      { product_id: "", product_name: "", quantity: 1, price: 0 },
    ]);
  };

  /**
   * Removes an item row by its index.
   * @param {number} index - The index of the item row to remove.
   */
  const handleRemoveRow = (index) => {
    // Prevent removing the last row
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  /**
   * Updates a specific field for a specific item row.
   * @param {number} index - The index of the item row.
   * @param {string} field - The key of the item property to update (e.g., 'quantity').
   * @param {string|number} value - The new value.
   */
  const handleItemChange = (index, field, value) => {
    setItems((prevItems) => {
      const newItems = prevItems.map((item, i) => {
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
      return newItems;
    });
  };

  /**
   * Updates a field in the main sale details state.
   * @param {string} field - The key of the sale property to update (e.g., 'customer_id').
   * @param {string|number} value - The new value.
   */
  const handleSaleChange = (field, value) => {
    setSale((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Handles saving the form.
   * @param {React.FormEvent} e - The form submit event.
   */
  const handleSave = (e) => {
    // Prevent the default form submission which reloads the page
    e.preventDefault();

    console.log("Saving Sale:", { ...sale, items, total });
    // TODO: Add API call to save the sale
    // Example:
    // try {
    //   const response = await api.post('/sales', { ...sale, items, total });
    //   console.log('Sale saved!', response.data);
    //   handleClear(); // Clear form on success
    // } catch (error) {
    //   console.error('Failed to save sale:', error);
    // }
  };

  /**
   * Resets the form to its initial state.
   */
  const handleClear = () => {
    setItems([{ product_id: "", product_name: "", quantity: 1, price: 0 }]);
    setSale((prev) => ({
      ...prev,
      customer_id: "",
      warehouse_id: "",
      sale_date: new Date().toISOString().slice(0, 10),
      payment_method: "Cash",
      payment_status: "Paid",
      // Keep the invoice number as it might be fetched, or reset if needed
      // invoice_no: "INV-2025-0016"
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
      <div className=" mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Card Header */}
        <div className="p-6 sm:p-8 border-b border-slate-200">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <FiShoppingCart className="text-indigo-600" />
            Stock-Out (Sales / Dispatch)
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Record product dispatches and sales transactions.
          </p>
        </div>

        <form onSubmit={handleSave}>
          {/* Sale Details Section */}
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold leading-6 text-slate-900 mb-6">
              Sale Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="customer_id"
                  className="block text-sm font-medium leading-6 text-slate-700 mb-2"
                >
                  Customer
                </label>
                <select
                  id="customer_id"
                  className="block w-full rounded-lg border-0 py-2.5 px-3.5 bg-slate-50 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-150"
                  value={sale.customer_id}
                  onChange={(e) =>
                    handleSaleChange("customer_id", e.target.value)
                  }
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="warehouse_id"
                  className="block text-sm font-medium leading-6 text-slate-700 mb-2"
                >
                  Warehouse
                </label>
                <select
                  id="warehouse_id"
                  className="block w-full rounded-lg border-0 py-2.5 px-3.5 bg-slate-50 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-150"
                  value={sale.warehouse_id}
                  onChange={(e) =>
                    handleSaleChange("warehouse_id", e.target.value)
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
                  htmlFor="sale_date"
                  className="block text-sm font-medium leading-6 text-slate-700 mb-2"
                >
                  Sale Date
                </label>
                <input
                  type="date"
                  id="sale_date"
                  className="block w-full rounded-lg border-0 py-2.5 px-3.5 bg-slate-50 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-150"
                  value={sale.sale_date}
                  onChange={(e) =>
                    handleSaleChange("sale_date", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label
                  htmlFor="invoice_no"
                  className="block text-sm font-medium leading-6 text-slate-700 mb-2"
                >
                  Invoice No
                </label>
                <input
                  type="text"
                  id="invoice_no"
                  className="block w-full rounded-lg border-0 py-2.5 px-3.5 bg-slate-100 font-medium text-slate-500 ring-1 ring-inset ring-slate-200 focus:ring-1 focus:ring-inset focus:ring-slate-200 sm:text-sm sm:leading-6"
                  value={sale.invoice_no}
                  readOnly
                />
              </div>

              <div>
                <label
                  htmlFor="payment_method"
                  className="block text-sm font-medium leading-6 text-slate-700 mb-2"
                >
                  Payment Method
                </label>
                <select
                  id="payment_method"
                  className="block w-full rounded-lg border-0 py-2.5 px-3.5 bg-slate-50 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-150"
                  value={sale.payment_method}
                  onChange={(e) =>
                    handleSaleChange("payment_method", e.target.value)
                  }
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Credit">Credit</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="payment_status"
                  className="block text-sm font-medium leading-6 text-slate-700 mb-2"
                >
                  Payment Status
                </label>
                <select
                  id="payment_status"
                  className="block w-full rounded-lg border-0 py-2.5 px-3.5 bg-slate-50 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-150"
                  value={sale.payment_status}
                  onChange={(e) =>
                    handleSaleChange("payment_status", e.target.value)
                  }
                  required
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
            </div>
          </div>

          {/* Items Table Section */}
          <div className="p-6 sm:p-8 border-t border-slate-200">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold leading-6 text-slate-900">
                Items
              </h2>
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
              >
                <FiPlus /> Add Item
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-2/5">
                      Product
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-6 text-center text-slate-500"
                      >
                        No items have been added yet.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-2 text-center text-sm text-slate-500">
                          {index + 1}
                        </td>
                        <td className="p-2">
                          <select
                            type="number" // Changed to number for product_id
                            value={item.product_id}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "product_id",
                                e.target.value
                              )
                            }
                            className="block w-full rounded-md border-0 py-1.5 px-2.5 bg-white text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
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
                            className="block w-full rounded-md border-0 py-1.5 px-2.5 bg-white text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
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
                            className="block w-full rounded-md border-0 py-1.5 px-2.5 bg-white text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
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
                              className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-all"
                              title="Remove row"
                            >
                              <FiTrash2 size={16} />
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

          {/* Card Footer */}
          <div className="p-6 bg-slate-50 rounded-b-xl border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="text-right sm:text-left">
                <span className="text-base font-medium text-slate-600">
                  Grand Total:
                </span>
                <span className="text-3xl font-bold tracking-tight text-slate-900 ml-2">
                  {formatCurrency(total)}
                </span>
              </div>
              <div className="flex space-x-3 justify-end">
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex justify-center items-center gap-2 py-2 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all"
                >
                  <FiRefreshCw size={16} /> Clear
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  <FiSave size={16} /> Save Sale
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
