import React from "react";

const TopCategories = () => {
  const categories = [
    { name: "iPhone 14", value: 351 },
    { name: "Macbook M2", value: 651 },
    { name: "iMac", value: 30 },
    { name: "iPad", value: 50 },
    { name: "Air Watch", value: 551 },
    { name: "iPhone 14 Pro", value: 141 },
    { name: "iPhone 13", value: 695 },
    { name: "Airpods", value: 693 },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Top Categories</h2>
        <button className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-md hover:bg-gray-200">
          Last 6 Months
        </button>
      </div>
      <p className="text-center text-gray-400 my-4">[Radar Chart Placeholder]</p>
      {/* A real radar chart is complex. 
          For this demo, I'll show the data as a list.
        */}
      <ul className="space-y-3 mt-4 h-64 overflow-y-auto">
        {categories
          .sort((a, b) => b.value - a.value)
          .map((cat) => (
            <li key={cat.name} className="flex justify-between items-center text-sm">
              <span className="text-gray-700">{cat.name}</span>
              <span className="font-medium text-gray-900">{cat.value}</span>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default TopCategories;
