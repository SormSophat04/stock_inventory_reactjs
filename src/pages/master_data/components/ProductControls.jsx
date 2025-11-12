import React from 'react';
import { FaTable, FaList, FaFilter, FaSearch } from 'react-icons/fa';

function ProductControls({ activeTab, setActiveTab, activeView, setActiveView }) {
  const tabs = ['All', 'Active', 'Non Active'];
  const viewButtons = [
    { name: 'Table', icon: FaTable },
    { name: 'Columns', icon: FaList },
    { name: 'Filter', icon: FaFilter },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Tabs */}
        <div className="flex border border-gray-200 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${activeTab === tab 
                  ? 'bg-gray-100 text-gray-800 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'}
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* View and Search Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex border border-gray-200 rounded-lg p-1">
            {viewButtons.map(btn => (
              <button
                key={btn.name}
                onClick={() => setActiveView(btn.name)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${activeView === btn.name 
                    ? 'bg-gray-100 text-gray-800 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50'}
                `}
              >
                <btn.icon />
                <span>{btn.name}</span>
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search Product"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductControls;
