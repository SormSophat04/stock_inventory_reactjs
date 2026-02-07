import React, { useState, useEffect } from "react";
import InventoryTable from "./components/InventoryTable";
import api from "../../api/axios";

const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="text-3xl font-semibold text-gray-900 mt-2">{value}</p>
  </div>
);

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

function Stock() {
  const [stats, setStats] = useState({
    total_stock_value: 0,
    total_products: 0,
    low_stock_products: 0,
    out_of_stock_products: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get("/stocks/stats");
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch inventory statistics.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-2">
      {/* <h1 className="text-2xl font-semibold text-gray-900 mb-4">Inventory</h1> */}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Stock Value"
          value={loading ? "..." : formatCurrency(stats.total_stock_value)}
        />
        <StatCard
          title="Total Products"
          value={loading ? "..." : stats.total_products}
        />
        <StatCard
          title="Low Stock Products"
          value={loading ? "..." : stats.low_stock_products}
        />
        <StatCard
          title="Out of Stock Products"
          value={loading ? "..." : stats.out_of_stock_products}
        />
      </div>

      <InventoryTable />
    </div>
  );
}

export default Stock;
