import React from "react";

const TransactionRow = ({
  id,
  product,
  category,
  price,
  stock,
  sales,
  status,
}) => {
  const statusColor =
    status === "Completed"
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="py-3 px-4 text-sm text-gray-600">{id}</td>
      <td className="py-3 px-4 text-sm font-medium text-gray-900">{product}</td>
      <td className="py-3 px-4 text-sm text-gray-600">{category}</td>
      <td className="py-3 px-4 text-sm text-gray-600">
        ${price.toLocaleString()}
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">{stock}</td>
      <td className="py-3 px-4 text-sm text-gray-600">
        ${sales.toLocaleString()}
      </td>
      <td className="py-3 px-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
        >
          {status}
        </span>
      </td>
    </tr>
  );
};

const RecentTransactionsTable = () => {
  const transactions = [
    {
      id: 1,
      product: "Macbook M2...",
      category: "Tech Gadget",
      price: 1200,
      stock: 120,
      sales: 72000,
      status: "Completed",
    },
    {
      id: 2,
      product: "iPhone 13...",
      category: "Tech Gadget",
      price: 990,
      stock: 10,
      sales: 12000,
      status: "Pending",
    },
    {
      id: 3,
      product: "Airpods...",
      category: "Tech Gadget",
      price: 599,
      stock: 56,
      sales: 21000,
      status: "Completed",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Recent Transactions
        </h2>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left">
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">ID</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Product Name</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Stock</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Sales</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} {...tx} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Placeholder */}
      <div className="flex justify-between items-center mt-6 text-sm">
        <p className="text-gray-600">Showing 1 to 3 of 10 Result</p>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50" disabled>Previous</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded-md">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">2</button>
          <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">3</button>
          <span className="text-gray-500">...</span>
          <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">10</button>
          <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">Next</button>
        </div>
      </div>
    </div>
  );
};

export default RecentTransactionsTable;
