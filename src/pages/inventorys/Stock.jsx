import React from "react";
import InventoryTable from "./components/InventoryTable";

const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="text-3xl font-semibold text-gray-900 mt-2">{value}</p>
  </div>
);

function Stock() {
  return (
    <div className="p-2">
      {/* <h1 className="text-2xl font-semibold text-gray-900 mb-4">Inventory</h1> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Stock Value" value="$8,13,456.25" />
        <StatCard title="Total Products" value="367" />
        <StatCard title="Low Stock Products" value="150" />
        <StatCard title="Out of Stock Products" value="82" />
      </div>

      <InventoryTable />
    </div>
  );
}

export default Stock;
